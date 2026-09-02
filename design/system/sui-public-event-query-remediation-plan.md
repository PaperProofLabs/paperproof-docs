Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# Sui Public Event Query Deprecation Remediation Plan

This document records the current cross-repo remediation plan for PaperProof
after public Sui historical event-query paths became unreliable or unavailable
on mainnet providers.

It is not a generic "replace JSON-RPC" note.

The specific problem is narrower and more important:

- object reads, balance reads, coin selection, and transaction submission over
  Sui JSON-RPC are still valid product building blocks;
- the brittle surface is public historical event querying, especially
  `suix_queryEvents`-style dependency in browser-facing or operationally
  critical paths;
- some GraphQL event-query assumptions are also too optimistic and need to be
  tightened to match what current providers actually support.

The goal of this remediation is to make PaperProof public reading surfaces,
SDK defaults, and operational tooling resilient without changing protocol
truth, user-visible semantics, or current desktop/mobile UI design.

## 0. Current status snapshot

As of 2026-09-01, the system is in a mixed state rather than a fully broken
state.

Already improved:

- the production app governance path has already been partially hardened so it
  can fall back to indexer-backed proposal and vote reads;
- the indexer already exposes most of the API surface needed for public read
  paths;
- official Blog / Docs / Forum bodies already have an official content API
  path and are not purely dependent on browser-side event scans.

Still needing coordinated cleanup:

- the app still carries browser-side event-history dependency in Explore,
  global refresh, comment/governance freshness, and artifact-code deep-link
  recovery;
- all three SDK lines still ship stale mainnet GraphQL defaults and overly
  optimistic event-query fallback posture;
- the official upgrade skill still contains at least one direct
  `suix_queryEvents` historical scan;
- degraded-state rendering across app public pages is not fully normalized, so
  a data-path failure can still surface as long loading, placeholder sticking,
  or `undefined`-style labels.

This means the remediation should be executed as a coordinated hardening pass,
not as an emergency rewrite.

## 1. Trigger and user-visible symptoms

This work was triggered by a class of symptoms that started appearing after
provider-side changes:

- Governance could fail with `On-chain data could not be loaded` because the
  page still depended on public canonical proposal-event loading.
- Some public routes could spend too long in placeholder or loading states,
  such as static public preview, `Loading on-chain artifacts`, or official
  content loading placeholders.
- Some public pages could show partial or degraded counts when event-history
  hydration did not complete in time.
- Deep-link recovery by artifact code could become slow or fragile when the
  browser attempted direct event-window scanning.

At the same time, many other public pages continued to work, which is an
important architectural clue:

- official Blog, Docs, and Forum bodies already rely heavily on official
  manifests, indexer-backed content APIs, and browser/session cache;
- many artifact lists and detail pages could still render because they already
  use indexer-assisted or object-read paths rather than pure browser-side
  event backfill.

So the right conclusion is not "the whole site depends on deprecated
interfaces."

The correct conclusion is:

- PaperProof already has the right long-term architecture pieces;
- several residual app, SDK, and ops paths still expose public event-query
  assumptions;
- those residual paths should now be treated as technical debt and removed
  from critical flows.

## 2. Scope of the actual problem

### 2.1 What is risky

The risky surfaces are:

- browser-side historical event backfill for artifact discovery, comments
  discovery, governance history, and deep-link resolution;
- SDK default query providers that still assume a public GraphQL endpoint or
  JSON-RPC fallback will always provide historical event scans reliably;
- operational scripts that enumerate large historical protocol state by raw
  public event query instead of using the indexer or checkpoint-based sources.

### 2.2 What is not the main problem

The remediation must not overreact and break working paths.

The following are still valid and should remain available:

- JSON-RPC object reads;
- JSON-RPC transaction building and submission;
- wallet-connected signing flows;
- direct verified object fetch for current artifact/version details;
- Walrus download and hash verification;
- indexer ingest based on checkpoints / gRPC / replayable pipeline.

### 2.3 Architectural interpretation rule

Going forward, PaperProof should follow this read-path rule:

- protocol truth lives on Sui and Walrus;
- exhaustive history and public discovery live in checkpoint/indexer-backed
  server infrastructure;
- browser UI may read individual verified objects directly;
- browser UI should not be the primary historical event indexer.

## 3. Current PaperProof data-path inventory

This section classifies the live architecture by repository.

## 3.1 `paperproof-app`

The app is already hybrid rather than purely browser-side.

Healthy long-term directions already present:

- official Blog / Docs / Forum manifests and bodies use official content APIs;
- Explore already has indexer-backed infrastructure available;
- artifact detail can hydrate from object reads and indexer-assisted lookup;
- governance now has an indexer fallback for proposal list and my votes.

Residual risky paths still present in
`paperproof-app/src/services/sdk.ts`:

- `loadRecentCanonicalEvents`
- `loadArtifactPublishedEvents`
- `loadArtifactPublishedEventsWindow`
- `findArtifactPublishedEventByCode`
- `loadCommentAddedEvents`
- `loadProposalCreatedEvents`
- `loadVoteCastEvents`
- `loadVoteClaimedEvents`

Important current callers in `paperproof-app/src/main.ts`:

- `refreshChainData()`
- `refreshGovernanceData()`
- `ensureArtifactDeepLinkLoaded()`

Interpretation:

- governance has already been partially hardened and is no longer the most
  fragile surface;
- Explore, artifact deep-link recovery, recent global activity hydration,
  comment backfill, and some forum-derived counts still carry event-scan debt;
- app fallback logic is currently too dependent on event-history availability
  to provide fast and deterministic public reads.

## 3.2 `paperproof-sdk-ts`

Relevant files:

- `paperproof-sdk-ts/src/sdk.ts`
- `paperproof-sdk-ts/src/clients/query-providers.ts`
- `paperproof-sdk-ts/src/clients/query-client.ts`

Current issues:

- `defaultGraphQLEndpoint(network)` still points mainnet to
  `https://rpc.ankr.com/http/sui_graphql`;
- fallback semantics are still effectively "GraphQL first, JSON-RPC second"
  for historical event queries;
- GraphQL event-filter assumptions are too loose, especially package-oriented
  filtering that is not a portable or guaranteed provider capability.

Interpretation:

- the TypeScript SDK still exposes stale defaults for public mainnet querying;
- its event-query API surface needs a clearer capability contract;
- the SDK should not silently encourage browser clients to use it as a general
  mainnet historical indexer.

## 3.3 `paperproof-sdk-py`

Relevant files:

- `paperproof-sdk-py/paperproof/client.py`
- `paperproof-sdk-py/paperproof/query_providers.py`
- `paperproof-sdk-py/paperproof/sui.py`

Current issues:

- `DEFAULT_GRAPHQL_ENDPOINTS["mainnet"]` still points to the old Ankr
  endpoint;
- fallback query-provider posture still assumes historical event querying is a
  normal public-client path;
- raw JSON-RPC event query remains available through
  `_rpc("suix_queryEvents", ...)`.

Interpretation:

- Python SDK object/tx operations remain useful;
- Python event-history helpers should be re-positioned as compatibility-only,
  bounded, or deprecated for public mainnet discovery use.

## 3.4 `paperproof-sdk-rs`

Relevant files:

- `paperproof-sdk-rs/src/query.rs`
- `paperproof-sdk-rs/src/client.rs`
- `paperproof-sdk-rs/src/sui_native.rs`

Current issues:

- `MAINNET_GRAPHQL_ENDPOINT` still points to the old Ankr endpoint;
- `query_events_jsonrpc()` still calls `suix_queryEvents`;
- compatibility helpers such as `mainnet_jsonrpc` remain exposed, although the
  Rust SDK already documents that checkpoint/indexer patterns are preferred.

Interpretation:

- Rust SDK conceptually already understands the right architecture;
- shipped defaults, public naming, docs, and tests still need to be aligned to
  the current mainnet reality.

## 3.5 `paperproof-indexer-reference`

Relevant files:

- `paperproof-indexer-reference/src/api.rs`
- `paperproof-indexer-reference/src/main.rs`
- `paperproof-indexer-reference/docs/api.md`

Important existing app-facing APIs:

- `GET /v1/explore/items`
- `GET /v1/artifacts/lookup`
- `GET /v1/governance/proposals`
- `GET /v1/my/{address}/votes`
- official content routes under `/v1/official/...`

Interpretation:

- the indexer is already the correct long-term read surface for public lists,
  public discovery, official manifests, and official content bodies;
- the indexer does not depend on public `suix_queryEvents` in the same way the
  browser-side app or compatibility SDK paths do;
- the main work here is to promote these APIs from "available helper" to
  "canonical app-facing read contract."

## 3.6 `paperproof-community-skill`

Relevant files:

- `paperproof-community-skill/scripts/lib/publish-runtime.mjs`
- `paperproof-community-skill/scripts/lib/governance-runtime.mjs`
- `paperproof-community-skill/scripts/query-events.mjs`
- `paperproof-community-skill/scripts/query-governance.mjs`

Interpretation:

- object reads and transaction submission through JSON-RPC remain fine;
- the risky area is scripts or helper flows that normalize "query events from
  public mainnet provider" as a regular user workflow;
- community skill should distinguish safe operational reads from fragile
  historical event scans.

## 3.7 `paperproof-official-skill`

Relevant file:

- `paperproof-official-skill/skills/upgrade-paperproof-contracts/scripts/promote-legacy-series-controller-mainnet.mjs`

Concrete risk already confirmed:

- the script still uses `rpc('suix_queryEvents', ...)` to enumerate published
  series for migration/promotion.

Interpretation:

- this is an operational risk, not just a UX risk;
- official upgrade, migration, and mainnet maintenance flows must not depend
  on a deprecated public historical query interface.

## 3.8 `paperproof-docs`

Most publish scripts are less risky because they rely on:

- object reads;
- transaction submission;
- Walrus upload;
- official manifest updates.

But documentation still needs to be tightened so it does not imply that public
historical event scanning is the normal steady-state PaperProof read model.

## 4. Root-cause analysis for the recent regressions

The recent failures came from a combination of factors rather than one bug.

### 4.1 Provider-side deprecation / instability

Public Sui providers no longer behave like a reliable, universal historical
event database for browser apps. Even when a method still exists somewhere, it
is no longer safe to treat it as a durable production contract for public UX.

### 4.2 App fallback order still favors event scanning too often

Several app flows still try browser-side event windows before using the
already-available indexer APIs as the primary data source.

That causes:

- slower public page loads;
- more placeholder time;
- higher sensitivity to provider changes;
- inconsistent deep-link recovery behavior.

### 4.3 SDK defaults still encode an outdated provider assumption

All three SDK lines still carry stale public GraphQL defaults and compatibility
query surfaces that are too easy to use as if they were guaranteed production
history APIs.

### 4.4 Ops scripts still contain rollout-era direct scans

Official upgrade and migration tooling still contains at least one critical
historical scan path that should have been converted to indexer-backed or
checkpoint-backed enumeration after the protocol matured.

### 4.5 Degraded-state presentation is not yet fully normalized

Some user-visible `undefined` or empty-state symptoms are not caused by one
bad chain call alone. They also reveal that some public page models still
allow partially populated records to flow into UI rendering before a canonical
server-backed shape is guaranteed.

## 4.6 Symptom-to-root-cause map

To guide actual code changes, the recent symptoms should be mapped more
precisely.

`Governance page shows "On-chain data could not be loaded"`:

- primary cause: proposal / vote history still touched deprecated public
  historical event-query assumptions;
- primary fix area: `paperproof-app`;
- supporting fix area: `paperproof-indexer-reference`;
- status: partially remediated, still needs normalization and verification.

`/explore stays in "Loading on-chain artifacts" for too long`:

- primary cause: browser refresh still waits on event-window hydration before
  public lists become fully useful;
- primary fix area: `paperproof-app`;
- supporting fix area: `paperproof-indexer-reference`;
- status: not fully remediated.

`Artifact deep link is slow or fragile`:

- primary cause: route recovery still falls back to
  `findArtifactPublishedEventByCode()` browser scanning;
- primary fix area: `paperproof-app`;
- supporting fix area: `paperproof-indexer-reference`;
- status: not remediated.

`Forum rows show undefined likes / dislikes / comments`:

- primary cause: UI receives partially populated topic models before canonical
  counts are normalized;
- root cause is not necessarily the deprecated RPC alone, but the old refresh
  path makes this easier to trigger;
- primary fix area: `paperproof-app`;
- supporting fix area: `paperproof-indexer-reference`;
- status: needs app-side degraded-state normalization even after data-path
  hardening.

`Official Blog / Docs / Forum route shows placeholder too long`:

- primary cause: official body resolution is already indexer-backed, but route
  readiness still depends on manifest / mapping / content loading order and
  degraded-state handling;
- primary fix area: `paperproof-app`;
- supporting fix area: `paperproof-indexer-reference`;
- status: partially healthy, but fallback and readiness sequencing should be
  tightened.

`Upgrade or migration scripts fail during historical enumeration`:

- primary cause: official ops script still uses direct public
  `suix_queryEvents` scans;
- primary fix area: `paperproof-official-skill`;
- supporting fix area: `paperproof-indexer-reference`;
- status: not remediated in design terms until the old enumeration path is
  removed.

## 5. Target architecture

The remediation target is a stricter split of responsibilities.

## 5.1 Canonical read-path policy

Public PaperProof read paths should be categorized as follows:

- object truth: Sui object reads, Walrus downloads, hash verification;
- bounded current-state queries: SDK object helpers, wallet-specific reads,
  current detail hydration;
- historical discovery and list pages: indexer APIs;
- exhaustive historical backfill and protocol-wide repair jobs:
  checkpoint/indexer tooling only.

## 5.2 Browser policy

The browser app may:

- fetch a specific series by indexer lookup;
- hydrate a specific current version by object ID;
- read a specific comments tree or likes book object;
- load official docs/blog/forum content through official content APIs.

The browser app should not:

- scan thousands of mainnet historical events to recover a route;
- build canonical public lists by directly walking public event cursors;
- treat provider event history as the first-choice source for governance,
  Explore, or forum public surfaces.

## 5.3 SDK policy

SDKs should preserve low-level compatibility helpers when useful, but they
must clearly separate:

- stable object / tx capabilities;
- bounded event utilities;
- deprecated public historical-query compatibility paths.

## 5.4 Indexer policy

Indexer APIs should become the canonical public read contract for:

- Explore summary and type pages;
- artifact-code lookup;
- governance proposal listing;
- voter history listing;
- official Docs / Blog / Forum manifest and body resolution;
- any future public activity feed that requires historical ranking or joining.

## 6. Risk classification

## 6.1 P0: broken now or likely to break again soon

- governance proposal-event dependency in browser critical path
  (already partially remediated in app);
- app deep-link recovery via browser historical event scan;
- official migration/upgrade script use of `suix_queryEvents`;
- stale public mainnet GraphQL defaults in all SDK lines.

## 6.2 P1: latent high-risk technical debt

- browser-side recent artifact/comment/governance windows still powering public
  list freshness;
- forum and artifact counts that still depend on partial event hydration before
  canonical server-side shapes arrive;
- community skill workflows that present event-query scripts as routine public
  usage;
- GraphQL filter semantics in SDKs that overpromise provider capability.

## 6.3 P2: cleanup, documentation, and compatibility tightening

- documentation wording that still treats browser event scanning as normal;
- naming and docs for SDK fallback providers;
- tests that do not clearly distinguish compatibility fallback from canonical
  production paths;
- deploy verification that checks outcome but not architecture-policy
  compliance.

## 7. Repository-by-repository modification plan

## 7.1 `paperproof-app`

### 7.1.1 Required changes

- Make indexer-backed artifact lookup the canonical path for artifact-code and
  series deep-link resolution.
- Remove critical dependence on `findArtifactPublishedEventByCode()` from
  route recovery.
- Move Explore landing, type lists, and recent public artifact views to
  indexer-first data loading everywhere.
- Keep direct object hydration only as a detail enrichment layer, not as the
  primary discovery source.
- Move governance public list and voter-history loading to indexer-first
  behavior consistently.
- Move comment-count / likes-count / forum-topic public counters toward
  canonical server-backed shapes where available.

### 7.1.2 Functions to retire from critical public paths

The following functions should no longer be required for normal public route
loading:

- `loadRecentCanonicalEvents`
- `loadArtifactPublishedEvents`
- `loadArtifactPublishedEventsWindow`
- `findArtifactPublishedEventByCode`
- `loadCommentAddedEvents`
- `loadProposalCreatedEvents`
- `loadVoteCastEvents`
- `loadVoteClaimedEvents`

They may temporarily remain for diagnostics, local development, or bounded
fallback, but not as the normal path for production public pages.

### 7.1.3 Public behavior that must not change

- current desktop UI layout;
- current mobile UI layout;
- route structure;
- artifact detail semantics;
- official Docs / Blog / Forum structure;
- wallet-connected flows;
- publish / add-version / governance write behavior.

This is a data-path hardening project, not a UI redesign.

### 7.1.4 File-level change checklist

`paperproof-app/src/main.ts`:

- make `loadExploreSummary()` and `loadExploreArtifacts()` the canonical source
  for Explore and type pages;
- reduce or remove `refreshChainData()` dependence on public event windows for
  public list readiness;
- rewrite `ensureArtifactDeepLinkLoaded()` to use
  `/v1/artifacts/lookup`-backed resolution first, and only keep bounded
  diagnostics fallback if absolutely necessary;
- normalize forum topic counters so missing fields render as explicit zero or
  degraded state, never `undefined`;
- ensure governance page public reads do not regress to raw event history when
  indexer APIs are available;
- ensure placeholder states distinguish "loading", "not mapped", "not indexed
  yet", and "provider failure".

`paperproof-app/src/services/sdk.ts`:

- demote event-history helpers out of normal public-page critical paths;
- add explicit comments or naming that these helpers are compatibility /
  diagnostics surfaces, not canonical public read APIs;
- keep object-read helpers intact.

`paperproof-app/src/services/explore-content.ts`:

- treat indexer-backed Explore endpoints as the stable contract;
- document the required response fields used by `main.ts`;
- make failure modes explicit so the caller can distinguish "empty list" from
  "indexer unavailable."

## 7.2 `paperproof-indexer-reference`

### 7.2.1 Promote existing APIs to canonical app contract

Treat the following routes as the canonical public-read contract:

- `/v1/explore/items`
- `/v1/artifacts/lookup`
- `/v1/governance/proposals`
- `/v1/my/{address}/votes`
- `/v1/official/docs/...`
- `/v1/official/blog/...`
- `/v1/official/forum/...`

### 7.2.2 Add or tighten APIs where the app still has to improvise

If the current response shapes still leave the app reconstructing too much
state, add or tighten:

- artifact lookup by exact artifact code and exact series ID with one stable
  normalized response shape;
- public artifact counts needed by Explore/type cards;
- proposal list fields needed for governance status rendering;
- topic/comment/like counters needed by Forum and artifact list displays;
- explicit degraded-state fields so the app can distinguish "not indexed yet"
  from "provider failed" from "artifact truly absent."

### 7.2.3 Indexer acceptance requirements

- no app-facing public list should require browser event scanning to become
  useful;
- all app-required fields should be present in the indexer response DTOs;
- hidden / canonical / latest-version semantics must remain correct;
- tests should verify exact fields required by app public pages.

### 7.2.4 File-level change checklist

`paperproof-indexer-reference/src/api.rs`:

- confirm `/v1/artifacts/lookup` is sufficient for exact artifact-code and
  exact series-ID resolution without app-side event scanning;
- confirm `/v1/explore/items` and `/v1/explore/summary` expose every field the
  current app public cards and rows require;
- confirm governance proposal responses contain enough status information for
  correct UI rendering;
- confirm official content routes expose stable latest-version resolution and
  durable error semantics.

`paperproof-indexer-reference/docs/api.md`:

- promote the indexer routes that are now considered canonical app-facing
  contracts;
- document degraded-state semantics explicitly;
- document that public frontends should prefer indexer APIs for historical
  discovery rather than browser event scans.

Potentially needed additions:

- if forum counters cannot be derived cleanly from current public APIs, add a
  DTO or endpoint field rather than forcing the app to improvise;
- if artifact lookup still lacks one-shot full detail by code, add it here
  rather than preserving browser scan logic.

## 7.3 `paperproof-sdk-ts`

### 7.3.1 Query-provider hardening

- replace stale mainnet GraphQL default with the current supported mainnet
  endpoint policy;
- narrow GraphQL event-query semantics to filters that are actually supported;
- avoid implying that package-only historical filtering is universally
  available through GraphQL;
- document that public mainnet historical event discovery is not the primary
  job of the frontend SDK.

### 7.3.2 Public API posture

- keep object and tx APIs first-class;
- mark event-history compatibility paths as bounded or deprecated for public
  mainnet use;
- make fallback ordering explicit rather than silently optimistic.

### 7.3.3 Test updates

- add tests for provider-capability mismatch behavior;
- add tests that ensure failures surface as degraded state, not false emptiness;
- add tests that separate object-read success from event-history failure.

### 7.3.4 File-level change checklist

`paperproof-sdk-ts/src/sdk.ts`:

- replace `defaultGraphQLEndpoint()` mainnet default with the current official
  supported endpoint policy;
- make default query-provider construction reflect the new compatibility
  posture.

`paperproof-sdk-ts/src/clients/query-providers.ts`:

- tighten GraphQL provider filter semantics;
- prevent package-only filter behavior from being presented as guaranteed;
- make fallback provider behavior explicit in code comments and docs.

`paperproof-sdk-ts/src/clients/query-client.ts`:

- ensure error surfaces preserve the difference between unsupported query
  semantics and true empty results.

## 7.4 `paperproof-sdk-py`

Apply the same policy as TypeScript:

- fix mainnet GraphQL endpoint defaults;
- separate stable object/tx workflows from compatibility event-query helpers;
- document public mainnet event-history limits clearly;
- ensure CLI defaults prefer the supported query posture;
- expand tests around transport failure and compatibility-mode behavior.

File-level change checklist:

`paperproof-sdk-py/paperproof/query_providers.py`:

- replace stale mainnet GraphQL endpoint default;
- tighten fallback ordering comments and public posture.

`paperproof-sdk-py/paperproof/client.py`:

- make default client construction align with supported mainnet query posture;
- ensure compatibility paths are opt-in rather than silently assumed.

`paperproof-sdk-py/paperproof/sui.py`:

- keep low-level compatibility event query if needed, but clearly mark it as
  non-canonical for public historical discovery.

## 7.5 `paperproof-sdk-rs`

Apply the same policy as the other SDKs:

- fix stale mainnet GraphQL default;
- keep `query_events_jsonrpc()` only as explicit compatibility surface, not
  recommended mainnet default;
- clarify `mainnet_jsonrpc` naming and docs so users understand the limitation;
- strengthen tests that enforce checkpoint/indexer preference for large-scale
  historical scanning.

File-level change checklist:

`paperproof-sdk-rs/src/query.rs`:

- replace stale `MAINNET_GRAPHQL_ENDPOINT`;
- clarify compatibility semantics around GraphQL and JSON-RPC event querying;
- ensure large historical scanning guidance points callers to indexers.

`paperproof-sdk-rs/src/client.rs`:

- keep low-level RPC support, but prevent misleading "normal historical query"
  expectations in higher-level helpers.

`paperproof-sdk-rs/src/sui_native.rs`:

- keep the current architectural warning and align surrounding docs / examples
  to it.

## 7.6 `paperproof-community-skill`

### 7.6.1 Safe operations to keep

- wallet/account object reads;
- balance and coin reads;
- transaction construction and submission;
- publish, add-version, comment, governance write flows.

### 7.6.2 Historical query posture to change

- de-emphasize `query-events` as a normal mainnet discovery tool;
- route governance and artifact public inspection toward indexer-backed or
  GraphQL-safe flows where possible;
- annotate query commands with capability limits and expected failure modes;
- avoid teaching users that event history from public providers is a durable
  source of truth.

File-level change checklist:

`paperproof-community-skill/scripts/query-events.mjs`:

- reframe as diagnostic / bounded-compatibility helper;
- document when it may fail and what users should use instead.

`paperproof-community-skill/scripts/query-governance.mjs`:

- prefer indexer-backed governance inspection when historical listing is
  needed.

`paperproof-community-skill/scripts/lib/publish-runtime.mjs` and
`scripts/lib/governance-runtime.mjs`:

- keep object reads and tx flows unchanged;
- ensure public help text does not imply browser-like event-history discovery
  is the normal workflow.

## 7.7 `paperproof-official-skill`

### 7.7.1 Critical script replacement

Replace direct `suix_queryEvents` enumeration in:

- `skills/upgrade-paperproof-contracts/scripts/promote-legacy-series-controller-mainnet.mjs`

with one of:

- indexer-based canonical series inventory;
- checkpoint-derived series inventory;
- protocol-specific precomputed promotion input artifact.

### 7.7.2 Ops validation additions

Official ops verification should explicitly check:

- no deployment-critical workflow still depends on public
  `suix_queryEvents`;
- official Blog / Docs / Forum publish paths resolve through official content
  APIs after deployment;
- governance page public read succeeds through the supported data path;
- Explore and artifact deep links no longer require browser event scans.

### 7.7.3 File-level change checklist

`paperproof-official-skill/skills/upgrade-paperproof-contracts/scripts/promote-legacy-series-controller-mainnet.mjs`:

- remove direct raw event enumeration;
- replace input sourcing with indexer-backed or checkpoint-derived inventory;
- make failure reporting explicit so ops can distinguish "series not found" and
  "provider query path unavailable."

`paperproof-official-skill/skills/deploy-paperproof-services/`:

- extend deploy verification to include supported public route checks;
- add a check that official content routes, Explore, and governance all load
  through the intended supported data path.

## 7.8 `paperproof-docs`

Documentation updates should:

- describe the indexer as the canonical public read accelerator;
- describe browser direct event scanning as historical/compatibility behavior,
  not the steady-state model;
- align SDK docs with the new query capability policy;
- align ops docs with the new official upgrade and deployment procedures.

Relevant documents to update:

- `design/app/dynamic-site-design.md`
- `design/app/explore-indexer-cache-refactor-plan.md`
- `design/app/official-content-server-rendering-plan.md`
- SDK repo API docs
- official skill runbooks and upgrade guides

## 7.9 Repositories that do not need primary remediation

The following are not expected to be the primary fix location for this issue:

- `paperproof-contracts`
- `paperproof-papers`
- `paperproof-slides`

They may need documentation references updated, but the deprecated public event
query problem is not fundamentally caused there.

## 8. Dependency-aware rollout order

The work should be sequenced by data-contract dependency, not by perceived UI
urgency.

Phase 0: freeze the design and policy.

- finalize this design note;
- declare that public historical discovery is indexer-first.

Phase 1: confirm and tighten indexer contracts.

- verify current app-needed fields;
- add missing fields or degraded-state markers;
- document canonical public API usage.

Phase 2: app public-read path hardening.

- remove critical route dependence on browser event scans;
- normalize degraded states and counts;
- keep UI unchanged.

Phase 3: SDK default and docs correction.

- update the three SDK lines together;
- keep compatibility helpers only as explicit compatibility surfaces.

Phase 4: skill hardening.

- community skill: reposition event-query helpers;
- official skill: remove deprecated public historical scan from ops flows.

Phase 5: deploy verification hardening.

- update official deploy checks;
- verify the data path rather than only the page shell.

## 8. Cross-repo rollout order

The safest rollout order is:

1. Freeze the architectural policy in design docs.
2. Tighten indexer API contracts and response shapes.
3. Refactor `paperproof-app` public list and deep-link paths to indexer-first.
4. Update the three SDK lines so their defaults and docs stop encouraging the
   deprecated pattern.
5. Update community skill to separate safe object/tx flows from fragile event
   history helpers.
6. Update official skill so deployment and migration no longer depend on
   public historical event queries.
7. Add deploy verification that proves the supported paths work end-to-end.

This order minimizes the chance of fixing the app while leaving its underlying
API or tooling contracts unstable.

## 8.1 Current completion matrix

`paperproof-app`:

- partially completed;
- already has indexer-backed Explore and official-content infrastructure;
- still needs removal of critical event-scan dependence and degraded-state
  normalization.

`paperproof-indexer-reference`:

- largely ready as the canonical read layer;
- still needs contract tightening and DTO completeness review.

`paperproof-sdk-ts`:

- not complete for this remediation;
- stale mainnet GraphQL default and event-query posture still present.

`paperproof-sdk-py`:

- not complete for this remediation;
- stale mainnet GraphQL default and compatibility posture still present.

`paperproof-sdk-rs`:

- conceptually closest to the target architecture;
- still not complete because shipped defaults and public compatibility naming
  are not fully aligned.

`paperproof-community-skill`:

- not complete for this remediation;
- still needs historical query posture cleanup.

`paperproof-official-skill`:

- not complete for this remediation;
- still contains a critical raw event-scan path.

`paperproof-docs`:

- not complete for this remediation;
- needs wording and runbook alignment.

## 9. Acceptance tests and deploy verification

The remediation is only complete when verification moves beyond "page loaded
once on my machine."

## 9.1 App acceptance checks

- `/explore` loads public artifact cards without browser historical scan
  dependency;
- `/type/...` pages populate from indexer-backed responses with stable counts;
- `/artifact/...` deep links resolve by code and by series ID without browser
  event backfill;
- `/governance` loads proposal history and my-vote history through supported
  APIs;
- `/docs/...`, `/blog/...`, and `/forum/...` open without getting stuck in
  placeholder state due to missing event-history hydration;
- no public list row renders `undefined` counts or labels.

## 9.2 SDK acceptance checks

- object reads and transaction submission continue to work unchanged;
- public mainnet query defaults use current supported endpoints;
- compatibility event-query helpers fail clearly and predictably when the
  provider does not support the requested semantics;
- docs and examples no longer present browser historical scanning as the normal
  PaperProof integration pattern.

## 9.3 Indexer acceptance checks

- app-required DTO fields are complete and stable;
- hidden artifacts remain hidden;
- latest version resolution remains correct;
- governance status fields remain accurate;
- official content APIs resolve the latest official bodies correctly.

## 9.4 Ops acceptance checks

- official deploy verification exercises governance, Explore, artifact detail,
  official Blog, official Docs, and official Forum public read paths;
- no upgrade or migration script fails because of public `suix_queryEvents`
  dependency;
- deployment success criteria explicitly include data-path verification, not
  just process liveness.

## 9.5 Route-by-route verification matrix

`/explore`:

- expected primary source: indexer;
- allowed direct-chain enrichment: no for initial list readiness;
- failure mode requirement: show degraded data-source error, not empty catalog.

`/type/...`:

- expected primary source: indexer;
- allowed direct-chain enrichment: only optional per-item detail hydration;
- failure mode requirement: stable row rendering with no `undefined` labels.

`/artifact/...`:

- expected primary source: indexer lookup for route resolution;
- allowed direct-chain enrichment: current version object, likes book, comments
  tree, Walrus content;
- failure mode requirement: route should resolve without browser event scan.

`/governance`:

- expected primary source: indexer proposal and vote APIs;
- allowed direct-chain enrichment: specific object hydration when needed;
- failure mode requirement: no public-route dependency on raw historical event
  scans.

`/docs/...`, `/blog/...`, `/forum/...`:

- expected primary source: official indexer-backed manifest/body APIs;
- allowed direct-chain enrichment: none required for first readable content;
- failure mode requirement: placeholder should not persist because unrelated
  event-history refresh stalled elsewhere.

## 10. Backward-compatibility policy

This remediation should preserve:

- protocol object model;
- artifact codes and series IDs;
- current public routes;
- current published content;
- current wallet interaction flows;
- current desktop and mobile UI presentation.

It should not preserve one behavior:

- implicit reliance on public browser-side historical event indexing.

Where compatibility helpers remain, they should be clearly marked as:

- bounded fallback;
- diagnostics helper;
- migration-era utility;
- or deprecated public-mainnet behavior.

## 11. Non-goals

This plan does not aim to:

- redesign the PaperProof UI;
- move all logic server-side;
- remove direct verified object reads;
- remove JSON-RPC transaction flows;
- change PaperProof protocol semantics;
- introduce centralized content authority.

## 11.1 Explicit do-not-change constraints

To avoid scope drift during implementation:

- do not redesign desktop UI;
- do not redesign mobile UI;
- do not rename routes;
- do not change artifact semantics or governance semantics;
- do not move protocol truth out of Sui / Walrus;
- do not remove useful object-read or transaction JSON-RPC capabilities;
- do not solve missing DTO fields by adding fake placeholder data in the UI.

## 12. Immediate recommended worklist

The highest-value next actions are:

1. Finish removing app critical-path dependence on browser event scans for
   Explore, artifact-code deep links, and forum/governance public counters.
2. Update all three SDK lines so mainnet query defaults and docs reflect the
   current supported provider model.
3. Replace `suix_queryEvents` usage in official upgrade/migration tooling.
4. Add deploy-time verification that explicitly proves the supported read paths
   are healthy.
5. Update docs so the PaperProof steady-state read architecture is documented
   accurately.

## 12.1 Recommended engineering tickets

To make this plan directly actionable, the work can be split into these
implementation tickets:

1. App: remove artifact deep-link dependence on browser event scan.
2. App: make Explore and type-page readiness fully indexer-first.
3. App: normalize forum / artifact / governance degraded state and prevent
   `undefined` rendering.
4. Indexer: verify and fill missing fields required by app public DTOs.
5. SDK-TS: replace stale mainnet GraphQL default and tighten event-query docs.
6. SDK-PY: replace stale mainnet GraphQL default and tighten compatibility
   posture.
7. SDK-RS: replace stale mainnet GraphQL default and tighten public naming /
   docs around compatibility mode.
8. Community skill: reposition `query-events` as compatibility / diagnostics.
9. Official skill: remove `suix_queryEvents` from upgrade / migration flow.
10. Deploy skill: add supported-path verification after deploy.
11. Docs: align design and runbooks with the new steady-state read model.

## 13. Final design conclusion

PaperProof does not need a new architecture to solve this problem.

It already has the correct core architecture:

- Sui and Walrus as truth;
- indexer as replayable read-acceleration layer;
- app as user-facing product shell;
- SDKs as object/tx integration layer.

What is needed now is consistency:

- public history and discovery must move fully onto indexer-backed contracts;
- SDK defaults must stop pointing users toward fragile public event-query
  assumptions;
- ops tooling must stop depending on deprecated historical scans;
- degraded states must remain truthful and deterministic rather than provider-
  specific.

Once that cleanup is finished, PaperProof public reading surfaces will be more
stable, faster, and easier to operate without changing the protocol model or
the visible user experience.
