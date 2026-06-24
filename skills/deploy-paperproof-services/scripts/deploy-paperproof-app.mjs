#!/usr/bin/env node
// Deploy the built PaperProof website to the configured production server.
// This script intentionally reads credentials from the local secrets file and
// never prints secret values.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const helperPackage = process.env.PAPERPROOF_DEPLOY_HELPER_PACKAGE
  || path.join(os.tmpdir(), 'paperproof-deploy-node/package.json');
const requireFromHelper = fs.existsSync(helperPackage)
  ? createRequire(helperPackage)
  : createRequire(import.meta.url);
const { Client } = requireFromHelper('ssh2');

const root = process.env.PAPERPROOF_ROOT
  || path.resolve(scriptDir, '../../../..');
const appDir = process.env.PAPERPROOF_APP_DIR || path.join(root, 'paperproof-app');
const distDir = process.env.PAPERPROOF_DIST_DIR || path.join(appDir, 'dist');
const configPath = process.env.PAPERPROOF_SERVER_CONFIG || path.join(root, 'secrets/jdcloud-paperproof-server.json');
const appBuildCommand = process.env.PAPERPROOF_APP_BUILD_COMMAND || 'npm';
const verifyNeedles = (process.env.PAPERPROOF_VERIFY_TEXT || '')
  .split('|')
  .map((value) => value.trim())
  .filter(Boolean);

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function readConfig() {
  const raw = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function buildOfficialApp() {
  const env = {
    ...process.env,
    VITE_PAPERPROOF_SITE_ANALYTICS_ENABLED:
      process.env.VITE_PAPERPROOF_SITE_ANALYTICS_ENABLED || 'true',
    VITE_PAPERPROOF_INDEXER_API_BASE:
      process.env.VITE_PAPERPROOF_INDEXER_API_BASE || '/api',
  };
  if (process.platform === 'win32') {
    execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `${appBuildCommand} run build`], {
      cwd: appDir,
      env,
      stdio: 'inherit',
    });
    return;
  }
  execFileSync(appBuildCommand, ['run', 'build'], {
    cwd: appDir,
    env,
    stdio: 'inherit',
  });
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
      stream.on('data', (chunk) => { stdout += chunk.toString(); });
      stream.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    });
  });
}

function openSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp)));
  });
}

function mkdir(sftp, dir) {
  return new Promise((resolve, reject) => {
    sftp.mkdir(dir, (err) => {
      if (err && err.code !== 4) reject(err);
      else resolve();
    });
  });
}

function fastPut(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => (err ? reject(err) : resolve()));
  });
}

async function uploadDir(sftp, localDir, remoteDir) {
  await mkdir(sftp, remoteDir);
  for (const entry of fs.readdirSync(localDir, { withFileTypes: true })) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDir(sftp, localPath, remotePath);
    } else if (entry.isFile()) {
      await fastPut(sftp, localPath, remotePath);
    }
  }
}

async function main() {
  buildOfficialApp();

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(`Missing build output after official app build: ${distDir}.`);
  }

  const config = readConfig();
  const remoteRoot = config.deployment?.webRoot || '/var/www/paperproof';
  const remoteNew = `${remoteRoot}.new-${Date.now()}`;
  const conn = await connect(config);

  try {
    const sftp = await openSftp(conn);
    await exec(conn, `rm -rf ${shellQuote(remoteNew)} && mkdir -p ${shellQuote(remoteNew)}`);
    await uploadDir(sftp, distDir, remoteNew);

    const needleChecks = verifyNeedles
      .map((needle) => `grep -R ${shellQuote(needle)} ${shellQuote(remoteRoot)} >/dev/null`)
      .join('\n');

    const swap = `set -e
ts=$(date +%Y%m%d-%H%M%S)
if [ -d ${shellQuote(remoteRoot)} ]; then mv ${shellQuote(remoteRoot)} ${shellQuote(remoteRoot)}.backup-$ts; fi
mv ${shellQuote(remoteNew)} ${shellQuote(remoteRoot)}
find ${shellQuote(remoteRoot)} -type d -exec chmod 755 {} \\;
find ${shellQuote(remoteRoot)} -type f -exec chmod 644 {} \\;
systemctl reload caddy || true
curl -fsS --max-time 20 http://127.0.0.1:8080/ >/dev/null
${needleChecks}
`;

    await exec(conn, swap);
    console.log(`deployed ${distDir} -> ${config.host}:${remoteRoot}`);
  } finally {
    conn.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
