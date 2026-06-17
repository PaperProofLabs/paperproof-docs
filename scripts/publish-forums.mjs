// Copyright (c) 2026 PaperProof Labs
// SPDX-License-Identifier: Apache-2.0

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const LABS_ROOT = path.resolve(DOCS_ROOT, '..');
const SDK_ROOT = path.join(LABS_ROOT, 'paperproof-sdk-ts');
const CONTRACTS_ENV = path.join(LABS_ROOT, 'paperproof-contracts', 'jstest', '.env');
const FORUMS_HOME = path.join(DOCS_ROOT, 'homepages', 'forums');
const MANIFEST_PATH = path.join(FORUMS_HOME, 'manifest.json');
const APP_MANIFEST_PATH = path.join(LABS_ROOT, 'paperproof-app', 'public', 'forum', 'manifest.json');
const ARTIFACTS_DIR = path.join(DOCS_ROOT, 'artifacts');
const CHECKPOINT_PATH = path.join(ARTIFACTS_DIR, 'paperproof-forums-publish-checkpoint.json');
const CONTENT_TYPE = 'text/markdown; charset=utf-8';
const ZERO = `0x${'0'.repeat(64)}`;
let deps;

async function importFromSdk(specifier) {
  const requireFromSdk = createRequire(path.join(SDK_ROOT, 'package.json'));
  return import(pathToFileURL(requireFromSdk.resolve(specifier)).href);
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
Publish official PaperProof Forum starter topics as blog_post artifacts.

Usage:
  node scripts/publish-forums.mjs
  node scripts/publish-forums.mjs --run --account=4
  node scripts/publish-forums.mjs --run --account=4 --skip-walrus

Default mode validates sources only. --run writes Sui mainnet transactions.
Existing manifest topics with seriesId, commentsTreeId, and artifactCode are reused.
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
    account: Number(argValue('--account', '4')),
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

function collectTopics(manifest) {
  const topics = [];
  for (const section of manifest.sections ?? []) {
    for (const [index, topic] of (section.topics ?? []).entries()) {
      topics.push({
        ...topic,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionOrder: index + 1,
        order: topics.length + 1,
      });
    }
  }
  return topics;
}

function syncTopicsIntoManifest(manifest, topics) {
  const byKey = new Map(topics.map((topic) => [`${topic.sectionId}/${topic.id}`, topic]));
  for (const section of manifest.sections ?? []) {
    section.topics = (section.topics ?? []).map((topic) => byKey.get(`${section.id}/${topic.id}`) ?? topic);
  }
}

async function readTopic(topic) {
  const fullPath = path.join(FORUMS_HOME, topic.source);
  const text = await fs.readFile(fullPath, 'utf8');
  assert(text.startsWith(`# ${topic.title}`), `${topic.source} title does not match manifest title.`);
  const bytes = new TextEncoder().encode(text);
  return {
    fullPath,
    text,
    bytes,
    contentHash: `sha256:${sha256Hex(bytes)}`,
  };
}

async function uploadTopic(walrusClient, signer, topic, content, run, skipWalrus) {
  const { robustWalrusWriteBlob } = await loadDeps();
  console.log(`[upload] ${topic.source} (${content.bytes.length} bytes)`);
  if (!run || skipWalrus) {
    const digest = content.contentHash.replace(/^sha256:/, '').slice(0, 24);
    return {
      blobId: `local-forum-${topic.sectionId}-${topic.id}-${digest}`,
      blobObjectId: `0x${'6'.repeat(64)}`,
      byteLength: content.bytes.length,
    };
  }
  const upload = await robustWalrusWriteBlob(walrusClient, signer, content.bytes, {
    label: `paperproof-forum-${topic.sectionId}-${topic.id}`.slice(0, 96),
    fallback: false,
    attempts: 4,
  });
  console.log(`[upload] done ${topic.source}: ${upload.blobId}`);
  return {
    blobId: upload.blobId,
    blobObjectId: upload.blobObjectId,
    byteLength: content.bytes.length,
  };
}

async function execute(sui, signer, tx, label, run, sender) {
  const { robustExecuteTransaction } = await loadDeps();
  tx.setSenderIfNotSet(sender);
  if (!run) return { digest: null, dryRunBytes: 0, events: [] };
  console.log(`[tx] ${label}`);
  const result = await robustExecuteTransaction(sui, signer, tx, label);
  console.log(`[tx] confirmed ${label}: ${result.digest}`);
  return result;
}

function publishInput(topic, content, upload) {
  return {
    title: topic.title,
    summary: topic.summary,
    tags: topic.tags ?? [],
    language: topic.language ?? 'en',
    contentHash: content.contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: CONTENT_TYPE,
    seriesMetadata: metadataAttributes({
      app: 'paperproof-forum',
      section_id: topic.sectionId,
      topic_id: topic.id,
      category: topic.category,
    }),
    versionMetadata: metadataAttributes({
      schema: 'paperproof-forum-topic-v1',
      source: topic.source,
      route: `/forum/${topic.id}`,
      date: topic.date,
    }),
  };
}

async function writeJsonFile(filePath, value) {
  const { stringifyForJson } = await loadDeps();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${stringifyForJson(value)}\n`, 'utf8');
}

async function publishForums({ topics, args, account, sui, walrusClient, txb, read, report }) {
  const { ARTIFACT_TYPES, extractPublishResult } = await loadDeps();
  for (const [index, topic] of topics.entries()) {
    console.log(`[publish] ${index + 1}/${topics.length} ${topic.source}`);
    if (topic.seriesId && topic.commentsTreeId && topic.artifactCode) {
      console.log(`[publish] reuse existing ${topic.source}: ${topic.artifactCode}`);
      report.topics.push({ id: topic.id, sectionId: topic.sectionId, source: topic.source, title: topic.title, upload: null, reused: true, published: {
        seriesId: topic.seriesId,
        versionId: topic.initialVersionId ?? topic.currentVersionId ?? ZERO,
        commentsTreeId: topic.commentsTreeId,
        likesBookId: topic.likesBookId ?? ZERO,
        artifactCode: topic.artifactCode,
        artifactType: ARTIFACT_TYPES.blogPost,
      } });
      continue;
    }
    const content = await readTopic(topic);
    const upload = await uploadTopic(walrusClient, account.signer, topic, content, args.run, args.skipWalrus);
    const tx = txb.publishBlogPost(publishInput(topic, content, upload));
    const result = await execute(sui, account.signer, tx, `publish forum topic ${topic.source}`, args.run, account.address);
    const published = args.run
      ? extractPublishResult(toSdkResponse(result), read.deployment)
      : {
          seriesId: ZERO,
          versionId: ZERO,
          commentsTreeId: ZERO,
          likesBookId: ZERO,
          artifactCode: `DRY-RUN-FORUM-${index + 1}`,
          artifactType: ARTIFACT_TYPES.blogPost,
        };
    assert(published.artifactType === ARTIFACT_TYPES.blogPost, `${topic.source} was not published as a blog_post.`);
    Object.assign(topic, {
      artifactCode: published.artifactCode,
      seriesId: published.seriesId,
      commentsTreeId: published.commentsTreeId,
      initialVersionId: published.versionId,
      currentVersionId: published.versionId,
      likesBookId: published.likesBookId,
      latestContentHash: content.contentHash,
      contentType: CONTENT_TYPE,
      commentsTreeStatus: 'open',
      comments: 0,
      likes: 0,
      dislikes: 0,
    });
    report.transactions.push({ label: `publish ${topic.source}`, digest: result.digest, dryRunBytes: result.dryRunBytes });
    report.topics.push({ id: topic.id, sectionId: topic.sectionId, source: topic.source, title: topic.title, upload, published, contentHash: content.contentHash });
    if (args.run) {
      syncTopicsIntoManifest(report.manifest, topics);
      await writeJsonFile(CHECKPOINT_PATH, report);
      await writeJsonFile(MANIFEST_PATH, report.manifest);
      const series = await read.waitForObject(published.seriesId, { attempts: 8, baseDelayMs: 1_000 });
      assert(series.id === published.seriesId, `Series not readable after publishing ${topic.source}.`);
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
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  const topics = collectTopics(manifest);
  assert(topics.length === 6, `Expected 6 forum topics, found ${topics.length}.`);

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
  const runId = `paperproof-forums-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const report = {
    runId,
    run: args.run,
    accountIndex: args.account,
    sender: account.address,
    sdkVersion: sdkPackage.version,
    deployment,
    topics: [],
    transactions: [],
    manifest,
  };

  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(APP_MANIFEST_PATH), { recursive: true });

  await publishForums({ topics, args, account, sui, walrusClient, txb, read, report });

  syncTopicsIntoManifest(manifest, topics);
  manifest.publishedAt = new Date().toISOString();
  manifest.publisher = account.address;
  manifest.sdkVersion = sdkPackage.version;
  if (args.run) {
    await writeJsonFile(MANIFEST_PATH, manifest);
    await writeJsonFile(APP_MANIFEST_PATH, manifest);
  }

  const reportPath = path.join(ARTIFACTS_DIR, `${runId}.json`);
  await writeJsonFile(reportPath, report);
  console.log(`Forum topics processed: ${topics.length}`);
  console.log(`Report: ${reportPath}`);
  console.log(`App manifest: ${APP_MANIFEST_PATH}`);
  if (!args.run) console.log('Dry run only. Re-run with --run to publish on mainnet.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
