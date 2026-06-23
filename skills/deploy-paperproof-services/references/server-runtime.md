# PaperProof Server Runtime

## Known Runtime Shape

The official website is served from a static build of `paperproof-app` behind
Caddy. Server credentials and the web root are stored locally in:

```text
<PaperProofLabs workspace>\secrets\jdcloud-paperproof-server.json
```

Common values:

- host: `47.238.130.218`
- web root: `/var/www/paperproof`
- public site: `https://paperproof.site/`
- local Caddy/static check: `http://127.0.0.1:8080/`
- public indexer API prefix: `https://paperproof.site/api/v1/`

Do not print the password from the secrets file.

## Caddy Route Ordering

Caddy must route API/proxy paths before the static SPA fallback. The important
pattern is:

```caddyfile
paperproof.site {
	handle_path /memwal-relayer/* {
		reverse_proxy https://relayer.memwal.ai {
			header_up Host relayer.memwal.ai
		}
	}

	handle {
		root * /var/www/paperproof
		try_files {path} /index.html
		file_server
	}
}

www.paperproof.site, paperproof.pub, www.paperproof.pub, paperproof.ink, www.paperproof.ink, paperproof.me, www.paperproof.me {
	redir https://paperproof.site{uri} permanent
}

:8080 {
	handle_path /memwal-relayer/* {
		reverse_proxy https://relayer.memwal.ai {
			header_up Host relayer.memwal.ai
		}
	}

	handle {
		root * /var/www/paperproof
		try_files {path} /index.html
		file_server
	}
}
```

If `/memwal-relayer/*` is placed after `try_files {path} /index.html`, the app
may receive HTML when it expects JSON and report:

```text
Unexpected token '<', "<!doctype "... is not valid JSON
```

## Caddy Validation Commands

Run these after any Caddyfile change:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
curl -i --max-time 15 http://127.0.0.1:8080/
curl -i --max-time 15 http://127.0.0.1:8080/memwal-relayer/config
curl -i --max-time 15 http://127.0.0.1:8080/memwal-relayer/health
curl -i -X OPTIONS --max-time 15 http://127.0.0.1:8080/memwal-relayer/api/recall
```

Then verify publicly:

```powershell
curl.exe -i https://paperproof.site/ --max-time 30
curl.exe -i https://paperproof.site/memwal-relayer/config --max-time 30
curl.exe -i https://paperproof.site/memwal-relayer/health --max-time 30
curl.exe -i -X OPTIONS https://paperproof.site/memwal-relayer/api/recall --max-time 30
```

## Website Deployment Flow

Use the deployment script in this skill rather than rewriting ad hoc upload
logic. The script swaps a new web root into place and leaves the previous one
as `/var/www/paperproof.backup-YYYYMMDD-HHMMSS`.

When verifying a UI string, pass expected text via:

```powershell
$env:PAPERPROOF_VERIFY_TEXT = 'Prompt Registry package|Memory Registry package'
node .\paperproof-docs\skills\deploy-paperproof-services\scripts\deploy-paperproof-app.mjs
Remove-Item Env:\PAPERPROOF_VERIFY_TEXT -ErrorAction SilentlyContinue
```

## Indexer Reference Service

Repository:

```text
<PaperProofLabs workspace>\paperproof-indexer-reference
```

Production paths:

```text
source/cache dir: /opt/paperproof-indexer
binary: /usr/local/bin/paperproof-indexer-reference
service: paperproof-indexer.service
sqlite db: /var/lib/paperproof-indexer/paperproof-indexer-reference.sqlite
local bind: 127.0.0.1:8787
```

Current production service shape:

```ini
WorkingDirectory=/opt/paperproof-indexer
ExecStart=/usr/local/bin/paperproof-indexer-reference serve --backend sqlite --bind 127.0.0.1:8787 --sqlite-path /var/lib/paperproof-indexer/paperproof-indexer-reference.sqlite --official-manifest-base-url https://paperproof.site --walrus-aggregator-url https://aggregator.walrus-mainnet.walrus.space
```

Important deployment history:

- `/opt/paperproof-indexer/target/release/paperproof-indexer-reference` has
  been built on the server as a Linux ELF release binary.
- `/usr/local/bin/paperproof-indexer-reference` is installed from that release
  binary and then `paperproof-indexer.service` is restarted.
- Do not assume the system default `cargo` is usable for current code.

Server Rust trap:

```text
system cargo: /usr/bin/cargo 1.75.0
system rustc: /usr/bin/rustc 1.75.0
working cargo: /root/.cargo/bin/cargo 1.96.0
working rustc: /root/.cargo/bin/rustc 1.96.0
```

Always build production indexer releases with:

```bash
export PATH=/root/.cargo/bin:/usr/local/bin:/usr/bin:/bin
```

`paperproof-indexer-reference` uses Rust 2024. If the build fails with
`feature edition2024 is required`, the wrong Cargo is being used.

Local deployment scaffold:

```text
paperproof-indexer-reference/deploy/docker-compose.yml
```

The compose file defines:

- `postgres` on port `5432`;
- `api` serving `paperproof-indexer-reference serve --bind 0.0.0.0:8787`;
- `PAPERPROOF_INDEXER_POSTGRES_URL` pointing at the compose Postgres service.

Before changing production indexer state, inspect what is already running:

```bash
systemctl list-units '*paperproof*' --no-pager
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
ss -lntp
journalctl -u caddy -n 100 --no-pager
```

Preferred production deployment command from the workspace:

```powershell
cargo test --features sqlite --manifest-path .\paperproof-indexer-reference\Cargo.toml
node .\paperproof-docs\skills\deploy-paperproof-services\scripts\deploy-paperproof-indexer.mjs
```

The deployment script backs up:

```text
/opt/paperproof-indexer/backups/source-before-deploy-*.tgz
/opt/paperproof-indexer/backups/paperproof-indexer-reference-before-deploy-*
/var/lib/paperproof-indexer/backups/paperproof-indexer-reference-before-deploy-*.sqlite
```

After schema or projection changes that require reading version objects from
Sui, run or let the script run:

```bash
/usr/local/bin/paperproof-indexer-reference hydrate-version-objects \
  --backend sqlite \
  --sqlite-path /var/lib/paperproof-indexer/paperproof-indexer-reference.sqlite
```

Healthy result after the Blob Object backfill:

```json
{
  "scanned_versions": 0,
  "hydrated_versions": 0,
  "missing_versions": 0,
  "failed_versions": 0
}
```

Immediately verify:

```bash
systemctl is-active paperproof-indexer
curl -fsS http://127.0.0.1:8787/health
curl -fsS 'http://127.0.0.1:8787/v1/explore/items?limit=1' >/dev/null
```

Then verify publicly from Windows:

```powershell
Invoke-RestMethod -Uri 'https://paperproof.site/api/v1/explore/items?artifact_type=3&limit=5'
Invoke-RestMethod -Uri 'https://paperproof.site/api/v1/artifacts/lookup?q=PaperProof-technical_report-001162-4f414f76bdc5'
```

Do not use `https://paperproof.site/v1/...` for public API checks. That path is
served by the static SPA fallback and returns HTML, not indexer JSON.

For joint debugging:

1. Verify Caddy routes first.
2. Verify indexer process/container is listening locally.
3. Verify local API response from the server.
4. Verify public API response through Caddy.
5. Verify the frontend consumes the API response without falling back to direct
   browser-side Sui/Walrus fetches when server-side indexer data is expected.

Do not infer indexer correctness from the frontend alone.
