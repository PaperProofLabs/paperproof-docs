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
const BLOGS_HOME = path.join(DOCS_ROOT, 'homepages', 'blogs');
const MANIFEST_PATH = path.join(BLOGS_HOME, 'manifest.json');
const APP_MANIFEST_PATH = path.join(LABS_ROOT, 'paperproof-app', 'public', 'blog', 'manifest.json');
const ARTIFACTS_DIR = path.join(DOCS_ROOT, 'artifacts');
const CHECKPOINT_PATH = path.join(ARTIFACTS_DIR, 'paperproof-blogs-publish-checkpoint.json');
const CONTENT_TYPE = 'application/vnd.paperproof.markdown-package+zip';
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

function usage() {
  return `
Publish official PaperProof Blog posts as blog_post artifacts.

Usage:
  node scripts/publish-blogs.mjs --post=<id>
  node scripts/publish-blogs.mjs --run --account=4 --post=<id>
  node scripts/publish-blogs.mjs --run --account=4 --source=<file>
  node scripts/publish-blogs.mjs --run --account=4 --all

Default mode validates the selected targets only. --run writes Sui mainnet transactions.
You must explicitly select target posts with --post, --source, or --artifact-code.
Use --all only when you intentionally want to process every manifest entry.
Existing manifest entries with seriesId, commentsTreeId, and artifactCode are reused.
`.trim();
}

function collectArgValues(raw, name) {
  const prefix = `${name}=`;
  const values = [];
  for (const item of raw) {
    if (!item.startsWith(prefix)) continue;
    const value = item.slice(prefix.length).trim();
    if (!value) continue;
    for (const part of value.split(',')) {
      const normalized = part.trim();
      if (normalized) values.push(normalized);
    }
  }
  return values;
}

function parseArgs(argv) {
  const raw = argv.slice(2);
  const set = new Set(raw);
  const argValue = (name, fallback) => raw.find((item) => item.startsWith(`${name}=`))?.split('=')[1] ?? fallback;
  return {
    run: set.has('--run'),
    help: set.has('--help') || set.has('-h'),
    skipWalrus: set.has('--skip-walrus'),
    account: Number(argValue('--account', '4')),
    all: set.has('--all'),
    posts: collectArgValues(raw, '--post'),
    sources: collectArgValues(raw, '--source'),
    artifactCodes: collectArgValues(raw, '--artifact-code'),
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

function metadataAttributes(entries) {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .map(([key, value]) => ({ key, value: String(value).slice(0, 511) }));
}

function isControllerOnlySeries(details) {
  const authorityMode = details?.series?.seriesAuthorityMode;
  if (authorityMode != null) return Number(authorityMode) === 3;
  return details?.series?.seriesAuthorityModeName === 'controller_only';
}

function assertControllerOnlySeries(details, label) {
  assert(
    isControllerOnlySeries(details),
    `${label} must be controller_only. Current mode: ${details?.series?.seriesAuthorityModeName ?? 'unknown'}.`,
  );
  assert(details?.series?.seriesControlRecordId, `${label} is missing seriesControlRecordId.`);
  assert(details?.series?.seriesControllerNftId, `${label} is missing seriesControllerNftId.`);
}

function collectPosts(manifest) {
  return (manifest.posts ?? []).map((post, index) => ({
    ...post,
    order: index + 1,
  }));
}

function syncManifestPosts(manifest, updatedPosts) {
  const byId = new Map(updatedPosts.map((post) => [post.id, post]));
  manifest.posts = (manifest.posts ?? []).map((post) => byId.get(post.id) ?? post);
  return manifest;
}

function selectPosts(posts, args) {
  if (args.all) return posts;
  const requestedIds = new Set(args.posts.map((value) => value.trim()).filter(Boolean));
  const requestedSources = new Set(args.sources.map((value) => value.trim()).filter(Boolean));
  const requestedArtifactCodes = new Set(args.artifactCodes.map((value) => value.trim()).filter(Boolean));
  assert(
    requestedIds.size > 0 || requestedSources.size > 0 || requestedArtifactCodes.size > 0,
    'Explicit target selection is required. Use --post, --source, --artifact-code, or --all.',
  );
  const selected = posts.filter((post) =>
    requestedIds.has(post.id)
    || requestedSources.has(post.source)
    || requestedArtifactCodes.has(post.artifactCode),
  );
  assert(selected.length > 0, 'No manifest posts matched the explicit selection.');
  const matchedIds = new Set(selected.map((post) => post.id));
  const matchedSources = new Set(selected.map((post) => post.source));
  const matchedArtifactCodes = new Set(selected.map((post) => post.artifactCode).filter(Boolean));
  for (const id of requestedIds) assert(matchedIds.has(id), `Unknown --post target: ${id}`);
  for (const source of requestedSources) assert(matchedSources.has(source), `Unknown --source target: ${source}`);
  for (const artifactCode of requestedArtifactCodes) assert(matchedArtifactCodes.has(artifactCode), `Unknown --artifact-code target: ${artifactCode}`);
  return selected;
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
    assert(assetPath.startsWith('assets/'), `Local blog assets must live under assets/: ${assetPath}`);
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

async function readPost(post) {
  const fullPath = path.join(BLOGS_HOME, post.source);
  const text = await fs.readFile(fullPath, 'utf8');
  assert(text.startsWith(`# ${post.title}`), `${post.source} title does not match manifest title.`);
  const assets = [];
  for (const assetPath of extractMarkdownAssetPaths(text)) {
    const fullAssetPath = path.resolve(BLOGS_HOME, assetPath);
    assert(fullAssetPath.startsWith(`${BLOGS_HOME}${path.sep}`), `Asset escapes blog root: ${assetPath}`);
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
    appKind: 'blog_post',
    entry: 'index.md',
    title: post.title,
    source: post.source,
    postId: post.id,
    contentType: 'text/markdown; charset=utf-8',
    assets: assets.map(({ path, type, byteLength, sha256 }) => ({ path, type, byteLength, sha256 })),
  }, null, 2)}\n`);
  for (const asset of assets) {
    zip.file(asset.path, asset.bytes);
  }
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

async function uploadPost(walrusClient, signer, post, content, run, skipWalrus) {
  const { robustWalrusWriteBlob } = await loadDeps();
  console.log(`[upload] ${post.source} (${content.bytes.length} bytes)`);
  if (!run || skipWalrus) {
    const digest = content.contentHash.replace(/^sha256:/, '').slice(0, 24);
    return {
      blobId: `local-blog-${post.id}-${digest}`,
      blobObjectId: `0x${'6'.repeat(64)}`,
      byteLength: content.bytes.length,
    };
  }
  const label = `paperproof-blog-${post.id}`.slice(0, 96);
  const attempts = 3;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const upload = await robustWalrusWriteBlob(walrusClient, signer, content.bytes, {
        label,
        fallback: false,
        attempts: 4,
      });
      console.log(`[upload] done ${post.source}: ${upload.blobId}`);
      return {
        blobId: upload.blobId,
        blobObjectId: upload.blobObjectId,
        byteLength: content.bytes.length,
      };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retriable = /walrus upload failed|fetch failed|provided version doesn't match|no balance changes|balance::split|timeout|ecconnreset|tls|503|500|429/i.test(message);
      if (!retriable || attempt === attempts) throw error;
      console.warn(`[upload] retry ${post.source} (${attempt}/${attempts}): ${message}`);
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

function publishInput(post, content, upload) {
  return {
    title: post.title,
    summary: post.summary,
    tags: post.tags ?? [],
    language: post.language ?? 'en',
    contentHash: content.contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: CONTENT_TYPE,
    seriesMetadata: metadataAttributes({
      app: 'paperproof-blog',
      post_id: post.id,
      category: post.category,
    }),
    versionMetadata: metadataAttributes({
      schema: 'paperproof-blog-markdown-v1',
      source: post.source,
      route: `/blog/${post.id}`,
      date: post.date,
    }),
  };
}

async function writeJsonFile(filePath, value) {
  const { stringifyForJson } = await loadDeps();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${stringifyForJson(value)}\n`, 'utf8');
}

async function publishBlogs({ posts, args, account, sui, walrusClient, txb, read, report }) {
  const { ARTIFACT_TYPES, extractAddVersionResult, extractPublishResult } = await loadDeps();
  for (const [index, post] of posts.entries()) {
    console.log(`[publish] ${index + 1}/${posts.length} ${post.source}`);
    const content = await readPost(post);
    const existingHints = [post.seriesId, post.commentsTreeId, post.artifactCode, post.currentVersionId, post.likesBookId].filter(Boolean);
    const existing = Boolean(post.seriesId && post.commentsTreeId && post.artifactCode);
    assert(
      existingHints.length === 0 || existing,
      `${post.source} has partial published metadata. Expected artifactCode + seriesId + commentsTreeId together before reusing an existing series.`,
    );
    const requestedAction = existing ? String(post.publishAction ?? '').trim().toLowerCase() : '';
    assert(
      !requestedAction || requestedAction === 'add-version',
      `${post.source} publishAction must be omitted or "add-version".`,
    );
    if (existing && requestedAction !== 'add-version') {
      console.log(`[publish] skip existing ${post.source}`);
      report.posts.push({
        id: post.id,
        source: post.source,
        title: post.title,
        contentHash: content.contentHash,
        operation: 'skip-existing',
        published: {
          artifactCode: post.artifactCode,
          seriesId: post.seriesId,
          versionId: post.currentVersionId ?? null,
          commentsTreeId: post.commentsTreeId ?? null,
          likesBookId: post.likesBookId ?? null,
        },
      });
      continue;
    }
    const unchanged = existing && requestedAction === 'add-version' && post.latestContentHash === content.contentHash;
    if (unchanged) {
      console.log(`[publish] skip unchanged ${post.source}`);
      report.posts.push({
        id: post.id,
        source: post.source,
        title: post.title,
        contentHash: content.contentHash,
        operation: 'skip-unchanged',
        published: {
          artifactCode: post.artifactCode,
          seriesId: post.seriesId,
          versionId: post.currentVersionId ?? null,
          commentsTreeId: post.commentsTreeId ?? null,
          likesBookId: post.likesBookId ?? null,
        },
      });
      continue;
    }
    const upload = await uploadPost(walrusClient, account.signer, post, content, args.run, args.skipWalrus);
    const input = publishInput(post, content, upload);
    let existingDetails = null;
    if (existing) {
      existingDetails = await read.getSeriesView(post.seriesId);
      assertControllerOnlySeries({ series: existingDetails }, `${post.source} existing blog series`);
    }
    const tx = existing
      ? () => txb.addBlogPostVersion({
          ...input,
          seriesId: post.seriesId,
          controlRecordId: existingDetails.seriesControlRecordId,
          controllerNftId: existingDetails.seriesControllerNftId,
          versionChangeNote: `Official blog update on ${new Date().toISOString()}`,
          versionMetadata: metadataAttributes({
            schema: 'paperproof-blog-markdown-package-v1',
            source: post.source,
            route: `/blog/${post.id}`,
            date: post.date,
          }),
        })
      : () => txb.publishBlogPost(input);
    const result = await execute(sui, account.signer, tx, `${existing ? 'add blog version' : 'publish blog'} ${post.source}`, args.run, account.address);
    const published = args.run
      ? existing
        ? extractAddVersionResult(toSdkResponse(result), read.deployment)
        : extractPublishResult(toSdkResponse(result), read.deployment)
      : {
          seriesId: ZERO,
          versionId: ZERO,
          commentsTreeId: ZERO,
          likesBookId: ZERO,
          artifactCode: `DRY-RUN-BLOG-${index + 1}`,
          artifactType: ARTIFACT_TYPES.blogPost,
        };
    assert(published.artifactType === ARTIFACT_TYPES.blogPost, `${post.source} was not published as a blog_post.`);
    Object.assign(post, {
      artifactCode: published.artifactCode,
      seriesId: published.seriesId,
      commentsTreeId: published.commentsTreeId,
      initialVersionId: post.initialVersionId ?? published.versionId,
      currentVersionId: published.versionId,
      likesBookId: published.likesBookId,
      latestContentHash: content.contentHash,
      contentType: CONTENT_TYPE,
      commentsTreeStatus: post.commentsTreeStatus ?? 'open',
    });
    delete post.publishAction;
    report.transactions.push({ label: `${existing ? 'add version' : 'publish'} ${post.source}`, digest: result.digest, dryRunBytes: result.dryRunBytes });
    report.posts.push({ id: post.id, source: post.source, title: post.title, upload, published, contentHash: content.contentHash, operation: existing ? 'add-version' : 'publish' });
    if (args.run) {
      syncManifestPosts(report.manifest, posts);
      await writeJsonFile(CHECKPOINT_PATH, report);
      await writeJsonFile(MANIFEST_PATH, report.manifest);
      const series = await read.waitForObject(published.seriesId, { attempts: 8, baseDelayMs: 1_000 });
      assert(series.id === published.seriesId, `Series not readable after publishing ${post.source}.`);
      try {
        const details = await read.getSeriesView(published.seriesId);
        assertControllerOnlySeries({ series: details }, `${post.source} published blog series`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[publish] non-fatal post-publish readback warning for ${post.source}: ${message}`);
      }
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
  await preflightJsonFiles([MANIFEST_PATH, APP_MANIFEST_PATH]);
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  const allPosts = collectPosts(manifest);
  assert(allPosts.length > 0, 'Expected at least one blog post in the manifest.');
  assert(new Set(allPosts.map((post) => post.id)).size === allPosts.length, 'Blog manifest contains duplicate post ids.');
  assert(new Set(allPosts.map((post) => post.source)).size === allPosts.length, 'Blog manifest contains duplicate source files.');
  const posts = selectPosts(allPosts, args);

  const account = await loadAccount(args.account);
  const deployment = createDeployment(MAINNET_DEPLOYMENT);
  const sui = new SuiJsonRpcClient({ url: deployment.rpcUrl ?? 'https://fullnode.mainnet.sui.io:443' });
  const walrusClient = new SuiGrpcClient({ baseUrl: deployment.rpcUrl, network: 'mainnet' }).$extend(
    walrus({
      network: 'mainnet',
      uploadRelay: {
        host: 'https://upload-relay.mainnet.walrus.space',
        sendTip: { max: 5_000_000 },
      },
    }),
  );
  const txb = new PaperProofTxBuilder(deployment);
  const read = new PaperProofReadClient({ client: new JsonRpcPaperProofProvider(sui), deployment });
  const runId = `paperproof-blogs-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const report = {
    runId,
    run: args.run,
    accountIndex: args.account,
    selection: {
      all: args.all,
      posts: args.posts,
      sources: args.sources,
      artifactCodes: args.artifactCodes,
    },
    sender: account.address,
    sdkVersion: sdkPackage.version,
    deployment,
    posts: [],
    transactions: [],
    manifest,
  };

  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(APP_MANIFEST_PATH), { recursive: true });

  console.log(`[selection] processing ${posts.length} post(s): ${posts.map((post) => post.id).join(', ')}`);
  await publishBlogs({ posts, args, account, sui, walrusClient, txb, read, report });

  syncManifestPosts(manifest, posts);
  manifest.publishedAt = new Date().toISOString();
  manifest.publisher = account.address;
  manifest.sdkVersion = sdkPackage.version;
  report.manifest = manifest;
  if (args.run) {
    await writeJsonFile(MANIFEST_PATH, manifest);
    await writeJsonFile(APP_MANIFEST_PATH, manifest);
  }

  const reportPath = path.join(ARTIFACTS_DIR, `${runId}.json`);
  await writeJsonFile(reportPath, report);
  console.log(`Blog posts processed: ${posts.length}`);
  console.log(`Report: ${reportPath}`);
  console.log(`App manifest: ${APP_MANIFEST_PATH}`);
  if (!args.run) console.log('Dry run only. Re-run with --run to publish on mainnet.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
