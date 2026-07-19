Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# PaperProof Path-Route Rewrite Rollout Plan

## 1. Purpose

This document gives the concrete rollout plan for the long-term correct URL
strategy for `https://paperproof.site/`:

- keep path-based canonical URLs;
- make those path URLs directly accessible in production;
- use the existing Caddy-based deployment shape rather than expanding static
  route-shell generation forever.

This plan is tailored to the current PaperProof production setup:

- static site root at `/var/www/paperproof`
- Caddy in front of the site
- reverse-proxied routes for `/api/*` and `/memwal-relayer/*`
- `paperproof-app` as a browser-rendered application
- official deploy path through
  `paperproof-official-skill/skills/deploy-paperproof-services/scripts/deploy-paperproof-app.mjs`

This document does not change product UI or protocol behavior. It is an
infrastructure and route-serving plan.

## 1.1 Non-goals and invariants

This rollout must not be used as a pretext to redesign the product shell,
restructure page DOM, or alter protocol-facing interaction flows.

The following invariants must hold:

- desktop UI layout stays visually unchanged;
- current mobile UI stays visually unchanged;
- wallet connect, publish, add-version, comment, like, governance, and Copilot
  flows keep their current client-side behavior;
- no protocol object, indexer contract, or application data model is changed by
  the rewrite rollout;
- the same built `paperproof-app` bundle remains the rendering source for both
  hash-entry and path-entry access;
- the rewrite layer only changes how the HTML shell is served, not what the UI
  renders once the app loads.

## 2. Current Reality

### 2.1 What already exists

The current app now has the necessary browser-side foundation to understand
pathname routes in addition to hash routes. That means URLs such as:

- `/docs/getting-started/introduction`
- `/blog/publishing-paperproof-across-zenodo-osf-and-speaker-deck`
- `/artifact/PaperProof-blog_post-001172-586090a52316`
- `/proposal/PPRF-GOV-...`

can be treated as first-class public URLs by the frontend.

The production server is already served behind Caddy, and the representative
runtime shape is:

```caddy
paperproof.site {
	handle_path /memwal-relayer/* {
		reverse_proxy 127.0.0.1:3001
	}

	handle_path /api/* {
		reverse_proxy 127.0.0.1:8787
	}

	root * /var/www/paperproof
	try_files {path} /index.html
	file_server
}
```

This means the target architecture is close. The remaining work is to make the
rewrite policy explicit, safe, and deployment-verified.

### 2.2 Why static route shells are not the long-term answer

Static route shells are acceptable for a small controlled set of pages such as:

- Docs
- official Blog
- official Forum topic pages

But they are not a durable solution for:

- artifact detail pages
- proposal detail pages
- future larger public content inventories

because those pages grow continuously and should not require a full shell list
to exist before they become directly accessible.

The long-term correct source of path accessibility should be server rewrite,
not pre-generated shell sprawl.

## 3. Goal State

The desired production behavior is:

1. Requests to known public PaperProof path routes return the SPA entry point
   and let the app render the correct page.
2. Requests to real static files continue to return the real files.
3. Requests to `/api/*` and `/memwal-relayer/*` continue to be reverse proxied
   before any SPA fallback logic.
4. Unknown garbage paths should not be silently rewritten forever if they are
   not part of the PaperProof route space.
5. Deploy verification should prove that canonical path URLs really work after
   each production deploy.

Additional parity goals:

6. Direct path entry must preserve existing query-driven behavior such as list
   sorting, pagination, and proposal-create query presets.
7. The same not-found behavior currently shown by the app should remain the
   not-found behavior after path-entry rollout.
8. Route serving changes must not introduce desktop/mobile visual drift because
   the same app shell and CSS bundle must continue to render the page.

## 4. Recommended Rewrite Strategy

## 4.1 Use Caddy rewrite as the primary path-entry mechanism

The recommended long-term mechanism is:

- Caddy serves static assets directly when a file exists.
- Caddy rewrites only known PaperProof route families to `/index.html`.
- The frontend takes over after the HTML shell is returned.

This is better than a blanket fallback for every unknown path because it avoids
turning arbitrary broken URLs into soft-404 HTML responses.

It also keeps the rewrite change strictly in the serving layer. No HTML
rewriting, no server-injected UI fragments, and no alternative mobile/desktop
markup should be introduced as part of this rollout.

## 4.2 Route families that should rewrite

### Public SEO routes

These should be path-accessible and canonical:

- `/`
- `/explore`
- `/docs`
- `/docs/*`
- `/blog`
- `/blog/*`
- `/forum`
- `/forum/*`
- `/artifact/*`
- `/proposal/*`
- `/type/*`
- `/governance`

### Interactive but still direct-access routes

These are not necessarily index-first pages, but they should still work when
opened directly:

- `/publish`
- `/space`
- `/governance/create`
- `/artifact/*/add-version`

These may later receive `noindex` treatment at the metadata level, but direct
route access should still function.

Important constraint:

- this phase enables direct path access for these pages;
- it does not require internal app navigation to stop using hash links yet;
- it does not require automatic redirects from hash URLs to path URLs.

## 4.3 Route families that must not hit SPA fallback first

These must remain ahead of rewrite logic:

- `/api/*`
- `/memwal-relayer/*`
- real static assets under `/assets/*`
- static public files such as:
  - `/robots.txt`
  - `/sitemap.xml`
  - `/favicon.png`
  - `/docs/manifest.json`
  - `/blog/manifest.json`
  - `/forum/manifest.json`
  - `/prompts/manifest.json`

Additional static files that must continue to bypass SPA rewrite:

- hashed JS/CSS assets under `/assets/*`
- image files, PDF files, and other future public assets if they are emitted as
  real files under the site root
- any future machine-readable public files such as `.well-known/*` if added

## 5. Recommended Caddy Configuration Shape

## 5.1 Preferred hardened version

The preferred long-term Caddy shape is an allowlisted SPA rewrite implemented
inside `route { ... }` so evaluation order is explicit:

```caddy
paperproof.site {
	route {
		handle_path /memwal-relayer/* {
			reverse_proxy 127.0.0.1:3001
		}

		handle_path /api/* {
			reverse_proxy 127.0.0.1:8787
		}

		root * /var/www/paperproof

		@staticFiles file
		handle @staticFiles {
			file_server
		}

		@spaRoutes {
			path /
			path /explore
			path /docs
			path /docs/*
			path /blog
			path /blog/*
			path /forum
			path /forum/*
			path /artifact/*
			path /proposal/*
			path /type/*
			path /governance
			path /governance/create
			path /publish
			path /space
		}

		handle @spaRoutes {
			rewrite * /index.html
			file_server
		}

		handle {
			respond "Not Found" 404
		}
	}
}
```

Key safety property of this configuration:

- `@staticFiles file` must be evaluated before `@spaRoutes`, otherwise
  `/docs/manifest.json`, `/blog/manifest.json`, hashed assets, and other real
  files may incorrectly return `index.html`.
- in Caddy, directive sorting can defeat apparent textual order, and this was
  observed in practice during rollout;
- therefore `route { ... }` is the required production shape, not merely an
  optional hardening.

## 5.2 Why this shape is preferred

This shape is preferred because:

- static files are served directly and cheaply;
- API and relayer routes cannot be swallowed by the SPA fallback;
- known public route families work without needing one static shell per page;
- obviously invalid unknown paths can still return 404 instead of fake success.

## 5.3 Minimum fallback shape

If the current production config is still the simpler:

```caddy
root * /var/www/paperproof
try_files {path} /index.html
file_server
```

it is still acceptable as a temporary bridge, but it is not the preferred
long-term form because it rewrites too broadly.

The rollout target should be the allowlisted route-family form above.

## 6. App-Side Requirements

The rewrite plan assumes the frontend can already read pathname routes.

That means the app must continue to support:

- reading route state from `window.location.pathname` when no hash is present;
- continuing to support legacy `#/...` links during transition;
- keeping canonical URLs path-based.

It also assumes:

- the browser URL must remain the originally requested pathname URL after load;
- the server must not 30x-redirect public path pages into `#/...`;
- query parameters such as `?sort=` and `?commentsPage=` must remain available
  to the client route parser on direct path entry.

This plan does not require a desktop or mobile UI redesign.

This plan also does not require:

- replacing current in-app hash navigation links in the same rollout;
- changing button labels, page spacing, headers, drawers, or detail layouts;
- creating alternate server-rendered desktop and mobile page variants.

## 7. Deployment Integration

## 7.1 Production deployment path

Production deploys should continue to go through:

```powershell
node .\paperproof-official-skill\skills\deploy-paperproof-services\scripts\deploy-paperproof-app.mjs
```

The rewrite rollout should not replace that script. Instead, the script and its
skill should be treated as the official deployment harness.

## 7.2 What must be added to the deploy verification flow

After the rewrite plan is applied, post-deploy verification must check more
than `/`.

At minimum, the official deploy flow should verify that these public path URLs
return the PaperProof app shell and not 404:

- `https://paperproof.site/explore`
- `https://paperproof.site/docs/getting-started`
- `https://paperproof.site/blog`
- `https://paperproof.site/forum`

And at least one real dynamic-detail example should also be checked:

- one known artifact path
- one known proposal path when available

The verification goal is not full semantic rendering validation in the deploy
script. The goal is to prove:

- path route reaches the app shell;
- Caddy did not misroute it;
- API proxy routes still return JSON rather than HTML.

The deploy verifier should not mutate UI or simulate wallet actions as part of
this rewrite check. It only needs to prove serving correctness and route
parity.

## 7.3 Deploy script verification checklist

The official app deploy script should eventually verify:

1. `/` returns the new asset hash references.
2. `/explore` returns HTML, not 404.
3. `/docs/getting-started` returns HTML, not 404.
4. `/blog` returns HTML, not 404.
5. `/artifact/<known-code>` returns HTML, not 404.
6. `/api/health` still returns API JSON.
7. `/memwal-relayer/config` still returns relayer JSON.

It should also verify at least one query-preserving route such as:

8. `/type/blog-posts?sort=updated` returns HTML shell rather than 404.

And when convenient:

9. `/artifact/<known-code>?commentsPage=2` still reaches the app shell.

This check belongs in official ops skill territory, not community skill
territory.

## 8. Rollout Phases

## Phase A: Confirm current production Caddy behavior

Before changing production Caddy, confirm what is actually live:

- inspect `/etc/caddy/Caddyfile`
- confirm route ordering
- confirm whether the current site already rewrites all unknown paths
- confirm that `/api/*` and `/memwal-relayer/*` are above the fallback

Success condition:

- current behavior is fully understood rather than inferred.

## Phase B: Move from broad fallback to allowlisted rewrite

If production is still using the broad `try_files {path} /index.html`
fallback, update it to the allowlisted route-family version.

Success condition:

- known PaperProof routes work;
- static assets work;
- API and relayer routes still proxy correctly;
- direct path entry preserves query-driven client behavior;
- current not-found rendering still appears through the same app path when an
  object under a valid route family does not exist;
- unknown junk paths no longer all look like valid pages.

## Phase C: Expand deployment verification

Update the official deploy flow so path-route checks are part of production app
deploy verification.

Success condition:

- future deploys cannot silently regress pathname entry support.

## Phase D: Keep canonical path URLs

Once Caddy rewrite and deploy verification are in place, keep path-based
canonical URLs for:

- docs
- blog
- artifact
- proposal
- type
- governance

Success condition:

- canonical URLs match truly accessible public URLs.

## 9. Validation Commands

## 9.1 Server-side validation

On the server:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
curl -i --max-time 15 http://127.0.0.1:8080/explore
curl -i --max-time 15 http://127.0.0.1:8080/docs/getting-started
curl -i --max-time 15 http://127.0.0.1:8080/blog
curl -i --max-time 15 http://127.0.0.1:8080/api/health
curl -i --max-time 15 http://127.0.0.1:8080/memwal-relayer/config
```

Expected:

- public path routes return HTML shell
- `/api/health` returns JSON
- `/memwal-relayer/config` returns JSON
- query parameters remain visible to the app after direct path entry

## 9.2 Public validation

From the workstation:

```powershell
curl.exe -i https://paperproof.site/explore
curl.exe -i https://paperproof.site/docs/getting-started
curl.exe -i https://paperproof.site/blog
curl.exe -i https://paperproof.site/api/health
curl.exe -i https://paperproof.site/memwal-relayer/config
curl.exe -i "https://paperproof.site/type/blog-posts?sort=updated"
```

## 10. Failure Modes To Guard Against

1. API route swallowed by SPA fallback

- symptom: JSON endpoint returns `<!doctype html>`
- cause: reverse proxy route placed after rewrite/fallback

2. Unknown route families rewritten forever

- symptom: arbitrary garbage URLs return 200 with app shell
- cause: overly broad fallback instead of allowlisted rewrite

3. Canonical points to path URL but server still does not serve that path

- symptom: search engine sees a canonical that is not truly reachable
- cause: metadata rollout got ahead of routing rollout

4. Static files accidentally rewritten

- symptom: manifest JSON or asset file requests return `index.html`
- cause: rewrite ran before file existence handling

5. Query-driven route state lost on direct path entry

- symptom: sorting, comments pagination, or governance create presets reset to
  defaults when a pathname URL includes query parameters
- cause: rewrite works, but frontend route parsing or verification did not
  account for pathname + query together

6. UI drift accidentally introduced during rewrite rollout

- symptom: desktop or mobile layout changes even though the task was only route
  serving
- cause: implementation mixed rewrite work with page-template, CSS, or DOM
  changes instead of keeping the same app shell

## 11. Rollback Plan

If the allowlisted rewrite introduces an outage:

1. restore the previous Caddyfile;
2. validate Caddy config;
3. reload Caddy;
4. verify `/`, `/api/health`, and `/memwal-relayer/config`;
5. temporarily keep the broader fallback if needed while route allowlist is
   corrected.

Rollback should affect only web serving rules, not app build output and not
protocol state.

If a rollback is required, it should also preserve:

- current hashed asset serving;
- current API and relayer route precedence;
- current browser-rendered UI and interaction flows.

## 12. Final Recommendation

For PaperProof’s current production architecture, the long-term correct path is:

- keep path-based canonical URLs;
- rely on Caddy rewrite, not static route-shell expansion, for growing dynamic
  public routes such as artifacts and proposals;
- harden rewrite into an allowlisted route-family configuration;
- preserve `/api/*` and `/memwal-relayer/*` precedence;
- add path-route verification to the official deployment skill so this does not
  regress later.

That gives PaperProof:

- stable public URLs for SEO and sharing,
- direct access to dynamic content pages,
- no UI redesign,
- no desktop/mobile layout change,
- no protocol logic change,
- and a deployment model that fits the current official server shape.
