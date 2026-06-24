import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..', '..', '..');
const requireFromApp = createRequire(path.join(root, 'paperproof-app', 'package.json'));
const JSZip = requireFromApp('jszip');

const files = [
  'README.md',
  'dataset_overview.json',
  'schema.json',
  'sources.json',
  'track_summary.csv',
  'track_summary.json',
  'winners.csv',
  'winners.json',
];

const output = path.join(__dirname, '..', 'sui-overflow-winner-dataset-v2.zip');

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  const zip = new JSZip();
  for (const name of files) {
    const fullPath = path.join(__dirname, name);
    const bytes = await fs.readFile(fullPath);
    zip.file(name, bytes);
  }
  const bytes = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  await fs.writeFile(output, bytes);
  console.log(JSON.stringify({
    output,
    byteLength: bytes.length,
    sha256: `sha256:${sha256Hex(bytes)}`,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
