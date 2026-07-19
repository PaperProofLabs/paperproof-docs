// Copyright (c) 2026 PaperProof Labs
// SPDX-License-Identifier: Apache-2.0

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { preflightJsonFiles } from './lib/publish-runtime.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const LABS_ROOT = path.resolve(DOCS_ROOT, '..');
const SDK_ROOT = path.join(LABS_ROOT, 'paperproof-sdk-ts');
const APP_ROOT = path.join(LABS_ROOT, 'paperproof-app');
const CONTRACTS_ENV = path.join(LABS_ROOT, 'paperproof-contracts', 'jstest', '.env');
const DOCS_HOME = path.join(DOCS_ROOT, 'homepages', 'docs');
const MANIFEST_PATH = path.join(DOCS_HOME, 'manifest.json');
const APP_MANIFEST_PATH = path.join(LABS_ROOT, 'paperproof-app', 'public', 'docs', 'manifest.json');
const ARTIFACTS_DIR = path.join(DOCS_ROOT, 'artifacts');
const CHECKPOINT_PATH = path.join(ARTIFACTS_DIR, 'paperproof-docs-publish-checkpoint.json');
const CONTENT_TYPE = 'application/vnd.paperproof.markdown-package+zip';
const LICENSE = 'LicenseRef-PaperProof-Docs-Source-Available';
const ZERO = `0x${'0'.repeat(64)}`;
let deps;
let JSZipCtor;

async function importFromSdk(specifier) {
  const requireFromSdk = createRequire(path.join(SDK_ROOT, 'package.json'));
  return import(pathToFileURL(requireFromSdk.resolve(specifier)).href);
}

function loadJSZip() {
  if (JSZipCtor) return JSZipCtor;
  const requireFromApp = createRequire(path.join(APP_ROOT, 'package.json'));
  JSZipCtor = requireFromApp('jszip');
  return JSZipCtor;
}

async function loadDeps() {
  if (deps) return deps;
  const [cryptography, grpc, jsonRpc, ed25519, walrusModule, sdk] = await Promise.all([
    importFromSdk('@mysten/sui/cryptography'),
    importFromSdk('@mysten/sui/grpc'),
    importFromSdk('@mysten/sui/jsonRpc'),
    importFromSdk('@mysten/sui/keypairs/ed25519'),
    importFromSdk('@mysten/walrus'),
    import(pathToFileURL(path.join(SDK_ROOT, 'dist', 'index.js')).href),
  ]);
  deps = {
    decodeSuiPrivateKey: cryptography.decodeSuiPrivateKey,
    SuiGrpcClient: grpc.SuiGrpcClient,
    SuiJsonRpcClient: jsonRpc.SuiJsonRpcClient,
    Ed25519Keypair: ed25519.Ed25519Keypair,
    walrus: walrusModule.walrus,
    ...sdk,
  };
  return deps;
}

async function createWalrusClient(rpcUrl) {
  const { SuiGrpcClient, walrus } = await loadDeps();
  return new SuiGrpcClient({ baseUrl: rpcUrl, network: 'mainnet' }).$extend(
    walrus({
      network: 'mainnet',
      uploadRelay: {
        host: 'https://upload-relay.mainnet.walrus.space',
        sendTip: { max: 5_000_000 },
      },
    }),
  );
}

async function writeJsonFile(filePath, value) {
  const { stringifyForJson } = await loadDeps();
  await fs.writeFile(filePath, `${stringifyForJson(value)}\n`, 'utf8');
}

async function waitFor(predicate, { attempts = 8, delayMs = 1_500, label = 'condition' } = {}) {
  let lastValue;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastValue = await predicate();
    if (lastValue) return lastValue;
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

function usage() {
  return `
Publish official PaperProof Docs as generic_file artifacts.

Usage:
  node scripts/publish-docs.mjs
  node scripts/publish-docs.mjs --run --account=4
  node scripts/publish-docs.mjs --run --account=4 --skip-walrus

Default mode validates sources only. --run writes Sui mainnet transactions.
The script publishes initial docs, locks comment trees, writes mapping lines,
then publishes a second version containing those mappings.
`.trim();
}

function parseArgs(argv) {
  const raw = argv.slice(2);
  const set = new Set(raw);
  const argValue = (name, fallback) => raw.find((item) => item.startsWith(`${name}=`))?.split('=')[1] ?? fallback;
  return {
    run: set.has('--run'),
    help: set.has('--help') || set.has('-h'),
    skipWalrus: set.has('--skip-walrus'),
    repairVersions: set.has('--repair-versions'),
    only: (argValue('--only', '') || '')
      .split(',')
      .map((item) => item.trim().replace(/\\/g, '/'))
      .filter(Boolean),
    account: Number(argValue('--account', '4')),
    batchSize: Math.max(1, Number(argValue('--batch-size', '1'))),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeAddress(value) {
  const raw = String(value ?? '').trim().toLowerCase().replace(/^"|"$/g, '');
  const noPrefix = raw.startsWith('0x') ? raw.slice(2) : raw.startsWith('x') ? raw.slice(1) : raw;
  return `0x${noPrefix.padStart(64, '0')}`;
}

function parseEnv(text) {
  const values = new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values.set(match[1], value);
  }
  return values;
}

async function loadAccount(index) {
  const { decodeSuiPrivateKey, Ed25519Keypair } = await loadDeps();
  const env = parseEnv(await fs.readFile(CONTRACTS_ENV, 'utf8'));
  const address = normalizeAddress(env.get(`ADDR_${index}`));
  const secret = env.get(`PRIVATE_KEY_${index}`);
  if (!secret) throw new Error(`Missing PRIVATE_KEY_${index} in ${CONTRACTS_ENV}.`);
  const decoded = decodeSuiPrivateKey(secret);
  assert(decoded.scheme === 'ED25519', `ADDR_${index} must use an Ed25519 key.`);
  const signer = Ed25519Keypair.fromSecretKey(decoded.secretKey);
  assert(normalizeAddress(signer.toSuiAddress()) === address, `ADDR_${index} signer mismatch.`);
  return { address, signer };
}

function toSdkResponse(execution) {
  return {
    events: (execution.events ?? []).map((event) => ({
      type: event.type,
      packageId: event.packageId ?? event.type?.split('::')[0],
      transactionModule: event.transactionModule,
      sender: event.sender,
      parsedJson: event.parsedJson,
    })),
  };
}

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function errorMessage(error) {
  const parts = [];
  let current = error;
  let guard = 0;
  while (current && guard < 5) {
    if (current instanceof Error) {
      if (current.message) parts.push(current.message);
      current = current.cause;
    } else {
      parts.push(String(current));
      break;
    }
    guard += 1;
  }
  return parts.filter(Boolean).join(' | ') || 'Unknown error';
}

function shouldFallbackToManualWalrus(error) {
  const text = errorMessage(error).toLowerCase();
  return text.includes('fetch failed')
    || text.includes('rpcerror')
    || text.includes('getbalance')
    || text.includes('batchgetobjects')
    || text.includes('multigetobjects')
    || text.includes('terminated')
    || text.includes('aborterror')
    || text.includes('connection timeout')
    || text.includes('econnreset')
    || text.includes('tls')
    || text.includes('provided version doesn\'t match')
    || text.includes('provided version does not match')
    || text.includes('rejected as invalid by more than 1/3 of validators by stake')
    || text.includes('unavailable for consumption')
    || text.includes('needs to be rebuilt');
}

function registeredBlobObjectId(execution, fallbackBlobId) {
  const event = (execution.events ?? []).find((item) => item.type?.endsWith('::BlobRegistered'));
  const fromEvent = event?.parsedJson?.object_id ?? event?.parsedJson?.objectId;
  if (typeof fromEvent === 'string' && fromEvent.startsWith('0x')) return fromEvent;

  const createdBlob = (execution.objectChanges ?? []).find(
    (item) => item?.type === 'created' && String(item.objectType ?? '').endsWith('::blob::Blob'),
  );
  if (typeof createdBlob?.objectId === 'string') return createdBlob.objectId;

  throw new Error(`Could not find Walrus blob object id for blob ${fallbackBlobId}.`);
}

async function manualWalrusUpload(getWalrusClient, sui, signer, bytes, label) {
  const attempts = 4;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const walrusClient = await getWalrusClient(true);
      const flow = walrusClient.walrus.writeBlobFlow({ blob: bytes });
      const encoded = await flow.encode();
      const registered = await flow.executeRegister({
        signer,
        client: sui,
        executeClient: sui,
        epochs: 10,
        owner: signer.toSuiAddress(),
        deletable: true,
      });
      const registerDigest = registered.txDigest ?? registered.digest;
      if (!registerDigest) throw new Error('Walrus executeRegister did not return a tx digest.');
      await flow.upload({ digest: registerDigest });
      const certified = await flow.executeCertify({
        signer,
        client: sui,
        executeClient: sui,
      });
      const blobObjectId =
        certified?.blobObjectId
        || certified?.blobObject?.id
        || registered?.blobObjectId
        || registered?.blobObject?.id;
      if (!blobObjectId) throw new Error('Walrus fallback certify/register path did not return a blob object id.');

      return {
        blobId: certified?.blobId || registered?.blobId || encoded.blobId,
        blobObjectId,
      };
    } catch (error) {
      lastError = error;
      const message = errorMessage(error).toLowerCase();
      const retryable = message.includes('provided version doesn\'t match')
        || message.includes('provided version does not match')
        || message.includes('could not find the referenced object')
        || message.includes('unavailable for consumption')
        || message.includes('needs to be rebuilt')
        || message.includes('current version')
        || message.includes('object not found');
      if (!retryable || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1_200 * attempt));
    }
  }

  throw lastError;
}

function metadataAttributes(entries) {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .map(([key, value]) => ({ key, value: String(value).slice(0, 511) }));
}

function collectDocs(manifest) {
  const docs = [];
  for (const section of manifest.sections ?? []) {
    docs.push({
      kind: 'section',
      id: section.id,
      title: section.title,
      summary: section.summary,
      source: section.source,
      target: section,
      sectionId: section.id,
      topicId: '',
    });
    for (const topic of section.topics ?? []) {
      docs.push({
        kind: 'topic',
        id: `${section.id}/${topic.id}`,
        title: topic.title,
        summary: topic.summary,
        source: topic.source,
        target: topic,
        sectionId: section.id,
        topicId: topic.id,
      });
    }
  }
  return docs;
}

function isRemoteOrFragmentUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(value);
}

function normalizePackagePath(value) {
  return String(value ?? '')
    .trim()
    .replace(/^<|>$/g, '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function extractMarkdownAssetPaths(markdown) {
  const paths = new Set();
  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    const assetPath = normalizePackagePath(decodeURIComponent(match[1]));
    if (!assetPath || isRemoteOrFragmentUrl(assetPath)) continue;
    assert(!assetPath.includes('..'), `Unsafe asset path in Markdown: ${assetPath}`);
    assert(assetPath.startsWith('assets/'), `Local docs assets must live under assets/: ${assetPath}`);
    paths.add(assetPath);
  }
  return [...paths].sort();
}

function contentTypeForAsset(assetPath) {
  const ext = path.extname(assetPath).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.avif') return 'image/avif';
  return 'application/octet-stream';
}

function mappingBlock(doc, published) {
  return [
    `Artifact Code: ${published.artifactCode}`,
    `Series ID: ${published.seriesId}`,
    `Comments Tree: locked`,
  ].join('\n');
}

function applyMappingToMarkdown(text, doc, published) {
  const block = mappingBlock(doc, published);
  return text.replace(/Artifact Mapping: pending publication/g, block);
}

async function readDoc(doc, textOverride) {
  const fullPath = path.join(DOCS_HOME, doc.source);
  const text = textOverride ?? await fs.readFile(fullPath, 'utf8');
  const assets = [];
  for (const assetPath of extractMarkdownAssetPaths(text)) {
    const fullAssetPath = path.resolve(DOCS_HOME, assetPath);
    assert(fullAssetPath.startsWith(`${DOCS_HOME}${path.sep}`), `Asset escapes docs root: ${assetPath}`);
    const bytes = await fs.readFile(fullAssetPath);
    assets.push({
      path: assetPath,
      type: contentTypeForAsset(assetPath),
      byteLength: bytes.byteLength,
      sha256: `sha256:${sha256Hex(bytes)}`,
      bytes,
    });
  }
  const JSZip = loadJSZip();
  const zip = new JSZip();
  zip.file('index.md', text);
  zip.file('manifest.json', `${JSON.stringify({
    schemaVersion: 1,
    appKind: 'docs_page',
    entry: 'index.md',
    title: doc.title,
    source: doc.source,
    docId: doc.id,
    contentType: 'text/markdown; charset=utf-8',
    assets: assets.map(({ path, type, byteLength, sha256 }) => ({ path, type, byteLength, sha256 })),
  }, null, 2)}\n`);
  for (const asset of assets) zip.file(asset.path, asset.bytes);
  const bytes = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  return {
    fullPath,
    text,
    bytes,
    assets: assets.map(({ path, type, byteLength, sha256 }) => ({ path, type, byteLength, sha256 })),
    contentHash: `sha256:${sha256Hex(bytes)}`,
  };
}

async function writeDocText(doc, text) {
  await fs.writeFile(path.join(DOCS_HOME, doc.source), text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

async function uploadDoc(getWalrusClient, sui, signer, doc, content, run, skipWalrus, phase) {
  const { robustWalrusWriteBlob } = await loadDeps();
  console.log(`[${phase}] upload ${doc.source} (${content.bytes.length} bytes)`);
  if (!run || skipWalrus) {
    const digest = content.contentHash.replace(/^sha256:/, '').slice(0, 24);
    return {
      blobId: `local-docs-${phase}-${doc.sectionId}-${doc.topicId || 'index'}-${digest}`,
      blobObjectId: `0x${'6'.repeat(64)}`,
      byteLength: content.bytes.length,
    };
  }
  const label = `paperproof-docs-${phase}-${doc.sectionId}-${doc.topicId || 'index'}`.slice(0, 96);
  const attempts = 3;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const walrusClient = await getWalrusClient();
      const upload = await robustWalrusWriteBlob(walrusClient, signer, content.bytes, {
        label,
        fallback: false,
        attempts: 4,
      });
      console.log(`[${phase}] uploaded ${doc.source}: ${upload.blobId}`);
      return {
        blobId: upload.blobId,
        blobObjectId: upload.blobObjectId,
        byteLength: content.bytes.length,
      };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retriable = /walrus upload failed|fetch failed|no balance changes|provided version doesn't match|balance::split|timeout|ecconnreset|tls|503|500|429/i.test(message);
      if (shouldFallbackToManualWalrus(error)) {
        console.warn(`[${phase}] switching to manual Walrus fallback for ${doc.source}: ${message}`);
        return manualWalrusUpload(getWalrusClient, sui, signer, content.bytes, label);
      }
      if (!retriable || attempt === attempts) throw error;
      console.warn(`[${phase}] retry Walrus upload ${doc.source} (${attempt}/${attempts}): ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 1_500 * attempt));
    }
  }
  throw lastError;
}

async function execute(sui, signer, tx, label, run, sender) {
  const { robustExecuteTransaction } = await loadDeps();
  const createTx = () => (typeof tx === 'function' ? tx() : tx);
  if (!run) {
    const dryRunTx = createTx();
    dryRunTx.setSenderIfNotSet(sender);
    return { digest: null, dryRunBytes: 0, events: [] };
  }
  const attempts = 3;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const currentTx = createTx();
    currentTx.setSenderIfNotSet(sender);
    try {
      console.log(`[tx] ${label}${attempt > 1 ? ` (retry ${attempt}/${attempts})` : ''}`);
      const result = await robustExecuteTransaction(sui, signer, currentTx, label);
      console.log(`[tx] confirmed ${label}: ${result.digest}`);
      return result;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const rebuildable = /needs to be rebuilt|unavailable for consumption|current version/i.test(message);
      if (!rebuildable || attempt === attempts) throw error;
      console.warn(`[tx] rebuild and retry ${label}: ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    }
  }
  throw lastError;
}

function publishInput(doc, content, upload, phase) {
  return {
    title: doc.title,
    description: doc.summary,
    filename: doc.source,
    fileSize: content.bytes.length,
    license: LICENSE,
    contentHash: content.contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: CONTENT_TYPE,
    seriesMetadata: metadataAttributes({
      app: 'paperproof-docs',
      doc_role: doc.kind,
      doc_path: doc.source,
      comments: 'locked',
    }),
    versionMetadata: metadataAttributes({
      schema: 'paperproof-docs-markdown-package-v1',
      phase,
      source: doc.source,
      route: doc.topicId ? `/docs/${doc.sectionId}/${doc.topicId}` : `/docs/${doc.sectionId}`,
    }),
  };
}

function addVersionInput(doc, content, upload, published, phase) {
  const input = publishInput(doc, content, upload, phase);
  delete input.seriesMetadata;
  return {
    ...input,
    seriesId: published.seriesId,
  };
}

async function publishInitialDocs({ docs, args, account, sui, getWalrusClient, txb, read, report }) {
  const { ARTIFACT_TYPES, extractPublishResult } = await loadDeps();
  for (const [index, doc] of docs.entries()) {
    console.log(`[publish] ${index + 1}/${docs.length} ${doc.source}`);
    if (doc.target.seriesId && doc.target.commentsTreeId && doc.target.artifactCode) {
      const published = {
        seriesId: doc.target.seriesId,
        versionId: doc.target.initialVersionId ?? ZERO,
        commentsTreeId: doc.target.commentsTreeId,
        likesBookId: doc.target.likesBookId ?? ZERO,
        artifactCode: doc.target.artifactCode,
        artifactType: ARTIFACT_TYPES.genericFile,
      };
      report.docs.push({ source: doc.source, title: doc.title, kind: doc.kind, upload: null, published, reused: true });
      console.log(`[publish] reuse existing ${doc.source}: ${published.artifactCode}`);
      continue;
    }
    const content = await readDoc(doc);
    assert(content.text.includes('Artifact Mapping: pending publication'), `${doc.source} is missing pending publication mapping.`);
    const upload = await uploadDoc(getWalrusClient, sui, account.signer, doc, content, args.run, args.skipWalrus, 'v1');
    const result = await execute(
      sui,
      account.signer,
      () => txb.publishGenericFile(publishInput(doc, content, upload, 'initial')),
      `publish doc ${doc.source}`,
      args.run,
      account.address,
    );
    const published = args.run
      ? extractPublishResult(toSdkResponse(result), read.deployment)
      : {
          seriesId: ZERO,
          versionId: ZERO,
          commentsTreeId: ZERO,
          likesBookId: ZERO,
          artifactCode: `DRY-RUN-${index + 1}`,
          artifactType: ARTIFACT_TYPES.genericFile,
        };
    assert(published.artifactType === ARTIFACT_TYPES.genericFile, `${doc.source} was not published as a generic_file.`);
    Object.assign(doc.target, {
      artifactCode: published.artifactCode,
      seriesId: published.seriesId,
      commentsTreeId: published.commentsTreeId,
      initialVersionId: published.versionId,
      likesBookId: published.likesBookId,
      commentsTreeStatus: 'open',
    });
    report.transactions.push({ label: `publish ${doc.source}`, digest: result.digest, dryRunBytes: result.dryRunBytes });
    report.docs.push({ source: doc.source, title: doc.title, kind: doc.kind, upload, published });
    if (args.run) {
      await writeJsonFile(CHECKPOINT_PATH, report);
      await writeJsonFile(MANIFEST_PATH, report.manifest);
    }
    if (args.run) {
      const series = await read.waitForObject(published.seriesId, { attempts: 8, baseDelayMs: 1_000 });
      assert(series.id === published.seriesId, `Series not readable after publishing ${doc.source}.`);
    }
  }
}

async function lockCommentTrees({ docs, args, account, sui, txb, report }) {
  const { TREE_STATUS } = await loadDeps();
  for (const doc of docs) {
    console.log(`[lock] ${doc.source}`);
    const commentsTreeId = doc.target.commentsTreeId;
    if (!commentsTreeId || commentsTreeId === ZERO) continue;
    if (doc.target.commentsTreeStatus === 'locked') {
      console.log(`[lock] reuse locked ${doc.source}`);
      continue;
    }
    const result = await execute(
      sui,
      account.signer,
      () => txb.comments.setTreeStatus(commentsTreeId, TREE_STATUS.locked),
      `lock comments ${doc.source}`,
      args.run,
      account.address,
    );
    doc.target.commentsTreeStatus = 'locked';
    report.transactions.push({ label: `lock comments ${doc.source}`, digest: result.digest, dryRunBytes: result.dryRunBytes });
    if (args.run) await writeJsonFile(CHECKPOINT_PATH, report);
  }
}

async function publishMappedVersions({ docs, args, account, sui, getWalrusClient, txb, read, report }) {
  const { ARTIFACT_TYPES, extractAddVersionResult } = await loadDeps();
  for (const doc of docs) {
    console.log(`[version] ${doc.source}`);
    if (doc.target.currentVersionId && !args.repairVersions) {
      console.log(`[version] reuse existing mapped version ${doc.source}: ${doc.target.currentVersionId}`);
      continue;
    }
    const published = report.docs.find((item) => item.source === doc.source)?.published ?? {
      seriesId: doc.target.seriesId,
      versionId: doc.target.initialVersionId ?? doc.target.currentVersionId,
      commentsTreeId: doc.target.commentsTreeId,
      likesBookId: doc.target.likesBookId,
      artifactCode: doc.target.artifactCode,
      artifactType: ARTIFACT_TYPES.genericFile,
    };
    assert(published, `Missing initial publication for ${doc.source}.`);
    const before = await readDoc(doc);
    const mappedText = applyMappingToMarkdown(before.text, doc, published);
    if (args.run) await writeDocText(doc, mappedText);
    const content = await readDoc(doc, args.run ? undefined : mappedText);
    const upload = await uploadDoc(getWalrusClient, sui, account.signer, doc, content, args.run, args.skipWalrus, 'v2');
    const result = await execute(
      sui,
      account.signer,
      () => txb.addGenericFileVersion(addVersionInput(doc, content, upload, published, 'mapped')),
      `add mapped doc version ${doc.source}`,
      args.run,
      account.address,
    );
    const added = args.run
      ? extractAddVersionResult(toSdkResponse(result), read.deployment)
      : { seriesId: published.seriesId, versionId: ZERO, artifactType: ARTIFACT_TYPES.genericFile, version: 2n };
    doc.target.currentVersionId = added.versionId;
    doc.target.latestContentHash = content.contentHash;
    doc.target.contentType = CONTENT_TYPE;
    report.transactions.push({ label: `add mapped version ${doc.source}`, digest: result.digest, dryRunBytes: result.dryRunBytes });
    const reportDoc = report.docs.find((item) => item.source === doc.source);
    if (reportDoc) reportDoc.mappedVersion = { upload, added, contentHash: content.contentHash };
    if (args.run) {
      await writeJsonFile(CHECKPOINT_PATH, report);
      await writeJsonFile(MANIFEST_PATH, report.manifest);
    }
    if (args.run) {
      const series = await read.waitForObject(published.seriesId, { attempts: 8, baseDelayMs: 1_000 });
      const view = await waitFor(
        async () => {
          const current = await read.getSeriesView(series.id);
          return current.currentVersionId === added.versionId ? current : null;
        },
        {
          attempts: 8,
          delayMs: 1_500,
          label: `${doc.source} latest version ${added.versionId}`,
        },
      );
      assert(view.currentVersionId === added.versionId, `${doc.source} latest version did not advance.`);
    }
  }
}

async function main() {
  const {
    MAINNET_DEPLOYMENT,
    PaperProofReadClient,
    PaperProofTxBuilder,
    JsonRpcPaperProofProvider,
    SuiGrpcClient,
    SuiJsonRpcClient,
    createDeployment,
    walrus,
  } = await loadDeps();
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    return;
  }

  const sdkPackage = JSON.parse(await fs.readFile(path.join(SDK_ROOT, 'package.json'), 'utf8'));
  await preflightJsonFiles([
    MANIFEST_PATH,
    APP_MANIFEST_PATH,
    path.join(DOCS_ROOT, 'homepages', 'blogs', 'manifest.json'),
    path.join(DOCS_ROOT, 'homepages', 'forums', 'manifest.json'),
  ]);
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  let docs = collectDocs(manifest);
  if (args.only.length) {
    const wanted = new Set(args.only);
    docs = docs.filter((doc) => wanted.has(doc.source.replace(/\\/g, '/')) || wanted.has(doc.id));
    assert(docs.length === wanted.size, `--only matched ${docs.length} docs, expected ${wanted.size}.`);
  } else {
    assert(docs.length > 0, 'Expected at least one doc in the Docs manifest.');
  }

  const account = await loadAccount(args.account);
  const deployment = createDeployment(MAINNET_DEPLOYMENT);
  const sui = new SuiJsonRpcClient({ url: deployment.rpcUrl ?? 'https://fullnode.mainnet.sui.io:443' });
  let walrusClientPromise = null;
  const getWalrusClient = async (fresh = false) => {
    if (fresh || !walrusClientPromise) walrusClientPromise = createWalrusClient(deployment.rpcUrl ?? 'https://fullnode.mainnet.sui.io:443');
    return walrusClientPromise;
  };
  const txb = new PaperProofTxBuilder(deployment);
  const read = new PaperProofReadClient({ client: new JsonRpcPaperProofProvider(sui), deployment });
  const runId = `paperproof-docs-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const report = {
    runId,
    run: args.run,
    accountIndex: args.account,
    sender: account.address,
    sdkVersion: sdkPackage.version,
    deployment,
    docs: [],
    transactions: [],
    manifest,
  };

  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(APP_MANIFEST_PATH), { recursive: true });

  await publishInitialDocs({ docs, args, account, sui, getWalrusClient, txb, read, report });
  await lockCommentTrees({ docs, args, account, sui, txb, report });
  await publishMappedVersions({ docs, args, account, sui, getWalrusClient, txb, read, report });

  manifest.publishedAt = new Date().toISOString();
  manifest.publisher = account.address;
  manifest.sdkVersion = sdkPackage.version;
  if (args.run) {
    await writeJsonFile(MANIFEST_PATH, manifest);
    await writeJsonFile(APP_MANIFEST_PATH, manifest);
  }

  const reportPath = path.join(ARTIFACTS_DIR, `${runId}.json`);
  await writeJsonFile(reportPath, report);
  console.log(`Docs processed: ${docs.length}`);
  console.log(`Report: ${reportPath}`);
  console.log(`App manifest: ${APP_MANIFEST_PATH}`);
  if (!args.run) console.log('Dry run only. Re-run with --run to publish on mainnet.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
