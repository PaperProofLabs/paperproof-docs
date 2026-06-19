// Copyright (c) 2026 PaperProof Labs
// SPDX-License-Identifier: Apache-2.0

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const LABS_ROOT = path.resolve(DOCS_ROOT, '..');
const SDK_ROOT = path.join(LABS_ROOT, 'paperproof-sdk-ts');
const CONTRACTS_ENV = path.join(LABS_ROOT, 'paperproof-contracts', 'jstest', '.env');
const ARTIFACTS_DIR = path.join(DOCS_ROOT, 'artifacts');
const CONTENT_TYPE = 'application/pdf';
const ZERO = `0x${'0'.repeat(64)}`;
let deps;

const MATERIALS = [
  {
    id: 'whitepaper',
    type: 'preprint',
    file: path.join(LABS_ROOT, 'paperproof-papers', 'whitepaper', 'paperproof-whitepaper.pdf'),
    seriesId: '0x0c3f8fd7d4ebf2ce5c89519a75893adde281a2fa1053c9625e886d25170d8c8d',
  },
  {
    id: 'yellow-paper',
    type: 'preprint',
    file: path.join(LABS_ROOT, 'paperproof-papers', 'yellow-paper', 'paperproof-yellow-paper-updated.pdf'),
    seriesId: '0x064b3cf9a09c61e5a1fdef46ac6fa59f631d871b9769e5f0a0d4736387b29eec',
  },
  {
    id: 'academic-paper',
    type: 'preprint',
    file: path.join(LABS_ROOT, 'paperproof-papers', 'academic-paper', 'paperproof-academic.pdf'),
    seriesId: '0xc2fff6d39f0603eb08b0775aab0f7f996fc01faff797f10871cfff45729743c8',
  },
  {
    id: 'slides',
    type: 'technicalReport',
    file: path.join(LABS_ROOT, 'paperproof-slides', 'paperproof-slides.pdf'),
    seriesId: '0x4f414f76bdc501616f690cf418ea50b5803d07a14cca13289a8fe6fc18b2eb78',
  },
];

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
Add latest local flagship papers and slides as new PaperProof versions.

Usage:
  node scripts/add-flagship-material-versions.mjs
  node scripts/add-flagship-material-versions.mjs --run --account=4

Default mode validates files and builds a dry-run report only. --run writes
Walrus blobs and Sui mainnet add-version transactions.
`.trim();
}

function parseArgs(argv) {
  const raw = argv.slice(2);
  const set = new Set(raw);
  const argValue = (name, fallback) => raw.find((item) => item.startsWith(`${name}=`))?.split('=')[1] ?? fallback;
  return {
    run: set.has('--run'),
    help: set.has('--help') || set.has('-h'),
    account: Number(argValue('--account', '4')),
    only: argValue('--only', ''),
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

async function pageCount(filePath) {
  const output = await new Promise((resolve) => {
    const child = spawn('pdfinfo', [filePath], { windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('error', () => resolve(''));
    child.on('close', (code) => resolve(code === 0 ? stdout : stderr));
  });
  const match = /^Pages:\s+(\d+)/m.exec(output);
  return match ? Number(match[1]) : undefined;
}

async function readContent(material) {
  const bytes = await fs.readFile(material.file);
  const stat = await fs.stat(material.file);
  assert(stat.size === bytes.length, `Could not read full file for ${material.id}.`);
  return {
    bytes,
    filename: path.basename(material.file),
    fileSize: bytes.length,
    contentHash: `sha256:${sha256Hex(bytes)}`,
    contentType: CONTENT_TYPE,
    pageCount: await pageCount(material.file),
  };
}

function headerField(raw, name) {
  return raw?.header?.[name];
}

function preprintInput(material, content, upload, currentVersion) {
  const raw = currentVersion.rawFields ?? {};
  return {
    seriesId: material.seriesId,
    title: raw.title,
    abstractText: raw.abstract_text,
    authors: raw.authors ?? [],
    keywords: raw.keywords ?? [],
    field: raw.field,
    license: raw.license,
    pageCount: content.pageCount ?? raw.page_count,
    contentHash: content.contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: content.contentType,
    versionMetadata: metadataAttributes({
      source_file: path.relative(LABS_ROOT, material.file).replaceAll(path.sep, '/'),
      local_filename: content.filename,
      local_bytes: content.fileSize,
      previous_version: currentVersion.id,
    }),
  };
}

function technicalReportInput(material, content, upload, currentVersion) {
  const raw = currentVersion.rawFields ?? {};
  return {
    seriesId: material.seriesId,
    title: raw.title,
    abstractText: raw.abstract_text,
    authors: raw.authors ?? [],
    organization: raw.organization,
    reportNumber: raw.report_number,
    keywords: raw.keywords ?? [],
    license: raw.license,
    contentHash: content.contentHash,
    walrusBlobId: upload.blobId,
    walrusBlobObjectId: upload.blobObjectId,
    contentType: content.contentType,
    versionMetadata: metadataAttributes({
      source_file: path.relative(LABS_ROOT, material.file).replaceAll(path.sep, '/'),
      local_filename: content.filename,
      local_bytes: content.fileSize,
      previous_version: currentVersion.id,
    }),
  };
}

async function uploadContent(walrusClient, signer, material, content, run) {
  console.log(`[walrus] ${material.id} (${content.fileSize} bytes)`);
  if (!run) {
    const digest = content.contentHash.replace(/^sha256:/, '').slice(0, 24);
    return {
      blobId: `local-flagship-${material.id}-${digest}`,
      blobObjectId: `0x${'6'.repeat(64)}`,
      byteLength: content.fileSize,
    };
  }
  const { robustWalrusWriteBlob } = await loadDeps();
  const upload = await robustWalrusWriteBlob(walrusClient, signer, content.bytes, {
    label: `paperproof-flagship-${material.id}`.slice(0, 96),
    fallback: false,
    attempts: 4,
  });
  console.log(`[walrus] uploaded ${material.id}: ${upload.blobId}`);
  return {
    blobId: upload.blobId,
    blobObjectId: upload.blobObjectId,
    byteLength: content.fileSize,
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

async function processMaterial({ material, account, sui, walrusClient, txb, read, run }) {
  console.log(`[series] ${material.id} ${material.seriesId}`);
  const view = await read.query.getSeriesDetails(material.seriesId);
  assert(view.series.owner.toLowerCase() === account.address.toLowerCase(), `${material.id} is not owned by account ${account.address}.`);
  assert(view.series.artifactType === (material.type === 'preprint' ? 1 : 3), `${material.id} artifact type mismatch.`);
  const content = await readContent(material);
  assert(content.contentHash !== view.currentVersion.contentHash, `${material.id} local PDF already matches the current version.`);
  const upload = await uploadContent(walrusClient, account.signer, material, content, run);
  const input = material.type === 'preprint'
    ? preprintInput(material, content, upload, view.currentVersion)
    : technicalReportInput(material, content, upload, view.currentVersion);
  const tx = material.type === 'preprint'
    ? txb.addPreprintVersion(input)
    : txb.addTechnicalReportVersion(input);
  const result = await execute(sui, account.signer, tx, `add ${material.id} version`, run, account.address);
  const { ARTIFACT_TYPES, extractAddVersionResult } = await loadDeps();
  const added = run
    ? extractAddVersionResult(toSdkResponse(result), read.deployment)
    : {
        seriesId: material.seriesId,
        versionId: ZERO,
        artifactType: material.type === 'preprint' ? ARTIFACT_TYPES.preprint : ARTIFACT_TYPES.technicalReport,
        version: BigInt(Number(view.series.currentVersion) + 1),
      };
  if (run) {
    const refreshed = await read.query.getSeriesDetails(material.seriesId);
    assert(refreshed.series.currentVersionId === added.versionId, `${material.id} latest version did not advance.`);
    assert(refreshed.currentVersion.contentHash === content.contentHash, `${material.id} latest hash mismatch.`);
  }
  return {
    id: material.id,
    type: material.type,
    file: material.file,
    artifactCode: view.series.artifactCode,
    seriesId: material.seriesId,
    previousVersion: view.series.currentVersion,
    previousVersionId: view.series.currentVersionId,
    newVersion: String(added.version),
    newVersionId: added.versionId,
    title: view.currentVersion.rawFields?.title,
    owner: view.series.owner,
    content: {
      filename: content.filename,
      fileSize: content.fileSize,
      pageCount: content.pageCount,
      contentHash: content.contentHash,
      contentType: content.contentType,
      previousContentHash: view.currentVersion.contentHash,
    },
    upload,
    transactionDigest: result.digest,
  };
}

async function main() {
  const {
    MAINNET_DEPLOYMENT,
    PaperProofReadClient,
    PaperProofTxBuilder,
    JsonRpcPaperProofProvider,
    createPaperProofSDK,
    SuiGrpcClient,
    SuiJsonRpcClient,
    createDeployment,
    walrus,
    stringifyForJson,
  } = await loadDeps();
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    return;
  }
  const selected = args.only
    ? MATERIALS.filter((item) => item.id === args.only)
    : MATERIALS;
  assert(selected.length > 0, `No material matched --only=${args.only}.`);

  const sdkPackage = JSON.parse(await fs.readFile(path.join(SDK_ROOT, 'package.json'), 'utf8'));
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
  const read = {
    deployment,
    query: createPaperProofSDK({ network: 'mainnet', transport: 'grpc', queryTransport: 'none' }).query,
    object: new PaperProofReadClient({ client: new JsonRpcPaperProofProvider(sui), deployment }),
  };
  const runId = `flagship-material-versions-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const report = {
    runId,
    run: args.run,
    accountIndex: args.account,
    sender: account.address,
    sdkVersion: sdkPackage.version,
    deployment,
    results: [],
  };

  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  for (const material of selected) {
    report.results.push(await processMaterial({ material, account, sui, walrusClient, txb, read, run: args.run }));
  }
  const reportPath = path.join(ARTIFACTS_DIR, `${runId}.json`);
  await fs.writeFile(reportPath, `${stringifyForJson(report)}\n`, 'utf8');
  console.log(`Processed: ${report.results.length}`);
  console.log(`Report: ${reportPath}`);
  if (!args.run) console.log('Dry run only. Re-run with --run to write Walrus and Sui mainnet.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
