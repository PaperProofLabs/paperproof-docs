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

For joint debugging:

1. Verify Caddy routes first.
2. Verify indexer process/container is listening locally.
3. Verify local API response from the server.
4. Verify public API response through Caddy.
5. Verify the frontend consumes the API response without falling back to direct
   browser-side Sui/Walrus fetches when server-side indexer data is expected.

Do not infer indexer correctness from the frontend alone.
