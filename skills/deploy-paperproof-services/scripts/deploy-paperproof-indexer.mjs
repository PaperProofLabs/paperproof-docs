#!/usr/bin/env node
// Deploy paperproof-indexer-reference to the production server.
// Credentials are read from the local secrets file and are never printed.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const helperPackage = process.env.PAPERPROOF_DEPLOY_HELPER_PACKAGE
  || path.join(os.tmpdir(), 'paperproof-deploy-node/package.json');
const requireFromHelper = fs.existsSync(helperPackage)
  ? createRequire(helperPackage)
  : createRequire(import.meta.url);
const { Client } = requireFromHelper('ssh2');

const root = process.env.PAPERPROOF_ROOT
  || path.resolve(scriptDir, '../../../..');
const indexerDir = process.env.PAPERPROOF_INDEXER_DIR
  || path.join(root, 'paperproof-indexer-reference');
const configPath = process.env.PAPERPROOF_SERVER_CONFIG
  || path.join(root, 'secrets/jdcloud-paperproof-server.json');
const remoteDir = process.env.PAPERPROOF_REMOTE_INDEXER_DIR || '/opt/paperproof-indexer';
const remoteBin = process.env.PAPERPROOF_REMOTE_INDEXER_BIN || '/usr/local/bin/paperproof-indexer-reference';
const serviceName = process.env.PAPERPROOF_INDEXER_SERVICE || 'paperproof-indexer';
const sqlitePath = process.env.PAPERPROOF_INDEXER_SQLITE_PATH
  || '/var/lib/paperproof-indexer/paperproof-indexer-reference.sqlite';
const hydrateLimit = process.env.PAPERPROOF_INDEXER_HYDRATE_LIMIT || '';
const skipHydrate = process.env.PAPERPROOF_SKIP_INDEXER_HYDRATE === '1';

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''));
}

function connect(config) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password,
      readyTimeout: 20000,
    });
  });
}

function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`${command}\nexit ${code}\n${stderr}\n${stdout}`));
      });
      stream.on('data', (chunk) => {
        const text = chunk.toString();
        stdout += text;
        process.stdout.write(text);
      });
      stream.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        stderr += text;
        process.stderr.write(text);
      });
    });
  });
}

function openSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp)));
  });
}

function fastPut(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => (err ? reject(err) : resolve()));
  });
}

function makeArchive() {
  const archive = path.join(
    os.tmpdir(),
    `paperproof-indexer-src-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}.tgz`,
  );
  execFileSync(
    'tar',
    [
      '-czf',
      archive,
      '--exclude',
      './target',
      '--exclude',
      './.git',
      '--exclude',
      './artifacts',
      '.',
    ],
    { cwd: indexerDir, stdio: 'inherit' },
  );
  return archive;
}

async function main() {
  if (!fs.existsSync(path.join(indexerDir, 'Cargo.toml'))) {
    throw new Error(`Missing indexer Cargo.toml: ${indexerDir}`);
  }

  const config = readConfig();
  const archive = makeArchive();
  const remoteArchive = `/tmp/${path.basename(archive)}`;
  const hydrateArgs = hydrateLimit ? ` --limit ${shellQuote(hydrateLimit)}` : '';
  const hydrateCommand = skipHydrate
    ? 'echo "Skipping hydrate-version-objects because PAPERPROOF_SKIP_INDEXER_HYDRATE=1"'
    : `${shellQuote(remoteBin)} hydrate-version-objects --backend sqlite --sqlite-path ${shellQuote(sqlitePath)}${hydrateArgs}`;

  const conn = await connect(config);
  try {
    const sftp = await openSftp(conn);
    await fastPut(sftp, archive, remoteArchive);

    const remoteCommand = `set -euo pipefail
export PATH=/root/.cargo/bin:/usr/local/bin:/usr/bin:/bin
stamp=$(date +%Y%m%d-%H%M%S)
echo '--- toolchain ---'
rustc --version
cargo --version
echo '--- backup current source and binary ---'
mkdir -p ${shellQuote(remoteDir)}/backups /var/lib/paperproof-indexer/backups
if [ -d ${shellQuote(remoteDir)} ]; then
  tar -czf ${shellQuote(remoteDir)}/backups/source-before-deploy-$stamp.tgz -C ${shellQuote(remoteDir)} --exclude './target' --exclude './backups' . || true
fi
if [ -f ${shellQuote(remoteBin)} ]; then
  cp -a ${shellQuote(remoteBin)} ${shellQuote(remoteDir)}/backups/paperproof-indexer-reference-before-deploy-$stamp
fi
if [ -f ${shellQuote(sqlitePath)} ]; then
  cp -a ${shellQuote(sqlitePath)} /var/lib/paperproof-indexer/backups/paperproof-indexer-reference-before-deploy-$stamp.sqlite
fi
echo '--- unpack source ---'
mkdir -p ${shellQuote(remoteDir)}
rm -rf ${shellQuote(remoteDir)}/src ${shellQuote(remoteDir)}/migrations
tar -xzf ${shellQuote(remoteArchive)} -C ${shellQuote(remoteDir)}
rm -f ${shellQuote(remoteArchive)}
cd ${shellQuote(remoteDir)}
echo '--- build release ---'
cargo build --features sqlite --release
file target/release/paperproof-indexer-reference
./target/release/paperproof-indexer-reference --version
echo '--- install and restart ---'
install -m 0755 target/release/paperproof-indexer-reference ${shellQuote(remoteBin)}
systemctl restart ${shellQuote(serviceName)}
sleep 3
systemctl is-active ${shellQuote(serviceName)}
curl -fsS --max-time 20 http://127.0.0.1:8787/health
echo
echo '--- hydrate version objects ---'
${hydrateCommand}
echo '--- public route sanity from server ---'
curl -fsS --max-time 20 http://127.0.0.1:8787/v1/explore/items?limit=1 >/dev/null
`;

    await exec(conn, remoteCommand);
    console.log(`deployed ${indexerDir} -> ${config.host}:${remoteBin}`);
  } finally {
    conn.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
