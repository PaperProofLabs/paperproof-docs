Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# PaperProof App Design Notes

This directory preserves design, architecture, implementation, and operational
notes for the PaperProof official app.

These files are not runtime assets for `paperproof-app`. They are maintained in
`paperproof-docs` so the app repository can stay focused on source code and
deployable frontend/server integration logic, while project-level design records
remain in the documentation repository.

The notes currently cover:

- brand, UI, and content format decisions;
- Copilot and MemWal memory design;
- SuiNS-aware identity display for Sui addresses;
- legal and policy links used by the official interface;
- publish-flow UX analysis;
- official Docs, Blog, Forum server-assisted content delivery;
- Explore indexer cache and featured artifact ordering;
- search-engine optimization and public discoverability design.

## Current production-oriented design set

The most important current app-facing design files are:

- [dynamic-site-design.md](./dynamic-site-design.md) for the official site's
  dynamic public-app model.
- [official-content-server-rendering-plan.md](./official-content-server-rendering-plan.md)
  for official Docs, Blog, and Forum body delivery through indexer-backed
  verified content APIs.
- [path-route-rewrite-rollout-plan.md](./path-route-rewrite-rollout-plan.md)
  for direct pathname access, canonical URLs, and deploy-time serving checks.
- [search-engine-optimization-design.md](./search-engine-optimization-design.md)
  for crawlability, metadata, grouped sitemaps, static SEO route shells,
  robots, and share-card behavior.
- [explore-indexer-cache-refactor-plan.md](./explore-indexer-cache-refactor-plan.md)
  for Explore and type-list data paths.
- [responsive-ui-mobile-desktop-adaptation-plan.md](./responsive-ui-mobile-desktop-adaptation-plan.md)
  for mobile adaptation without desktop drift.
- [site-analytics-design.md](./site-analytics-design.md) for privacy-bounded
  website analytics and deploy-time verification expectations.

## Current status note

As of the current PaperProof mainnet/app line:

- the official site remains a browser-rendered app, not a full SSR rewrite;
- path-based public URLs and server rewrite support are part of the intended
  live architecture;
- robots, grouped sitemap output, static public SEO route shells, and
  page-level metadata are part of the public discoverability baseline;
- official Docs, Blog, and Forum content use indexer-assisted verified-content
  APIs where appropriate;
- runtime metadata replacement keeps canonical, social, and article-specific
  tags aligned with client-side route changes;
- mobile adaptation work should preserve desktop UI parity rather than create a
  separate desktop visual language.

## Reading guidance

Use these notes as follows:

- read design files in this directory for current intended behavior and
  constraints;
- read code in `paperproof-app` and `paperproof-indexer-reference` for exact
  implementation details;
- read rollout-only or one-off operational notes in the official skill or
  deployment repositories, not here, unless the behavior remains part of the
  steady-state product contract.
