# PaperProof Site Analytics Design

## Purpose

PaperProof needs a basic privacy-preserving analytics module for the official
website. The initial goal is operational visibility, not advertising-grade user
tracking:

- weekly visits and approximate unique visitors;
- page/path popularity;
- rough country or region distribution when server-side GeoIP is configured;
- source/referrer visibility for campaigns and community posts;
- a practical way to distinguish multiple visitors behind the same school,
  enterprise, VPN, or mobile-network NAT IP.

The module must stay outside the protocol trust path. It must not affect Sui
contracts, Walrus content verification, artifact publication, versioning,
comments, likes, governance, SDK behavior, or agent skills.

This document is a development guide only. It intentionally does not require any
change to `paperproof-docs` deployment skills or public documentation.

## Product Requirement

Add optional website visit analytics for `https://paperproof.site/`.

The analytics module should combine:

- a browser-generated anonymous `visitor_id`, stored locally in the browser;
- server-observed request metadata, especially IP address and user-agent;
- server-side hashing before persistence.

The resulting metric should be described as approximate anonymous browser-level
visitors, not real human users.

The implementation should not hard-code the official deployment decision in
source code. The same code should be safe for third-party self-hosting with
analytics disabled.

## Privacy And Security Principles

- Disabled by default for self-hosters and development environments.
- Enabled explicitly on the official PaperProof server.
- Do not store raw IP addresses.
- Do not store raw `visitor_id` values.
- Do not correlate analytics records with wallet addresses.
- Do not block page rendering when analytics fails.
- Do not send analytics events to third-party analytics providers.
- Keep analytics tables and APIs separate from protocol indexing tables.

## Enablement Model

Use a double opt-in model.

Frontend build-time switch:

```text
VITE_PAPERPROOF_SITE_ANALYTICS_ENABLED=false
```

Backend runtime switch:

```text
PAPERPROOF_SITE_ANALYTICS_ENABLED=false
PAPERPROOF_SITE_ANALYTICS_SALT=<server-secret>
```

Defaults should be disabled. The official deployment can set both switches to
enabled.

If the frontend sends events but the backend is disabled, the backend should
return a harmless disabled response and the frontend should ignore it.

The official server can enable the backend through runtime environment
variables. The official frontend build can enable client reporting through Vite
environment variables. Both switches should be required before records are
persisted.

## Visitor Identity Model

On first visit, the frontend creates a random UUID:

```text
paperproof.visitor_id = crypto.randomUUID()
```

The ID is stored in `localStorage` and sent with visit events. The backend never
stores it directly. It stores:

```text
visitor_id_hash = sha256(site_analytics_salt + visitor_id)
```

The backend also derives:

```text
ip_hash = sha256(site_analytics_salt + canonical_client_ip)
user_agent_hash = sha256(site_analytics_salt + user_agent)
fallback_visitor_key = sha256(site_analytics_salt + canonical_client_ip + user_agent + accept_language)
```

The hash input should use clear delimiters or structured serialization so
different field combinations cannot accidentally collide before hashing.

Weekly unique visitors should be counted with this priority:

```text
coalesce(visitor_id_hash, fallback_visitor_key)
```

This can distinguish most multi-user shared-IP cases because different browsers
behind the same NAT will have different local `visitor_id` values. It remains an
estimate:

- one person using multiple browsers or devices may count multiple times;
- clearing browser storage creates a new visitor;
- incognito sessions may create temporary visitors;
- multiple people sharing one browser may count once;
- browsers without localStorage fall back to less reliable server-side signals.

## Client-Side Changes

Repository:

```text
paperproof-app
```

Suggested new module:

```text
src/services/site-analytics.ts
```

Responsibilities:

- check `VITE_PAPERPROOF_SITE_ANALYTICS_ENABLED`;
- create or read the local anonymous visitor ID;
- report page views on initial load and route changes;
- debounce duplicate route reports, especially when the app re-renders without
  a real route change;
- include non-sensitive browser context:
  - route or path;
  - referrer;
  - timezone;
  - language;
  - screen size;
  - device pixel ratio;
  - platform when available.

Suggested request:

```http
POST /api/v1/site-analytics/visit
Content-Type: application/json
```

```json
{
  "visitorId": "browser-generated-uuid",
  "path": "/#/type/preprints",
  "referrer": "https://x.com/...",
  "timezone": "Asia/Shanghai",
  "language": "zh-CN",
  "screen": "2560x1440",
  "devicePixelRatio": 1.25,
  "platform": "Win32"
}
```

The reporter should be fire-and-forget. Network errors, disabled responses, and
HTTP errors should be ignored silently.

Do not send IP address or user-agent from the browser body. Those values should
come from server-observed request metadata so the request schema remains small
and ordinary client-side code cannot accidentally spoof the server-side fields.

## Server-Side Changes

Repository:

```text
paperproof-indexer-reference
```

Suggested new module:

```text
src/site_analytics.rs
```

Use a distinct module name such as `site_analytics.rs`. The repository already
has `src/analytics.rs` for protocol/indexer summary analytics; do not overload
that file with website visit tracking.

Suggested API routes in `src/api.rs`:

```text
POST /v1/site-analytics/visit
GET  /v1/site-analytics/weekly
```

The `visit` endpoint should:

- check `PAPERPROOF_SITE_ANALYTICS_ENABLED`;
- validate and normalize the request body;
- apply field length caps, for example path/referrer/user-agent limits, to avoid
  unbounded database writes;
- resolve the canonical client IP from trusted proxy headers;
- hash identifiers before persistence;
- write a visit event or increment a daily/weekly aggregate;
- return a small success or disabled response.

The `weekly` endpoint should return operational summaries for admin/manual
inspection:

```json
{
  "weekStart": "2026-06-22",
  "visits": 1234,
  "uniqueVisitors": 321,
  "uniqueIps": 240,
  "topPaths": [
    { "path": "/#/explore", "visits": 400 }
  ],
  "countries": [
    { "country": "US", "visits": 300 }
  ]
}
```

Access control for the read endpoint can start simple. For the first version,
it can be bound to localhost/admin-only server access or guarded by an
environment-configured admin token. The write endpoint should not expose raw
records.

If an admin token is used, read it from an environment variable such as
`PAPERPROOF_SITE_ANALYTICS_ADMIN_TOKEN`. Do not place it in frontend build
variables, static assets, or repository files.

## Client IP Handling

Because the API server usually sits behind Nginx or another reverse proxy, the
backend must not blindly trust arbitrary forwarded headers from the public
internet. It should only trust these headers when the direct peer is the known
reverse proxy:

- `X-Real-IP`;
- `X-Forwarded-For`;
- optionally provider-specific headers if a CDN is added later.

Preferred order:

1. trusted `X-Real-IP`;
2. first trusted value from `X-Forwarded-For`;
3. direct peer socket IP as fallback.

The current API server is built with Axum. If direct peer IP fallback is needed,
the implementation should use Axum's `ConnectInfo<SocketAddr>` pattern and serve
the router with connection info. If that change is too invasive for the first
iteration, the first version may require trusted reverse-proxy headers and
record `"unknown"` when neither trusted header is available.

Nginx should pass:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## Database Shape

Start with one raw event table. Aggregates can be added later if query volume
becomes meaningful.

There are two implementation contexts:

- initial schemas under `migrations/sqlite/001_reference.sql` and
  `migrations/postgres/001_reference.sql`, used for fresh databases;
- an incremental migration or startup `create table if not exists` path for the
  already-running official server database.

Do not assume editing the initial schema file alone will update the live server.

SQLite sketch:

```sql
create table if not exists site_visit_events (
    id integer primary key autoincrement,
    occurred_at text not null default current_timestamp,
    week_start text not null,
    visitor_id_hash text,
    ip_hash text,
    fallback_visitor_key text,
    user_agent_hash text,
    path text not null,
    referrer text,
    language text,
    timezone text,
    screen text,
    device_pixel_ratio text,
    platform text,
    country text
);

create index if not exists site_visit_events_week_idx
    on site_visit_events(week_start, occurred_at desc);

create index if not exists site_visit_events_visitor_week_idx
    on site_visit_events(week_start, visitor_id_hash);

create index if not exists site_visit_events_path_week_idx
    on site_visit_events(week_start, path);
```

Postgres sketch should mirror the same fields with `bigserial` and
`timestamptz`.

Retention can be added later. A reasonable default is to keep raw event rows for
90-180 days and preserve weekly aggregates longer.

For weekly grouping, compute `week_start` server-side in UTC unless the product
explicitly wants a different reporting timezone. Keep the timezone choice stable
so week-over-week comparisons do not drift.

## GeoIP

GeoIP is optional. If enabled, perform lookup server-side and store only coarse
fields such as country or region. Do not store precise location derived from IP.

The first version can leave `country` empty and still provide useful weekly
traffic and path analytics.

## Coupling Assessment

Low coupling.

Touches:

- `paperproof-app`: one new reporter service and a small hook from app startup
  or route rendering.
- `paperproof-indexer-reference`: one isolated analytics module, two API routes,
  and database schema additions.

Does not touch:

- PaperProof Move contracts;
- contract deployment metadata;
- Walrus upload/download verification;
- artifact publication and add-version transaction logic;
- comments, likes, governance, SDKs, or skills.

## Implementation Phases

Phase 1:

- add backend config and disabled-by-default API;
- add database table for both fresh schemas and existing deployments;
- add frontend visitor ID and fire-and-forget reporting;
- add weekly summary query.

Phase 1 should include tests for:

- disabled backend does not write records;
- enabled backend hashes identifiers and does not store raw IP or raw visitor ID;
- shared IP with different visitor IDs counts as multiple anonymous visitors;
- missing visitor ID falls back to IP/user-agent/language grouping;
- overly long fields are truncated or rejected safely;
- frontend analytics failures do not break app startup, routing, or rendering.

Phase 2:

- add admin-only dashboard or CLI query;
- add GeoIP country summaries;
- add retention cleanup;
- add simple bot filtering for obvious crawler user-agents.

Before enabling on the official server, verify that the production reverse proxy
passes the expected IP headers and that the backend only trusts those headers
from the local proxy path.

## Non-Goals

- No advertising-grade fingerprinting.
- No cross-site tracking.
- No wallet-to-visitor identity graph.
- No third-party analytics script.
- No on-chain analytics writes.
- No dependency on analytics for normal website behavior.
