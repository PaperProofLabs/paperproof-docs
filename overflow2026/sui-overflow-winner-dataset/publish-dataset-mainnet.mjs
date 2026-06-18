// Copyright (c) 2026 PaperProof Labs
// SPDX-License-Identifier: Apache-2.0

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
const ZIP_PATH = path.join(__dirname, '..', 'sui-overflow-winner-dataset-v1.zip');
const REPORT_PATH = path.join(__dirname, 'sui-overflow-winner-dataset-mainnet.json');

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
  const txb = new deps.PaperProofTxBuilder(deployment);

  console.log(`[upload] ${path.basename(ZIP_PATH)} ${zipBytes.length} bytes`);
  const upload = await deps.robustWalrusWriteBlob(walrusClient, account.signer, zipBytes, {
    label: 'sui-overflow-winner-dataset-v1',
    epochs: 10,
    deletable: false,
    fallback: false,
    attempts: 4,
  });
  console.log(`[upload] ${upload.blobId}`);

  const input = {
    title: 'Sui Overflow Historical Winner Dataset, 2024-2025',
    description: 'Structured dataset of historical Sui Overflow primary winners for 2024 and 2025, derived from PaperProof benchmark research and official Sui Foundation winner announcements. Includes winners, tracks, placements, categories, winning signals, profile notes, detected ecosystem primitives, and PaperProof positioning relevance.',
    format: 'ZIP package containing CSV, JSON, schema, README, and source metadata',
    fileCount: 8,
    sizeBytes: zipBytes.length,
    license: 'CC-BY-4.0',
    keywords: ['Sui Overflow', 'hackathon', 'winners', 'Sui ecosystem', 'Walrus', 'PaperProof', 'benchmark dataset'],
    contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: 'application/zip',
    seriesMetadata: metadataAttributes({
      dataset_version: '1.0.0',
      record_count: '68',
      coverage_years: '2024,2025',
      publisher: 'PaperProof Labs',
    }),
    versionMetadata: metadataAttributes({
      package_filename: path.basename(ZIP_PATH),
      package_sha256: contentHash,
      sdk_version: sdkPackage.version,
      walrus_epochs: '10',
    }),
  };

  const tx = txb.publishDataset(input);
  console.log('[tx] publish dataset sui-overflow-winner-dataset-v1');
  const execution = await deps.robustExecuteTransaction(sui, account.signer, tx, 'publish dataset sui-overflow-winner-dataset-v1');
  const published = deps.extractPublishResult(toSdkResponse(execution), deployment);
  if (published.artifactType !== deps.ARTIFACT_TYPES.dataset) throw new Error(`Unexpected artifact type ${published.artifactType}.`);
  const series = await read.getSeriesView(published.seriesId);
  const version = await read.getVersionView(published.versionId);

  const report = {
    publishedAt: new Date().toISOString(),
    sender: account.address,
    sdkVersion: sdkPackage.version,
    deployment,
    source: {
      datasetDirectory: __dirname,
      archive: ZIP_PATH,
      byteLength: zipBytes.length,
      contentHash,
    },
    walrus: upload,
    transaction: { digest: execution.digest },
    published,
    series,
    version,
  };
  await fs.writeFile(REPORT_PATH, `${deps.stringifyForJson(report)}\n`, 'utf8');
  console.log(`[done] ${published.artifactCode}`);
  console.log(`[report] ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
