# Explore Indexer Cache Refactor Plan

This note records the current Explore implementation and a conservative refactor plan for moving public artifact discovery to the server-side indexer cache. The goal is to make Explore faster, searchable over a larger corpus, and less dependent on browser-side Sui event scans, without changing the visible user experience or the protocol security model.

The refactor must be invisible at the UI/content level. It should improve data freshness, loading latency, result depth, and search coverage, but it should not redesign Explore, remove fields, rename controls, change routes, or alter what each card, list row, and detail page is supposed to display.


## Implemented Status

The current deployed implementation follows this plan with a conservative app/indexer split:

- `paperproof-indexer-reference` exposes Explore-specific server-assisted endpoints: `/v1/explore/summary`, `/v1/explore/items`, `/v1/explore/search`, and `/v1/artifacts/lookup`.
- Compatibility endpoints remain intact: `/v1/explore/artifacts` and `/v1/search/artifacts` continue to return the original normalized artifact arrays for existing clients.
- `paperproof-app` uses the Explore endpoints first and keeps browser-side Sui event scanning as fallback.
- Featured official artifacts are pinned to the top of their own type lists without changing UI labels, routes, cards, table columns, or page layout. The app uses lookup-based backfill so these flagship artifacts are not buried by later publications.
- The indexer hydrates latest version objects from Sui when normalized event rows do not contain display fields such as `abstract_text`, `summary`, `description`, or `changelog`. This prevents official flagship artifacts from showing empty Abstract or Description sections.
- Detail-page live behavior remains conservative: comments, likes, Blog body preview, PDF preview, and wallet-specific state still use the existing app-side helpers unless a server-backed path is explicitly available.

Current featured artifact policy:

- Preprints: the three official PaperProof paper artifacts.
- Blog Posts: the latest four official PaperProof blog post artifacts.
- Technical Reports: the official PaperProof slides artifact.
- Datasets: the Sui Overflow historical winners dataset artifact.
- Software Releases: the `paperproof-skill` software release artifact.

## Goal

Explore has six public artifact categories. Each category card shows recent artifacts, `View all` opens a type-specific list, and each artifact can be opened for detail, versions, comments, likes, and download metadata.

These views are public and identical for every user. They are therefore good candidates for server-side indexing and caching:

- cache enough artifacts per artifact type for the Explore landing cards to preserve the current UI behavior. The current app uses `siteConfig.maxRecentPerType = 5`; `4` is only a minimum product floor, not a reason to reduce the visible count from 5;
- cache up to 2,000 artifacts per artifact type for type list pages, keeping the newest records when the protocol has more;
- serve artifact detail, versions, and comments from the indexer where possible;
- move search from a browser-local loaded window to indexer-backed search across the cached/indexed corpus;
- let users see newly indexed artifacts without repeatedly clicking Refresh or manually walking browser event windows;
- reduce the wait before Explore cards and type lists become useful;
- keep browser-side Sui/Walrus fallback for correctness and resilience.

This should not become a centralized content source. The indexer cache is only a fast view of canonical PaperProof protocol facts from Sui and Walrus.

## Current App Behavior

The current Explore page is mostly browser-side.

Relevant code in `src/main.ts`:

- `refreshChainData`: loads recent artifact, comment, proposal, vote, and vote-claim events from Sui in the browser.
- `loadArtifactPublishedEventsWindow(30)`: fetches a small recent artifact event window across publishing packages.
- `artifactRecordFromEvent`: builds a lightweight local `ArtifactRecord` from publish events.
- `hydrateVisibleObjects`: hydrates a small subset of visible artifacts by reading object details from Sui.
- `loadMoreArtifactEvents`: loads 30 older artifact events using package cursors.
- `artifactByKey`: searches only the already loaded browser artifact array by artifact code or series ID.
- `ensureArtifactDeepLinkLoaded`: if a deep link is not in memory, scans up to 5,000 events in the browser using `findArtifactPublishedEventByCode`.
- `exploreView`, `typeCard`, `typeDetailView`: render from `state.chain.artifacts`.

Relevant code in `src/services/sdk.ts`:

- `loadArtifactPublishedEventsWindow`: queries Sui events directly from the browser.
- `findArtifactPublishedEventByCode`: scans event pages in the browser to find an artifact code.

This implementation works well for a pure static dApp, but it has clear limits:

- first paint depends on browser network calls to Sui RPC;
- Explore cards can show empty until enough events have been loaded;
- `View all` is limited to the current browser event window plus manually loaded older events;
- search is local to already loaded records, except for a slow deep-link event scan;
- multiple users repeat the same Sui event scans and object reads;
- sorting by discussed/liked/updated can be incomplete because comments, likes, and object details may be partially hydrated.

## Current Indexer Capabilities

`paperproof-indexer-reference` already has a normalized database and API endpoints that cover much of the needed surface.

Relevant routes in `src/api.rs`:

- `GET /v1/explore/artifacts?artifact_type=&limit=&offset=`
- `GET /v1/search/artifacts?q=&artifact_type=&owner=&limit=&offset=`
- `GET /v1/artifacts/{series_id}`
- `GET /v1/artifacts/{series_id}/versions`
- `GET /v1/artifacts/{series_id}/comments`

Relevant query methods in `src/normalized.rs`:

- `recent_artifacts(artifact_type, limit, offset)`
- `search_artifacts(term, artifact_type, owner, limit, offset)`
- `artifact_detail(series_id)`
- `versions(series_id)`
- `comments(series_id, limit, offset)`

The current indexer orders recent artifacts by `coalesce(updated_at, published_at) desc`, filters by numeric artifact type, and searches across artifact code, title, owner, series ID, and raw JSON.

This is already enough for an initial server-first Explore path. The main missing pieces are not basic indexing; they are API shape, cache policy, and app-side conversion.

## Important Data Shape Gap

The app's current `ArtifactRecord` is a UI-oriented model. It uses fields such as:

- `type`: slug such as `preprints` or `software-releases`;
- `version`: display text such as `v1`;
- `authors`, `license`, `field`, `keywords`, `summary`;
- `comments`, `likes` numeric display counts;
- `versions` as UI download/version records;
- `commentTree` for nested comment display.

The indexer `ArtifactRecord` is a normalized protocol record. It uses fields such as:

- `artifact_type`: numeric protocol type;
- `latest_version_id`;
- `comments_tree_id`;
- `likes_book_id`;
- `raw_json`;
- timestamps and title where normalized.

Therefore the app should not directly replace `state.chain.artifacts` with raw indexer records. It should introduce either:

- a front-end adapter that maps indexer records into the existing UI `ArtifactRecord`, or
- a new indexer response DTO designed for Explore UI display.

The second option is cleaner for long-term product quality because it avoids duplicating protocol parsing logic in every frontend.

The DTO must preserve the display semantics already implemented in `src/main.ts`. In particular:

- type slugs must match `artifactTypes` and `artifactTypeByNumber`; numeric protocol type `1..6` should map to `preprints`, `blog-posts`, `technical-reports`, `datasets`, `software-releases`, and `generic-files` exactly;
- title, summary, authors, keywords, field, license, version title, download name, and content type should use the same extraction rules as `titleFromVersion`, `summaryFromVersion`, `authorsFromVersion`, `keywordsFromVersion`, `fieldFromVersion`, `licenseFromVersion`, and `versionRecordFromView`;
- status should match `seriesStatusLabel`, where status `0` or missing means `Active` and other values currently display as `Paused`;
- dates should preserve current fallback behavior such as `On-chain` when a timestamp is missing or invalid;
- missing Walrus blob IDs should still render as `Not stored` or `Not loaded` as the current UI expects.

If these rules are not fully implemented server-side at first, the app adapter should fill gaps using the existing browser-side helpers rather than removing displayed fields.

## Proposed Indexer Additions

### 1. Explore Summary Endpoint

Add an endpoint that returns all six category card lists in one request:

```text
GET /v1/explore/summary?per_type=4
```

Suggested response:

```json
{
  "refreshedAt": "2026-06-19T00:00:00Z",
  "perType": 4,
  "types": [
    {
      "artifactType": 1,
      "slug": "preprints",
      "totalIndexed": 12,
      "items": []
    }
  ]
}
```

The server should populate each type with the current card count used by the app, which is 5 at the time of writing. The product requirement of at least 4 is a lower bound for protocol sparsity, not the target count when 5 or more records exist. This prevents the current situation where the browser has loaded a recent global window but not enough records for every category.

### 2. Type List Endpoint

Keep or extend the existing endpoint:

```text
GET /v1/explore/artifacts?artifact_type=1&limit=50&offset=0&sort=newest
```

Add support for `sort` values matching current UI controls:

- `newest`: order by published time desc;
- `updated`: order by updated time desc;
- `discussed`: order by indexed comment count desc, then updated time desc;
- `liked`: order by indexed like count desc, then updated time desc.

Be careful with `discussed` and `liked` in the first implementation. The current normalized schema stores `domain_comments`, so comment counts can be computed with a join or materialized counter, but the existing artifact list query does not yet return a comment count. Likes are more limited: the indexer currently records like events for airdrop scoring, but `domain_artifacts` does not yet store per-artifact `likeCount`, and the app currently reads `LikesBook` objects on demand when hydrating artifact details. Do not claim accurate server-side `liked` sorting until the indexer records or derives per-artifact like counts.

Recommended safe rollout:

- implement `newest` and `updated` first from existing artifact timestamps;
- implement `discussed` after adding a comment count aggregation or materialized counter;
- keep `liked` as existing browser/hydration behavior or mark it as best-effort until per-artifact like counts are indexed;
- keep the visible sort controls unchanged, even if some modes use fallback ordering during the transition.

The API should enforce a maximum limit. For the product goal here, the server-side cache should keep at most 2,000 artifacts per type in memory, but the database can retain all normalized records. If a type has more than 2,000 records, the list API should expose the newest 2,000 by default unless a later full historical search mode is added.

### 3. Explore Search Endpoint

Extend the current search endpoint so the app search form can use it first:

```text
GET /v1/search/artifacts?q=PaperProof-...&artifact_type=&owner=&limit=25&offset=0
```

Search should cover at least:

- exact artifact code;
- partial artifact code;
- series ID;
- owner address;
- title;
- raw JSON metadata.

For SQLite, the current `LIKE` search is acceptable for the hackathon-scale corpus. For larger production usage, add FTS5 for SQLite or `tsvector`/GIN indexes for Postgres. This is a performance upgrade, not a correctness requirement for the first refactor.

### 4. Artifact Detail Endpoint

The existing detail endpoint is a good base:

```text
GET /v1/artifacts/{series_id}
```

The app currently deep-links by artifact code, not only by series ID. Add one of these:

```text
GET /v1/artifacts/by-code/{artifact_code}
GET /v1/artifacts/lookup?q={artifact_code_or_series_id}
```

This avoids browser event scanning in `ensureArtifactDeepLinkLoaded`.

### 5. UI-Oriented DTO

Add a stable response item for Explore display. Suggested fields:

```json
{
  "seriesId": "0x...",
  "artifactCode": "PaperProof-preprint-...",
  "artifactType": 1,
  "typeSlug": "preprints",
  "title": "...",
  "summary": "...",
  "owner": "0x...",
  "authors": ["..."],
  "status": "Active",
  "publishedAt": "...",
  "updatedAt": "...",
  "latestVersionId": "0x...",
  "latestVersionNumber": 1,
  "commentsTreeId": "0x...",
  "likesBookId": "0x...",
  "commentCount": 0,
  "likeCount": 0,
  "contentHash": "sha256:...",
  "walrusBlobId": "...",
  "contentType": "application/pdf"
}
```

This DTO should be derived from normalized Sui events and objects. It should not require Walrus content downloads for list pages. Detail pages can still offer download links through the Walrus blob ID.

Do not make `commentCount` and `likeCount` mandatory until the indexer can derive them reliably. A missing `commentCount` can fall back to `0` or to browser-loaded comments as today. A missing `likeCount` should not block list rendering; detail pages can continue to refresh likes from the `LikesBook` object.

## Cache Strategy

The indexer should keep two related caches:

### Summary Cache

Keyed by artifact type:

```text
explore:summary:{artifact_type}
```

Stores the newest 4 or more per type for the Explore landing cards. The current product requirement is at least 4 per type unless fewer exist on-chain.

### Type List Cache

Keyed by artifact type and sort mode:

```text
explore:list:{artifact_type}:{sort}
```

Stores up to 2,000 items per type. This can be an in-memory cache backed by normalized database queries. The normalized database remains the durable source for the indexer.

### Invalidation and Refresh

The indexer serve process already has the right architecture after the official content work:

- startup warmup;
- event tail loop;
- refresh after newly indexed PaperProof events;
- low-frequency reconciliation fallback.

Explore caches should hook into the same mechanism:

- `ArtifactPublishedEvent`: refresh affected type summary/list and global search material;
- version-added events: refresh the affected artifact and type lists because `updated` and latest version changed;
- comment events: refresh `discussed` sorting and detail comment counts;
- like/unlike events if indexed: refresh `liked` sorting and like counts;
- fallback reconciliation: periodically rebuild summary/list caches from normalized tables.

The exact event names and reducers must be verified against the indexer event-kind mapping before implementation. `ArtifactPublishedEvent` and comment events are already part of the current app/indexer flow. Version-added and like/unlike handling should be wired only if the normalized reducer has enough data to update the affected series. If an event cannot be mapped to a series reliably, refresh the relevant cache from the normalized database rather than guessing.

If indexing misses a live event temporarily, request-time fallback can query the normalized database directly. If the server API is unavailable, the browser should keep the current Sui event fallback path.

## Proposed App Refactor

### 1. Add Explore API Client

Create a small service module, for example:

```text
src/services/explore-content.ts
```

Responsibilities:

- call `/api/v1/explore/summary` for the Explore cards;
- call `/api/v1/explore/artifacts` for type list pages;
- call `/api/v1/search/artifacts` for artifact search;
- call lookup/detail endpoints for artifact detail deep links;
- map indexer DTOs into the current UI model, or consume the new UI DTO directly.

Follow the same pattern as `src/services/official-content.ts`: server-first, browser fallback.

The API client should be additive. It should not remove or bypass existing functions such as `ensureArtifactObjectLoaded`, `ensureArtifactCommentsLoaded`, `ensureArtifactLikeStateLoaded`, `ensureBlogBodyPreviewLoaded`, and `ensurePdfArtifactPreviewLoaded` in the first implementation. Those functions protect detail-page completeness and currently handle object hydration, comment tree loading, like state, Blog body preview, and PDF preview.

### 2. Preserve Current Routes and Layout

Do not change the routes:

- `#/explore`
- `#/type/{slug}`
- `#/artifact/{artifact_code}`

Do not change the visible cards, table columns, pagination controls, or artifact detail layout in the first refactor.

### 3. Replace Browser Event Window for Normal Path

Normal path after refactor:

```text
Explore landing -> /api/v1/explore/summary -> render cards
View all -> /api/v1/explore/artifacts?artifact_type=&sort=&limit=&offset= -> render table
Search -> /api/v1/search/artifacts?q= -> navigate to exact match or show results
Artifact detail -> /api/v1/artifacts/lookup?q= -> detail payload
```

Fallback path remains:

```text
server unavailable -> current browser Sui event scan and object hydration
```

The first implementation should replace the normal data source for Explore landing cards, type lists, search, and artifact lookup. It should not attempt to replace every detail-page live behavior in the same step. Detail pages can receive their initial artifact and version metadata from the indexer, then continue using existing browser helpers for comments, likes, previews, and wallet-specific state until each of those paths has its own tested server-backed equivalent.

### 4. Revisit Load More

The current `Load more` button loads 30 older Sui events from the browser. With indexer-backed pagination, the same button can load the next API page instead. The button text and placement can stay unchanged.

Do not remove the button in the first refactor. Keep the visible interaction stable.

### 5. Improve Search Without Changing the Search Box

The top search form currently only searches `state.chain.artifacts` and shows a warning if the artifact is not already loaded.

After refactor:

1. Try exact local match for instant response.
2. Query `/api/v1/search/artifacts?q=...&limit=10`.
3. If exactly one exact artifact-code match exists, navigate to it.
4. If multiple partial matches exist, show a lightweight result state or navigate to a search result page in a later iteration.
5. If the API fails, fall back to `findArtifactPublishedEventByCode`.

This expands search scope without changing the visible search form.

## What Not To Change

- Do not change visible Explore content, layout, route structure, labels, table columns, artifact cards, action names, pagination placement, or protocol metadata footers as part of this optimization.
- Do not remove fields that are currently displayed. If a server response cannot provide a field yet, preserve the existing fallback or display behavior until the server DTO can support it.
- Do not route wallet signing, publishing, governance actions, likes, or comments through this cache as trusted user actions.
- Do not treat the indexer as the protocol authority.
- Do not remove browser fallback until the API path has been battle-tested.
- Do not download Walrus blobs for every list item; list pages should use indexed metadata and IDs.
- Do not change artifact codes, routes, or user-facing type names.
- Do not require full HTML SSR for Explore; an API-backed SPA view is enough.
- Do not cache private user-specific data under public Explore endpoints.

## User Experience Constraints

This refactor is a data-path and caching optimization. Users should experience it as:

- the same Explore page, but it fills with useful records faster;
- the same six artifact categories, but each category is less likely to appear empty just because the browser has not scanned enough events;
- the same `View all` pages, but with a deeper indexed list and less manual loading;
- the same search box, but able to find artifacts beyond the current browser-loaded window;
- the same artifact detail pages, but opened through faster lookup when the artifact is known to the indexer;
- fewer cases where users must click Refresh to see new artifacts after the server has already indexed them.

The first implementation should avoid UI redesign. Any new visual search results page, new filters, new sorting controls, infinite scroll, or table redesign should be treated as separate product work. The current optimization should use existing controls and existing page shapes.

## Freshness Model

Explore should be fresher than the current browser event-window model without pretending to be instantaneous consensus streaming.

Recommended freshness behavior:

- on server start, warm the Explore summary and per-type list caches from the normalized index;
- while serving, run the indexer tail loop and refresh affected Explore caches after newly indexed PaperProof events;
- keep a low-frequency reconciliation loop to rebuild Explore caches in case a tail pass missed events, the process restarted, or normalized derived data changed;
- on API cache miss, query the normalized database directly before falling back to browser-side Sui scans;
- expose a `refreshedAt` or equivalent timestamp so the app can keep the existing "Last refreshed" style of feedback without forcing manual refresh.

The current `chainStatusBanner` says "Showing canonical on-chain event data. Last refreshed ...". If the source changes to indexer-backed data, keep the meaning truthful without changing the basic UI shape. For example, the timestamp can refer to the indexer cache refresh time, and warnings should still surface when the API falls back to browser-side loading.

This means users should normally see newly indexed artifacts automatically through the API-backed data path. The existing Refresh button can remain useful as an explicit reload action, but it should no longer be required just to escape a tiny browser-loaded event window.

## Implementation Order

1. Add type slug mapping and Explore DTOs to `paperproof-indexer-reference`.
2. Add `/v1/explore/summary` with the current card count of 5 items per type when available.
3. Extend `/v1/explore/artifacts` with `sort` and enforce safe `limit` caps; implement `newest` and `updated` first, then add `discussed`/`liked` only after the required counters are available.
4. Add lookup by artifact code or series ID.
5. Add indexer-side in-memory caches for summary and per-type list pages, warmed on startup and refreshed after indexed events.
6. Add `src/services/explore-content.ts` to `paperproof-app`.
7. Switch Explore landing cards to server-first summary loading while preserving current card markup and fallback.
8. Switch type list pages and `Load more` to server-first pagination while preserving current table columns and button behavior.
9. Switch search and artifact deep links to indexer lookup first.
10. Keep existing detail-page object, comments, likes, Blog body preview, PDF preview, and browser event/object logic as fallback; remove only after a later explicit cleanup decision.

## Regression Checklist

Before deployment, verify these paths against the current app behavior:

- Explore landing still shows the same six type cards and up to 5 recent rows per card.
- `View all` still shows Artifact Code, Title, Authors, Published, Version, Comments, and Likes columns.
- Sort links remain visible and do not produce misleading ordering when a server-side counter is unavailable.
- `Load more` still appends or paginates older artifacts without changing the visible control.
- Top search can still navigate by exact artifact code, and server search failure falls back to existing deep-link scanning.
- Artifact detail still shows abstract/description, current version, version history, likes, comments, side facts, raw view, download buttons, Blog body preview, and PDF preview where applicable.
- Wallet-specific like status still depends on the connected wallet and must not be cached as public Explore data.
- Comments and likes update after user actions as they do today.
- API failure or stale cache produces warnings/fallback behavior, not an empty Explore page.

## Success Criteria

- Explore cards show up quickly and consistently across all six types.
- Each type page can display up to 2,000 newest indexed artifacts without browser-side event scans.
- Search can find artifacts outside the current browser-loaded window.
- Artifact detail pages still show protocol IDs, versions, comments, likes, and Walrus download information.
- If the indexer API is down, the app degrades to the existing browser-side behavior.
- No wallet, publishing, governance, or private memory security model changes are introduced.
