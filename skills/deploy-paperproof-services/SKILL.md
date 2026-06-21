---
name: deploy-paperproof-services
description: Deploy and debug PaperProof production services from this workstation, including the official website static build, Caddy reverse proxy, MemWal relayer route, and paperproof-indexer-reference server integration. Use when Codex must publish paperproof-app to paperproof.site, update server-side Caddy/indexer configuration, verify HTTPS/public routes, or recover from Codex sandbox/network-profile deployment failures.
---

# Deploy PaperProof Services

## Scope

Use this skill for production deployment and server-side debugging of
PaperProof services hosted for `https://paperproof.site/`.

Primary cases:

- deploy `paperproof-app/dist` to the official website server;
- reload or inspect Caddy for `paperproof.site`;
- verify `/memwal-relayer/*` and indexer/API proxy routes;
- deploy or debug `paperproof-indexer-reference`;
- diagnose why a Codex session can no longer reach the server after a restart,
  profile change, or thread restore.

For browser UI operation, wallet flows, screenshots, or website publishing
through the UI, use `paperproof-docs/skills/operate-paperproof-website/SKILL.md`
instead.

## Critical Lesson

Do not start with `scp`, OpenSSH askpass, or ad hoc password prompts. The
reliable path on this workstation is a Node deployment helper using `ssh2`:

- helper directory:
  `%LOCALAPPDATA%\Temp\paperproof-deploy-node` on Windows, or the path resolved
  from Node `os.tmpdir()`
- dependency:
  `ssh2`
- server config:
  `<PaperProofLabs workspace>\secrets\jdcloud-paperproof-server.json`
- app web root:
  usually `/var/www/paperproof`

If network access fails with `EACCES`, first check the current Codex execution
profile. A previous failure was caused by a restricted sandbox/network profile,
not by the server, not by Caddy, and not by the deployment script.

## Preflight

1. Verify the requested change is built locally:

```powershell
cd <PaperProofLabs workspace>\paperproof-app
npm run build
```

2. Verify the current Codex tool environment can reach the server:

```powershell
@'
const net = require('net');
const targets = [
  ['47.238.130.218', 22],
  ['47.238.130.218', 80],
  ['47.238.130.218', 443],
  ['paperproof.site', 443],
];
function test(host, port) {
  return new Promise((resolve) => {
    const s = net.createConnection({ host, port, timeout: 8000 });
    s.once('connect', () => { s.destroy(); resolve(`${host}:${port} open`); });
    s.once('timeout', () => { s.destroy(); resolve(`${host}:${port} timeout`); });
    s.once('error', (e) => resolve(`${host}:${port} error ${e.code || e.message}`));
  });
}
(async () => { for (const [h,p] of targets) console.log(await test(h,p)); })();
'@ | node
```

Healthy result:

```text
47.238.130.218:22 open
47.238.130.218:80 open
47.238.130.218:443 open
paperproof.site:443 open
```

If the result is `EACCES`, do not troubleshoot server packages yet. The current
Codex sandbox/network profile is blocking outbound network access. Ask for or
wait for a session with network enabled/full access, then retry the same
preflight.

## Website Deployment

Use the bundled script:

```powershell
cd <PaperProofLabs workspace>
node .\paperproof-docs\skills\deploy-paperproof-services\scripts\deploy-paperproof-app.mjs
```

The script:

- reads `secrets/jdcloud-paperproof-server.json`;
- connects with Node `ssh2`;
- uploads `paperproof-app/dist` to a fresh remote directory;
- swaps it into the configured web root;
- keeps the previous web root as a timestamped backup;
- reloads Caddy if present;
- verifies the remote static app responds on `127.0.0.1:8080`.

Run `npm run build` before the script unless the user explicitly wants to
deploy an already-built `dist`.

## Public Verification

After deployment, verify from the public URL, not only from local files:

```powershell
$html = Invoke-WebRequest -UseBasicParsing -Uri 'https://paperproof.site/' -TimeoutSec 30
$src = [regex]::Match($html.Content, 'src="([^"]+\.js)"').Groups[1].Value
$jsUrl = if ($src.StartsWith('http')) { $src } else { 'https://paperproof.site' + $src }
$js = Invoke-WebRequest -UseBasicParsing -Uri $jsUrl -TimeoutSec 30
[pscustomobject]@{
  Status = $html.StatusCode
  Js = $jsUrl
  HasExpectedText = $js.Content.Contains('EXPECTED_TEXT_OR_SYMBOL')
} | Format-List
```

For functional changes, verify the actual route or API behavior. Do not rely
only on `index.html` returning 200.

## Caddy And Relayer Route

Read `references/server-runtime.md` before changing Caddy, MemWal relayer
routes, or indexer/API routes.

Important invariant:

- route-specific reverse proxies such as `/memwal-relayer/*` must be handled
  before the static SPA fallback;
- otherwise Caddy may return `index.html` for API JSON routes, causing frontend
  errors like `Unexpected token '<', "<!doctype "... is not valid JSON`.

Validate Caddy changes remotely:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
curl -i --max-time 15 http://127.0.0.1:8080/memwal-relayer/config
curl -i -X OPTIONS --max-time 15 http://127.0.0.1:8080/memwal-relayer/api/recall
```

Then validate publicly:

```powershell
curl.exe -i https://paperproof.site/memwal-relayer/config --max-time 30
curl.exe -i https://paperproof.site/memwal-relayer/health --max-time 30
```

## Indexer Deployment And Joint Debugging

Read `references/server-runtime.md` before deploying or debugging the indexer.
The reference service lives in:

```text
<PaperProofLabs workspace>\paperproof-indexer-reference
```

Local deployment scaffold:

```text
paperproof-indexer-reference/deploy/docker-compose.yml
```

For production server work, inspect current remote state before changing it:

```bash
systemctl list-units '*paperproof*' --no-pager
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
ss -lntp
journalctl -u caddy -n 100 --no-pager
```

Use server-side logs plus public HTTP checks to debug website/indexer
integration. Do not assume a browser bug until server routes and API responses
are verified.

## Safety

- Never print or commit secret values from `secrets/`.
- Do not include passwords, private keys, or token values in generated Skill
  files, logs, screenshots, commits, or final responses.
- Before modifying production Caddy/indexer/systemd state, inspect current
  state and keep a backup or timestamped copy.
- Keep website UI changes and deployment changes separate when possible.
- After deployment, report what changed, what was verified, and any remaining
  uncommitted files.
