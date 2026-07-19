import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LABS_ROOT = path.resolve(__dirname, '..', '..', '..');
const SDK_ROOT = path.join(LABS_ROOT, 'paperproof-sdk-ts');
const CONTRACTS_ENV = path.join(LABS_ROOT, 'paperproof-contracts', 'jstest', '.env');
const ZIP_PATH = path.join(__dirname, '..', 'sui-overflow-winner-dataset-v2.zip');
const REPORT_PATH = path.join(__dirname, 'sui-overflow-winner-dataset-mainnet-v2.json');
const SERIES_ID = '0xc41625dfadfd259e2b5a71b100e6510bdeb4144c384718ff416cbd9e0cd23492';

async function importFromSdk(specifier) {
  const requireFromSdk = createRequire(path.join(SDK_ROOT, 'package.json'));
  return import(pathToFileURL(requireFromSdk.resolve(specifier)).href);
}

async function loadDeps() {
  const [cryptography, grpc, jsonRpc, ed25519, walrusModule, sdk] = await Promise.all([
    importFromSdk('@mysten/sui/cryptography'),
    importFromSdk('@mysten/sui/grpc'),
    importFromSdk('@mysten/sui/jsonRpc'),
    importFromSdk('@mysten/sui/keypairs/ed25519'),
    importFromSdk('@mysten/walrus'),
    import(pathToFileURL(path.join(SDK_ROOT, 'dist', 'index.js')).href),
  ]);
  return {
    decodeSuiPrivateKey: cryptography.decodeSuiPrivateKey,
    SuiGrpcClient: grpc.SuiGrpcClient,
    SuiJsonRpcClient: jsonRpc.SuiJsonRpcClient,
    Ed25519Keypair: ed25519.Ed25519Keypair,
    walrus: walrusModule.walrus,
    ...sdk,
  };
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

async function loadAccount(index, deps) {
  const env = parseEnv(await fs.readFile(CONTRACTS_ENV, 'utf8'));
  const address = normalizeAddress(env.get(`ADDR_${index}`));
  const secret = env.get(`PRIVATE_KEY_${index}`);
  if (!secret) throw new Error(`Missing PRIVATE_KEY_${index} in ${CONTRACTS_ENV}.`);
  const decoded = deps.decodeSuiPrivateKey(secret);
  if (decoded.scheme !== 'ED25519') throw new Error(`ADDR_${index} must use Ed25519.`);
  const signer = deps.Ed25519Keypair.fromSecretKey(decoded.secretKey);
  if (normalizeAddress(signer.toSuiAddress()) !== address) throw new Error(`ADDR_${index} signer mismatch.`);
  return { address, signer };
}

function metadataAttributes(entries) {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .map(([key, value]) => ({ key, value: String(value).slice(0, 511) }));
}

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function isControllerOnlySeries(series) {
  const authorityMode = series?.seriesAuthorityMode;
  if (authorityMode != null) return Number(authorityMode) === 3;
  return series?.seriesAuthorityModeName === 'controller_only';
}

function assertControllerOnlySeries(series, label) {
  if (!isControllerOnlySeries(series)) {
    throw new Error(`${label} must be controller_only. Current mode: ${series?.seriesAuthorityModeName ?? 'unknown'}.`);
  }
  if (!series?.seriesControlRecordId) {
    throw new Error(`${label} is missing seriesControlRecordId.`);
  }
  if (!series?.seriesControllerNftId) {
    throw new Error(`${label} is missing seriesControllerNftId.`);
  }
}

async function main() {
  const deps = await loadDeps();
  const sdkPackage = JSON.parse(await fs.readFile(path.join(SDK_ROOT, 'package.json'), 'utf8'));
  const zipBytes = new Uint8Array(await fs.readFile(ZIP_PATH));
  const contentHash = `sha256:${sha256Hex(zipBytes)}`;
  const account = await loadAccount(4, deps);
  const deployment = deps.createDeployment(deps.MAINNET_DEPLOYMENT);
  const sui = new deps.SuiJsonRpcClient({ url: deployment.rpcUrl ?? 'https://fullnode.mainnet.sui.io:443' });
  const walrusClient = new deps.SuiGrpcClient({ baseUrl: deployment.rpcUrl, network: 'mainnet' }).$extend(
    deps.walrus({
      network: 'mainnet',
      uploadRelay: {
        host: 'https://upload-relay.mainnet.walrus.space',
        sendTip: { max: 5_000_000 },
      },
    }),
  );
  const read = new deps.PaperProofReadClient({ client: new deps.JsonRpcPaperProofProvider(sui), deployment });
  const client = new deps.PaperProofClient({ deployment, client: new deps.JsonRpcPaperProofProvider(sui), signer: account.signer });

  console.log(`[upload] ${path.basename(ZIP_PATH)} ${zipBytes.length} bytes`);
  const upload = await deps.robustWalrusWriteBlob(walrusClient, account.signer, zipBytes, {
    label: 'sui-overflow-winner-dataset-v2',
    epochs: 10,
    deletable: false,
    fallback: false,
    attempts: 4,
  });
  console.log(`[upload] ${upload.blobId}`);

  const series = await read.getSeriesView(SERIES_ID);
  assertControllerOnlySeries(series, 'sui-overflow-winner-dataset series');

  const input = {
    seriesId: SERIES_ID,
    controlRecordId: series.seriesControlRecordId,
    controllerNftId: series.seriesControllerNftId,
    title: 'Sui Overflow Historical Winner Dataset, 2024-2025',
    description: 'Structured dataset of historical Sui Overflow winner records for 2024 and 2025. Includes winners, tracks, placements, categories, short descriptive notes, and lightweight ecosystem-primitives classification fields for independent analysis and historical comparison.',
    format: 'ZIP package containing CSV, JSON, schema, README, and source metadata',
    fileCount: 8,
    sizeBytes: zipBytes.length,
    license: 'CC-BY-4.0',
    keywords: ['Sui Overflow', 'hackathon', 'winners', 'historical dataset', 'Sui ecosystem', 'community research'],
    contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: 'application/zip',
    versionMetadata: metadataAttributes({
      package_filename: path.basename(ZIP_PATH),
      package_sha256: contentHash,
      dataset_version: '2.0.0',
      sdk_version: sdkPackage.version,
    }),
    versionChangeNote: 'Refresh historical winner dataset package with normalized schema and metadata for controller-only series.',
  };

  console.log('[tx] add dataset version sui-overflow-winner-dataset-v2');
  const execution = await client.addDatasetVersion(input, { description: 'add dataset version' });
  const version = await read.getVersionView(execution.result.versionId);

  const report = {
    publishedAt: new Date().toISOString(),
    sender: account.address,
    sdkVersion: sdkPackage.version,
    deployment,
    seriesId: SERIES_ID,
    source: {
      datasetDirectory: __dirname,
      archive: ZIP_PATH,
      byteLength: zipBytes.length,
      contentHash,
    },
    walrus: upload,
    transaction: { digest: execution.execution.digest },
    added: execution.result,
    series,
    version,
  };
  await fs.writeFile(REPORT_PATH, `${deps.stringifyForJson(report)}\n`, 'utf8');
  console.log(`[done] ${series.artifactCode}`);
  console.log(`[report] ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
