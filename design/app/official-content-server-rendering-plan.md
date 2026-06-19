# Official Content Server Rendering Plan

This note records the proposed refactor for PaperProof Docs, Blog, and Forum content loading. The goal is to make official public content faster and more reliable without changing what users see on those pages.

The plan is based on the current `paperproof-app` and `paperproof-indexer-reference` code. It should be read as a server-assisted rendering and cache plan, not as a full website SSR migration. The static app can remain the primary shell; the server provides verified official content payloads for pages that are public and identical for every user.

## Current Implementation Note

The first production implementation intentionally uses a conservative server-assisted API rather than full HTML SSR. The app still owns hash routes and page rendering, while `paperproof-indexer-reference` now provides `/v1/official/...` endpoints that prefetch official Docs, Blog, and Forum bodies, verify them against PaperProof protocol metadata, unwrap Markdown package zip content when needed, and keep the rendered Markdown in an in-memory cache.

The deployed serve process should keep this cache fresh through three layers:

- startup warmup: load all current official manifest entries before ordinary traffic needs them;
- event-driven refresh: the serve process runs the Sui event tail loop for the same SQLite store, and refreshes official content cache after new PaperProof events are indexed;
- low-frequency reconciliation: a periodic refresh remains as a fallback for manifest edits, missed events, or operational restarts.

This is not a replacement protocol source. Every cached response remains derived from the official manifest entry, Sui series/version state, Walrus blob bytes, and SHA-256 verification. Added or removed official pages still require manifest changes, so event tailing mainly makes existing official entries follow newly published versions quickly; the periodic reconciliation catches manifest-level changes.


## Deployed Behavior Notes

The deployed implementation is server-assisted, not full HTML SSR. The browser still owns hash routing and final DOM rendering, but the expensive official public content path is moved to the indexer API where possible.

Current behavior:

- Docs, Blog, and Forum still load their manifests in the browser so route metadata, ordering, titles, summaries, tags, and footer protocol IDs remain unchanged.
- The app then tries `/api/v1/official/...` for verified Markdown content. If the server response is unavailable or unsuitable, the app falls back to the previous browser-side Sui/Walrus path.
- Forum topic rendering now returns immediately when verified server-rendered topic content is available, instead of blocking the body on additional Sui comments-tree reads. This reduces the visible `Loading official Forum topic` interval for official public topics.
- The indexer hydrates official rendered content on startup and refreshes it after indexed PaperProof events, with periodic reconciliation as fallback.
- The server response remains a cache of protocol-derived facts: official manifest entry + Sui series/version state + Walrus blob bytes + SHA-256 verification.

Remaining intentional boundaries:

- The server is not the protocol authority.
- User-specific wallet actions, publishing, governance, likes, comments, and Copilot memory remain outside this public official-content renderer.
- Added or removed official pages still require manifest updates.
- Forum comments are not treated as part of the cached topic body; live comments can be refreshed independently.

## User-Facing Goal

For ordinary users, the Docs, Blog, and Forum pages should look and behave the same as they do today:

- same navigation structure;
- same titles, summaries, article bodies, topic bodies, and protocol footers;
- same artifact code, series ID, version ID, content hash, and comments tree references;
- same comments behavior for Forum topics;
- same browser routes and page layout.

The intended improvement is performance and reliability only. Content resolution, Walrus fetching, hash verification, Markdown package unpacking, and Markdown rendering can happen on the server before the user's browser asks for the page data. The app should still own route transitions, wallet state, Copilot state, and interactive protocol actions.

In short:

```text
Before: browser fetches manifest, reads Sui, downloads Walrus, verifies, unpacks, renders.
After:  server prefetches, verifies, unpacks, renders, caches; browser displays the same content faster.
```

This is not a move to a centralized CMS. The protocol facts remain on Sui and Walrus. The server is only a verified rendering cache for official public content.

The first implementation should be conservative: keep the browser views and route structure intact, and change only the data source for official rendered bodies. Any UI redesign, SEO-specific full-page SSR, or new Forum interaction model should be treated as a later project.

This also means the existing `docs/manifest.json`, `blog/manifest.json`, and `forum/manifest.json` style of page composition should not disappear in the first step. They can be ingested by the indexer/server, but the same metadata must remain available to the app.

## Current App Behavior

The current `paperproof-app` implementation is a static app with browser-side dynamic content loading.

The app manifests contain not only protocol IDs but also UI metadata. The server-side model must preserve those fields or return the original manifest entry along with rendered content. Examples include Docs section/topic IDs, Blog category/date/tags/language, and Forum section accent, counts, and ordering fields.

The server response should therefore be treated as a replacement for the expensive body-loading path, not as a replacement for the entire page state model.

### Docs

The Docs flow currently:

1. Loads `docs/manifest.json` in the browser.
2. Resolves the active section/topic from the manifest.
3. Reads the official PaperProof series and current version through the SDK.
4. Downloads the Walrus blob in the browser.
5. Computes SHA-256 and compares it with the version content hash.
6. Renders Markdown in the browser.

Relevant code:

- `src/main.ts`: `ensureDocsManifestLoaded`
- `src/main.ts`: `ensureActiveDocLoaded`
- `src/main.ts`: `loadOfficialDoc`
- `src/main.ts`: `docsView`

### Blog

The Blog flow currently:

1. Loads `blog/manifest.json` in the browser.
2. Resolves the active post.
3. Reads the PaperProof series and current version.
4. Downloads the Walrus blob.
5. Verifies hash.
6. If the content is a Markdown package zip, unpacks `manifest.json`, `index.md`, and assets.
7. Creates browser object URLs for assets.
8. Cleans display-only metadata from the body.
9. Renders Markdown in the browser.

Current Blog entries do not require `likesBookId` in the app type. The server response should not require more fields than the current page needs. If extra IDs are available from normalized state, they can be returned as optional metadata.

Relevant code:

- `src/main.ts`: `ensureBlogManifestLoaded`
- `src/main.ts`: `ensureActiveBlogPostLoaded`
- `src/main.ts`: `loadOfficialBlogPost`
- `src/main.ts`: `markdownFromPackageOrText`
- `src/main.ts`: `cleanBlogMarkdownForDisplay`
- `src/main.ts`: `blogView` and `blogPostView`

### Forum

The Forum flow currently:

1. Loads `forum/manifest.json` in the browser.
2. Resolves the active topic.
3. Reads the topic series and version.
4. Downloads and verifies the Walrus Markdown body.
5. Reads comments tree state and comments.
6. Renders topic body and comments in the browser.

Forum topic body loading and Forum comment loading are currently coupled in `loadOfficialForumTopic`, but they should be separated in the server design. Topic body rendering can be cached by version; comments are live interaction data and should stay paginated and independently refreshed.

Relevant code:

- `src/main.ts`: `ensureForumManifestLoaded`
- `src/main.ts`: `ensureActiveForumTopicLoaded`
- `src/main.ts`: `loadOfficialForumTopic`
- `src/main.ts`: `forumView` and `forumTopicView`

## Current Indexer Capabilities

`paperproof-indexer-reference` already has useful building blocks:

- event backfill and tailing;
- raw event persistence;
- normalized domain tables for artifacts, versions, comments, governance, and activity;
- Postgres and SQLite backends;
- API endpoints for artifacts, versions, comments, activity, governance, analytics, and metrics;
- content refs discovered from artifact/version events;
- a Walrus enrichment pipeline that fetches content, verifies SHA-256, and stores preview/status data.

Relevant files:

- `paperproof-indexer-reference/src/api.rs`
- `paperproof-indexer-reference/src/content.rs`
- `paperproof-indexer-reference/src/normalized.rs`
- `paperproof-indexer-reference/migrations/postgres/001_reference.sql`
- `paperproof-indexer-reference/migrations/sqlite/001_reference.sql`

The missing layer is not basic indexing. The missing layer is official public content rendering: mapping official Docs/Blog/Forum entries to PaperProof series, fetching the current version, verifying Walrus bytes, rendering Markdown/package content, and serving ready-to-display content to the app.

The current API routes expose protocol data such as artifacts, versions, comments, activity, and governance. They do not currently expose `/v1/official/...` routes, and they do not currently render official Docs/Blog/Forum bodies. Those endpoints are new work.

Important current limitation: the existing `enrich-content` command wires `SqliteContentRefStore` when the `sqlite` feature is enabled, but does not yet provide an equivalent `PostgresContentRefStore`. Postgres has schema and normalized content refs, but the Walrus enrichment worker must be extended before production Postgres can use the same content-cache path. Do not assume Postgres content enrichment is already complete.

Another current limitation: `paperproof_content_cache` stores a UTF-8 preview and verification status, not full bytes, extracted assets, rendered HTML, or Markdown package state. Official page rendering should use new tables or an explicit extension of the cache, rather than overloading `preview_utf8`.

Because official Blog posts can be Markdown package zip files, a production renderer must also decide where verified package assets live. Browser object URLs from the current app are not portable across server responses. The server should expose stable asset URLs, data-backed asset endpoints, or another content-addressed asset strategy.

## What Must Not Change

This refactor should not change the user-facing content model:

- Do not replace PaperProof artifacts with database-only content.
- Do not remove artifact code, series ID, version ID, comments tree ID, blob ID, or content hash from the page model.
- Do not change Docs/Blog/Forum routes as part of the first implementation.
- Do not change Forum comment semantics.
- Do not make the official website the protocol authority.
- Do not require the server for correctness; keep a browser-side fallback path.
- Do not drop manifest-provided UI fields such as order, accent, category, tags, author, dates, or static counts.
- Do not assume all official content is plain Markdown; Blog already uses Markdown package zip content.
- Do not route user-specific wallet, publishing, governance, or Copilot memory operations through this official-content renderer.
- Do not require a database row to be accepted as true unless it can be traced back to the manifest entry, Sui version object, Walrus blob ID, and verified hash.

The server cache should always be explainable as:

```text
verified content derived from official manifest + Sui version state + Walrus bytes
```

## Proposed Indexer Additions

### 1. Official Content Entry Mapping

Add a model that imports the app's official manifests or equivalent manifest files.

Suggested table:

```sql
create table official_content_entries (
    surface text not null,          -- docs, blog, forum
    slug text not null,
    section_id text,
    topic_id text,
    order_index integer,
    title text,
    summary text,
    series_id text not null,
    artifact_code text,
    comments_tree_id text,
    likes_book_id text,
    comments_policy text,
    source_path text,
    content_type text,
    latest_manifest_version_id text,
    latest_manifest_content_hash text,
    manifest_entry_hash text,
    manifest_json jsonb not null,
    updated_at timestamptz not null default now(),
    primary key (surface, slug)
);
```

For SQLite, use `text` instead of `jsonb` and store serialized JSON.

Use stable slug rules that match the app routes exactly. These keys are internal cache identifiers, not necessarily public URL paths:

- Docs section page: `docs:<section_id>`.
- Docs topic page: `docs:<section_id>/<topic_id>`.
- Blog post: `blog:<post_id>`.
- Forum topic: `forum:<topic_id>`.

The API can expose cleaner paths, but the cache key should be explicit enough to avoid collisions.

### 2. Rendered Content Cache

Add a cache keyed by official surface and slug, with version-aware verification fields.

Suggested table:

```sql
create table official_rendered_content (
    surface text not null,
    slug text not null,
    series_id text not null,
    version_id text not null,
    content_hash text,
    blob_id text,
    render_status text not null,
    verification_status text not null,
    markdown text,
    html text,
    plain_text text,
    assets_json jsonb,
    comments_summary_json jsonb,
    error text,
    rendered_at timestamptz not null default now(),
    renderer_version text,
    source_kind text,
    primary key (surface, slug)
);
```

For Blog package assets, `assets_json` should include a mapping from original package paths to served asset URLs or inline-safe asset references. Do not return browser object URLs from the server; those are browser-local constructs in the current app.

If full HTML sanitizer parity is not ready, the first API version may return verified Markdown plus asset mappings and let the browser keep rendering Markdown. That still removes Sui/Walrus/package-fetch latency from the normal path while avoiding sanitizer drift.

The cache should be invalidated or refreshed when any of these change:

- current version ID;
- content hash;
- Walrus blob ID;
- manifest mapping;
- render code version, if renderer behavior changes materially.

### 3. Official Content Worker

Add a worker command such as:

```bash
cargo run --features postgres -- render-official-content --surface docs
cargo run --features postgres -- render-official-content --surface blog
cargo run --features postgres -- render-official-content --surface forum
```

In practice this likely needs two commands or one command with two phases:

```text
ingest-official-manifest -> writes official_content_entries
render-official-content  -> resolves versions, fetches Walrus, verifies, renders
```

Keeping manifest ingestion separate makes it easier to update official Docs/Blog/Forum mappings without reprocessing every blob.

Worker responsibilities:

1. Read official manifest entries.
2. Resolve series and current version from normalized tables or SDK reads.
3. Read Walrus blob.
4. Verify SHA-256 against version content hash.
5. Render content into HTML.
6. Store HTML, Markdown, verification state, and protocol IDs.

Docs and Forum topic bodies can start as plain Markdown. Blog must support Markdown package zip files and assets.

Prefer normalized tables for speed, but fall back to direct SDK reads when a manifest entry is missing from the normalized index or the indexer is still catching up. Mark the response as `source_kind: normalized` or `source_kind: sdk_fallback` for debugging.

Direct SDK fallback should be bounded and observable. It is useful during indexer catch-up, but production should not silently rely on slow direct reads forever.

### 4. Official Content API

Add endpoints such as:

```text
GET /v1/official/docs
GET /v1/official/docs/{section}
GET /v1/official/docs/{section}/{topic}
GET /v1/official/blog
GET /v1/official/blog/{slug}
GET /v1/official/forum
GET /v1/official/forum/{slug}
GET /v1/official/forum/{slug}/comments?limit=&offset=
```

Avoid optional path segments in Axum routes. Use explicit routes for Docs section pages and Docs topic pages, or use query parameters.

Response shape should include rendered content and protocol metadata:

```json
{
  "surface": "blog",
  "slug": "example-post",
  "title": "Example Post",
  "summary": "...",
  "html": "...",
  "markdown": "...",
  "artifactCode": "PaperProof-blog_post-...",
  "seriesId": "0x...",
  "versionId": "0x...",
  "commentsTreeId": "0x...",
  "likesBookId": "0x...",
  "blobId": "...",
  "contentHash": "sha256:...",
  "verificationStatus": "verified",
  "renderStatus": "rendered",
  "renderedAt": "...",
  "manifestEntry": {}
}
```

Forum comments should remain a separate API concern. The topic body can be cached, while comments are read from normalized comment tables with pagination.

Returning `manifestEntry` or equivalent UI metadata is recommended so the app can keep exactly the same display fields and ordering decisions during the transition.

The list endpoints should be allowed to return manifest-derived list data even when an individual body is still rendering. Detail endpoints can then report `renderStatus=pending` and let the app use the existing browser fallback.

Add cache headers deliberately:

- list endpoints can use short `max-age` plus `stale-while-revalidate`;
- detail endpoints can use stronger caching when keyed by version/content hash;
- error or degraded responses should avoid long cache lifetimes.

## Proposed App Refactor

### 1. Introduce Official Content Client

Add a small service module in `paperproof-app`, for example:

```text
src/services/official-content.ts
```

Responsibilities:

- fetch rendered official content from server API;
- normalize response shape;
- expose fallback helpers;
- keep API base configurable through environment variables.

Suggested behavior:

```text
try server-rendered official content first
if unavailable or verificationStatus != verified, fall back to current browser-side path
```

The app should distinguish these cases:

- server unavailable: fallback silently or show the existing loading/degraded state;
- server says `renderStatus=error`: show server error only if browser fallback also fails;
- server says `verificationStatus != verified`: prefer browser fallback and surface a verification warning if both paths disagree;
- server returns a different `versionId` or `contentHash` than the current manifest expects: use the verified server response, but keep protocol footer visible so the newer version is traceable.

### 2. Keep Existing Browser Fallback

The existing browser path should remain available:

- static manifest;
- SDK read;
- Walrus download;
- hash verification;
- browser Markdown render.

This protects the app if the server-side renderer is down or stale.

### 3. Minimize UI Changes

The first refactor should avoid visual redesign. The goal is faster display, not a new content UI.

Recommended changes:

- Docs views consume server-rendered HTML when available.
- Blog article views consume server-rendered HTML when available.
- Forum topic body consumes server-rendered HTML when available.
- Forum comments continue using comment APIs or existing chain-backed logic until the indexer comments API is fully wired.

The existing footers should still show protocol identifiers.

Do not remove the current `markdownPreview`, `markdownFromPackageOrText`, or hash verification helpers in the first pass. They are needed for browser fallback and for comparing server-rendered output during rollout.

### 4. Add Configurable API Base

Use a setting such as:

```text
VITE_PAPERPROOF_INDEXER_API_BASE=/api
```

Production Caddy can reverse proxy `/api/*` to the indexer. Local development can point to `http://127.0.0.1:8787` or a Vite proxy.

If the indexer binds to `127.0.0.1:8787` on the server, Caddy can expose it under `/api/*` without opening the indexer port publicly.

The app should continue to work when `VITE_PAPERPROOF_INDEXER_API_BASE` is absent or the API is unreachable. In that case it should use the current static manifest plus browser Sui/Walrus path.

## Why Doing All Three Is Reasonable

Doing Docs, Blog, and Forum together is reasonable because they share the same core pipeline:

```text
manifest entry -> series -> current version -> Walrus blob -> hash verification -> render -> cache -> API
```

The differences are manageable:

- Docs: plain Markdown, locked/no comments, easiest.
- Blog: Markdown package zip and assets, still no active comments for official posts.
- Forum: Markdown topic body plus comment tree; body cache and comments API should be separated.

The user-visible result is the same pages, just with less waiting and fewer browser-side failure points.

However, implementation should still land in this order: Docs first, then Blog, then Forum. This allows the shared official-content model to mature on the simplest content type before adding Markdown package assets and live comments.

Forum should be last because it is the easiest place to accidentally mix two concerns: cached official topic text and live user comments. Keeping those paths separate is more important than making Forum fast first.

## Risks and Mitigations

### Risk: stale rendered content

Mitigation: key cache by `series_id`, `version_id`, `content_hash`, and `blob_id`; refresh when current version changes.

### Risk: server rendering hides protocol failures

Mitigation: return `verificationStatus`, `renderStatus`, `error`, and protocol IDs. The app can display degraded states.

### Risk: Forum comments become stale

Mitigation: cache topic body separately from comments. Query comments independently with pagination.

### Risk: service-side renderer becomes a hard dependency

Mitigation: keep browser-side manifest/Sui/Walrus fallback.

### Risk: Blog package assets are awkward to serve

Mitigation: extract assets into content-addressed server cache paths or data-backed asset endpoints, and rewrite Markdown image URLs during rendering.

### Risk: Postgres enrichment path is assumed but not implemented

Mitigation: add `PostgresContentRefStore` or a dedicated official-content Postgres worker before relying on production Postgres rendering. Until then, use direct Walrus fetch in the official renderer or keep the first deployment on SQLite.

### Risk: sanitized HTML behavior differs between server and browser

Mitigation: define one allowed Markdown/HTML policy and test rendered output against representative Docs, Blog packages, and Forum topics. If the Rust renderer cannot match browser `marked`/DOMPurify behavior closely, return Markdown plus verified metadata first and keep browser rendering until parity is acceptable.

### Risk: manifest and server cache drift apart

Mitigation: store the full manifest entry and a manifest entry hash. When the static manifest changes, re-ingest it and mark affected rendered rows stale even if the underlying PaperProof version did not change.

### Risk: official content API becomes mixed with private or user-specific state

Mitigation: keep `/v1/official/...` limited to public official Docs/Blog/Forum content. Wallet-specific pages such as My Space, publishing flows, Copilot memory, and governance actions should continue through their existing client-side and protocol-specific paths.

## Suggested Implementation Order

1. Add indexer schema for `official_content_entries` and `official_rendered_content`.
2. Add manifest ingestion for Docs, Blog, and Forum while preserving full manifest entries.
3. Add or confirm the content fetch path for the target backend. For Postgres, implement the missing content/ref store or fetch directly in the official renderer.
4. Implement Docs renderer first.
5. Add official Docs API and app-side server-first fallback.
6. Implement Blog Markdown package renderer and asset handling.
7. Add Blog API and app-side server-first fallback.
8. Implement Forum topic body renderer.
9. Add Forum topic API; keep comments separate and paginated.
10. Wire Caddy `/api/*` to the indexer service.
11. Add monitoring and metrics for render success, hash mismatch, stale cache, SDK fallback usage, and Walrus fetch failures.

## Success Criteria

The refactor is successful if:

- Docs, Blog, and Forum display the same content and layout as before.
- Pages load faster, especially on mobile and cold browser sessions.
- Browser no longer needs to download and unpack official Blog Markdown packages in the normal path.
- Server responses include protocol IDs and verification status.
- Browser fallback still works when the server renderer is unavailable.
- Forum comments remain accurate and paginatable.
- App route URLs and visible page layouts do not change.
- Server-rendered HTML is either sanitizer-compatible with the browser output or the app continues rendering verified Markdown locally until parity is reached.
