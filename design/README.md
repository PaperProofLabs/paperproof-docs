# design

This directory holds PaperProof design, architecture, rollout, and product
notes that are broader than any single source-code repository.

The goal of this directory is not to mirror implementation file-by-file. It is
to preserve the current intended design, the key rollout decisions, and the
important constraints that later engineering work should continue to respect.

## Current structure

Two top-level areas are maintained here:

- [app/](./app/) for official website, indexer-assisted rendering, UX,
  discoverability, and public-interface behavior.
- [system/](./system/) for protocol-level and cross-repo design, especially the
  controller-NFT authority model.

## Recommended reading order

If the goal is to understand the live public website and its direction:

- [app/README.md](./app/README.md)
- [app/dynamic-site-design.md](./app/dynamic-site-design.md)
- [app/official-content-server-rendering-plan.md](./app/official-content-server-rendering-plan.md)
- [app/path-route-rewrite-rollout-plan.md](./app/path-route-rewrite-rollout-plan.md)
- [app/search-engine-optimization-design.md](./app/search-engine-optimization-design.md)
- [app/responsive-ui-mobile-desktop-adaptation-plan.md](./app/responsive-ui-mobile-desktop-adaptation-plan.md)
- [app/site-analytics-design.md](./app/site-analytics-design.md)

If the goal is to understand protocol authority and the NFT control upgrade:

- [system/artifact-control-nft-rearchitecture.md](./system/artifact-control-nft-rearchitecture.md)
- [system/artifact-control-nft-rollout-history.md](./system/artifact-control-nft-rollout-history.md)

## Current high-signal documents

Important current app-facing design records include:

- [app/content-format-design.md](./app/content-format-design.md) for Markdown
  package and content-format conventions.
- [app/copilot-memwal-memory-design.md](./app/copilot-memwal-memory-design.md)
  for Copilot memory and MemWal integration boundaries.
- [app/explore-indexer-cache-refactor-plan.md](./app/explore-indexer-cache-refactor-plan.md)
  for Explore, type-list, and artifact-discovery data paths.
- [app/official-content-server-rendering-plan.md](./app/official-content-server-rendering-plan.md)
  for indexer-backed official Docs, Blog, and Forum serving.
- [app/path-route-rewrite-rollout-plan.md](./app/path-route-rewrite-rollout-plan.md)
  for canonical path URLs and server rewrite behavior.
- [app/search-engine-optimization-design.md](./app/search-engine-optimization-design.md)
  for robots, grouped sitemaps, static public SEO shells, metadata, canonical,
  crawlability, and share-preview strategy.
- [app/publish-storage-onchain-ux-optimization.md](./app/publish-storage-onchain-ux-optimization.md)
  for publish-flow latency and pending-state UX.
- [app/responsive-ui-mobile-desktop-adaptation-plan.md](./app/responsive-ui-mobile-desktop-adaptation-plan.md)
  for mobile adaptation that preserves desktop UI parity.

Important current system-facing design records include:

- [system/artifact-control-nft-rearchitecture.md](./system/artifact-control-nft-rearchitecture.md)
  as the canonical steady-state controller-NFT design.
- [system/artifact-control-nft-rollout-history.md](./system/artifact-control-nft-rollout-history.md)
  as the historical mainnet rollout and migration record.
- [system/sui-public-event-query-remediation-plan.md](./system/sui-public-event-query-remediation-plan.md)
  for the cross-repo hardening plan that removes critical dependence on public
  historical Sui event-query behavior.

## Maintenance rule

When implementation lands and materially changes the steady-state behavior, the
relevant design note here should be updated from a future-looking plan into a
current-state record, while rollout-only details should move into explicit
history or ops documents instead of remaining mixed into normative design.
