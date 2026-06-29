import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const LABS_ROOT = path.resolve(DOCS_ROOT, '..');
const SDK_ROOT = path.join(LABS_ROOT, 'paperproof-sdk-ts');
const APP_ROOT = path.join(LABS_ROOT, 'paperproof-app');
const CONTRACTS_ENV = path.join(LABS_ROOT, 'paperproof-contracts', 'jstest', '.env');
const ARTIFACTS_DIR = path.join(DOCS_ROOT, 'artifacts');
const SOURCE_FILE = path.join(__dirname, 'Sui Overflow 2026 Track Intelligence on PaperProof.md');
const OUTPUT_REPORT_PATH = path.join(ARTIFACTS_DIR, 'community-overflow2026-blog-publish.json');
const CONTENT_TYPE = 'application/vnd.paperproof.markdown-package+zip';
const EXISTING_REPORT_PATH = path.join(ARTIFACTS_DIR, 'community-overflow2026-blog-publish.json');

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

async function loadAccount(index, depsObject) {
  const env = parseEnv(await fs.readFile(CONTRACTS_ENV, 'utf8'));
  const address = normalizeAddress(env.get(`ADDR_${index}`));
  const secret = env.get(`PRIVATE_KEY_${index}`);
  if (!secret) throw new Error(`Missing PRIVATE_KEY_${index} in ${CONTRACTS_ENV}.`);
  const decoded = depsObject.decodeSuiPrivateKey(secret);
  assert(decoded.scheme === 'ED25519', `ADDR_${index} must use Ed25519.`);
  const signer = depsObject.Ed25519Keypair.fromSecretKey(decoded.secretKey);
  assert(normalizeAddress(signer.toSuiAddress()) === address, `ADDR_${index} signer mismatch.`);
  return { address, signer };
}

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function metadataAttributes(entries) {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .map(([key, value]) => ({ key, value: String(value).slice(0, 511) }));
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

async function buildContentPackage() {
  const markdown = await fs.readFile(SOURCE_FILE, 'utf8');
  const titleLine = markdown.split(/\r?\n/, 1)[0] ?? '';
  assert(titleLine.startsWith('# '), 'Blog source must start with a Markdown H1 title.');
  const title = titleLine.slice(2).trim();
  const summary =
    'A community analysis of four published Sui Overflow 2026 track datasets on PaperProof Protocol, focused on technical structure, submission statistics, deployment posture, and cross-track patterns rather than ranking.';
  const tags = ['sui-overflow-2026', 'datasets', 'paperproof', 'research', 'walrus', 'deepbook', 'agentic-web'];
  const language = 'en';

  const JSZip = loadJSZip();
  const zip = new JSZip();
  zip.file('index.md', markdown);
  zip.file(
    'manifest.json',
    `${JSON.stringify(
      {
        schemaVersion: 1,
        appKind: 'blog_post',
        entry: 'index.md',
        title,
        source: path.basename(SOURCE_FILE),
        postId: 'community-sui-overflow-2026-track-intelligence',
        contentType: 'text/markdown; charset=utf-8',
        assets: [],
      },
      null,
      2,
    )}\n`,
  );

  const bytes = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return {
    title,
    summary,
    tags,
    language,
    markdown,
    bytes,
    contentHash: `sha256:${sha256Hex(bytes)}`,
  };
}

async function main() {
  const loaded = await loadDeps();
  const sdkPackage = JSON.parse(await fs.readFile(path.join(SDK_ROOT, 'package.json'), 'utf8'));
  const account = await loadAccount(4, loaded);
  const deployment = loaded.createDeployment(loaded.MAINNET_DEPLOYMENT);
  const sui = new loaded.SuiJsonRpcClient({ url: deployment.rpcUrl ?? 'https://fullnode.mainnet.sui.io:443' });
  const walrusClient = new loaded.SuiGrpcClient({ baseUrl: deployment.rpcUrl, network: 'mainnet' }).$extend(
    loaded.walrus({
      network: 'mainnet',
      uploadRelay: {
        host: 'https://upload-relay.mainnet.walrus.space',
        sendTip: { max: 5_000_000 },
      },
    }),
  );
  const read = new loaded.PaperProofReadClient({ client: new loaded.JsonRpcPaperProofProvider(sui), deployment });
  const txb = new loaded.PaperProofTxBuilder(deployment);

  const content = await buildContentPackage();
  console.log(`[upload] ${path.basename(SOURCE_FILE)} (${content.bytes.length} bytes)`);
  const upload = await loaded.robustWalrusWriteBlob(walrusClient, account.signer, content.bytes, {
    label: 'community-overflow2026-blog',
    epochs: 10,
    deletable: false,
    fallback: false,
    attempts: 4,
  });
  console.log(`[upload] ${upload.blobId}`);

  let existing = null;
  try {
    existing = JSON.parse(await fs.readFile(EXISTING_REPORT_PATH, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const input = {
    title: content.title,
    summary: content.summary,
    tags: content.tags,
    language: content.language,
    contentHash: content.contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: CONTENT_TYPE,
    seriesMetadata: metadataAttributes({
      app: 'community-blog',
      post_id: 'community-sui-overflow-2026-track-intelligence',
      category: 'Community Research',
    }),
    versionMetadata: metadataAttributes({
      schema: 'paperproof-blog-markdown-v1',
      source: path.basename(SOURCE_FILE),
      route: '/artifact/community-overflow2026-blog',
      date: '2026-06-29',
    }),
  };

  const isAddVersion =
    existing?.published?.seriesId &&
    existing?.published?.artifactCode &&
    existing?.published?.commentsTreeId;

  const tx = isAddVersion
    ? txb.addBlogPostVersion({
        ...input,
        seriesId: existing.published.seriesId,
      })
    : txb.publishBlogPost(input);
  console.log(`[tx] ${isAddVersion ? 'add version community blog' : 'publish community blog'}`);
  const execution = await loaded.robustExecuteTransaction(
    sui,
    account.signer,
    tx,
    isAddVersion ? 'add version community overflow2026 blog' : 'publish community overflow2026 blog',
  );
  const published = isAddVersion
    ? loaded.extractAddVersionResult(toSdkResponse(execution), deployment)
    : loaded.extractPublishResult(toSdkResponse(execution), deployment);
  assert(published.artifactType === loaded.ARTIFACT_TYPES.blogPost, `Unexpected artifact type ${published.artifactType}.`);

  const seriesId = isAddVersion ? existing.published.seriesId : published.seriesId;
  const commentsTreeId = isAddVersion ? existing.published.commentsTreeId : published.commentsTreeId;
  const artifactCode = isAddVersion ? existing.published.artifactCode : published.artifactCode;
  const likesBookId = isAddVersion ? existing.published.likesBookId : published.likesBookId;

  const series = await read.getSeriesView(seriesId);
  const version = await read.getVersionView(published.versionId);

  const report = {
    publishedAt: new Date().toISOString(),
    operation: isAddVersion ? 'add-version' : 'publish',
    sender: account.address,
    sdkVersion: sdkPackage.version,
    sourceFile: SOURCE_FILE,
    title: content.title,
    summary: content.summary,
    tags: content.tags,
    deployment,
    upload,
    transaction: { digest: execution.digest },
    published: {
      ...published,
      seriesId,
      commentsTreeId,
      likesBookId,
      artifactCode,
    },
    previewUrl: `https://paperproof.site/#/artifact/${artifactCode}`,
    series,
    version,
  };

  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_REPORT_PATH, `${loaded.stringifyForJson(report)}\n`, 'utf8');
  console.log(`[done] ${OUTPUT_REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
