Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# PaperProof Search Engine Optimization Design

## 1. Purpose

This document records the current SEO design for the public PaperProof website.

It is meant to guide ongoing improvements without breaking:

- protocol truth boundaries;
- current desktop UI behavior;
- current mobile UI behavior;
- wallet-connected interaction flows;
- official Docs, Blog, Forum, artifact, and governance semantics.

This is not a plan to turn PaperProof into a conventional CMS website.
PaperProof remains a protocol-driven application. SEO work should make public
content easier to crawl, preview, and understand, while keeping Sui and Walrus
as the underlying source of truth.

## 2. Current baseline

As of the current production line, the public site already has an SEO baseline
that did not exist earlier:

- public path routes are part of the intended public URL model;
- server rewrite supports direct path access instead of relying only on `#/...`;
- `robots.txt` is present;
- `sitemap.xml` is present;
- page-level `title`, `description`, and `canonical` handling exist for major
  public route families;
- official Docs and Blog public routes can be opened through stable path URLs;
- the official indexer-backed public content API exists and is used as a
  verified content source for official Docs, Blog, and Forum bodies.

This means PaperProof is no longer in a pure hash-only, crawler-hostile state.
However, it is also not yet a fully server-rendered content site.

## 3. What is already solved

### 3.1 Public path accessibility

The public website now treats path URLs as first-class public routes, including
families such as:

- `/docs/...`
- `/blog/...`
- `/artifact/...`
- `/proposal/...`
- `/type/...`
- `/explore`
- `/governance`

This is necessary for search engines, link previews, and stable public sharing.

### 3.2 Crawl directives

The production site includes:

- `robots.txt`
- `sitemap.xml`

These are part of the minimum discoverability contract and should remain in
every official deploy.

### 3.3 Page-level metadata

The public site now supports route-aware metadata for major public pages:

- page title
- description
- canonical URL

This is the minimum requirement for meaningful search-result snippets and
duplicate-URL control.

### 3.4 Official public-content serving

Official Docs, Blog, and Forum bodies now have an indexer-assisted verified
content path. This improves reliability and speed for public content loading
without changing protocol authority.

That server-assisted content path is an important SEO foundation because it
reduces the amount of browser-side protocol fetching required before content is
readable.

## 4. What is not fully solved yet

The current implementation is better than the old hash-only model, but several
SEO limitations still remain.

### 4.1 The site is still primarily browser-rendered

The official website still ships as a browser-rendered app shell. In many page
families, the final meaningful body content is still assembled after the page
loads in the browser.

This means some crawlers may still see:

- a strong title/description/canonical layer;
- correct route accessibility;
- but incomplete first-response body content.

### 4.2 Official bodies are not yet universal full HTML SSR

The current official-content serving path improves body loading, but it is not
the same thing as a full static or server-rendered HTML page for every public
route. It is a server-assisted content model inside a browser-rendered site.

### 4.3 Structured data is still incomplete

The long-term target should include richer route-family JSON-LD, but that
should be done carefully and truthfully rather than rushed.

### 4.4 Search previews and social previews should keep improving

Even with page-level metadata in place, PaperProof still benefits from better:

- per-page descriptions;
- per-page preview images;
- structured content summaries;
- route-family-specific metadata conventions.

## 5. SEO invariants

All SEO work should preserve the following rules.

### 5.1 Do not change protocol truth

SEO content must always be derived from canonical PaperProof facts, official
manifests, and verified content paths. It must not become a separate content
authority.

### 5.2 Do not change UI or interaction semantics just for SEO

SEO improvements must not be used as a pretext to redesign:

- page layouts;
- wallet flows;
- publishing flows;
- comments semantics;
- governance flows;
- Copilot behavior.

### 5.3 Do not overstate what a page is

If a page is an artifact detail page, metadata should describe the artifact.
If it is a proposal page, metadata should describe the proposal. Do not invent
marketing language that conflicts with the actual route content.

### 5.4 Do not create duplicate public truths

There should be one intended canonical public URL per public entity view. Hash
routes may remain for compatibility, but they should not become the preferred
public indexing target.

## 6. Public route model

The intended public route model is:

- home and discovery routes:
  - `/`
  - `/explore`
  - `/type/:slug`
  - `/blog`
  - `/docs`
  - `/forum`
  - `/governance`
- detail routes:
  - `/docs/:section`
  - `/docs/:section/:topic`
  - `/blog/:slug`
  - `/forum/:slug`
  - `/artifact/:artifactCode`
  - `/proposal/:proposalId`

Hash URLs may continue to exist for compatibility, but the path form is the
canonical public form.

## 7. Metadata design

### 7.1 Minimum metadata for all public pages

Every public canonical page should have:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph title
- Open Graph description
- Open Graph URL
- Twitter title
- Twitter description

Preview images should be added where reliable route-family defaults exist.

### 7.2 Title conventions

Recommended title conventions:

- Docs: `{Doc Title} | PaperProof Docs`
- Blog: `{Post Title} | PaperProof Blog`
- Artifact detail: `{Artifact Title} | PaperProof Artifact`
- Proposal detail: `{Proposal Title} | PaperProof Governance`
- Type list: `{Type Label} | PaperProof`
- Explore: `Explore | PaperProof`

### 7.3 Description conventions

Descriptions should:

- be route-specific;
- stay readable to ordinary humans;
- avoid dumping raw protocol identifiers;
- reuse artifact descriptions, abstracts, or official summaries where they are
  already present and meaningful;
- remain concise enough for normal search snippets.

For artifacts:

- prefer `abstract` for paper/report-style artifacts when available;
- otherwise prefer `description`;
- otherwise use a clean truncated summary derived from current visible content.

### 7.4 Canonical rules

Canonical rules should follow these principles:

- canonical points to the path-based public URL;
- hash URLs should not be canonical;
- list pages with meaningful query states should preserve those states only
  when the state changes the public page meaning materially;
- otherwise, sort/filter-only variants may canonicalize to the primary list URL.

## 8. Route-family SEO treatment

### 8.1 Docs

Docs are one of the highest-priority public surfaces because they explain what
PaperProof is, how it works, and how to use it.

Docs pages should have:

- stable path URLs;
- route-specific metadata;
- correct canonical URLs;
- crawl-friendly first-response structure as the implementation improves;
- breadcrumb-like internal linkage through section/topic structure.

### 8.2 Official Blog

Official Blog is a high-value route family for both search and ecosystem
distribution.

Blog pages should have:

- stable path URLs;
- route-specific title and description;
- good link-preview metadata;
- clear body-first reading structure;
- per-post canonical URLs.

### 8.3 Artifact detail pages

Artifact detail pages are a core PaperProof differentiator because they expose
the protocol object itself, not just a platform-local content page.

Artifact pages should surface:

- artifact title;
- type;
- description or abstract;
- latest version context;
- stable protocol identity references;
- download or preview entry points where applicable.

### 8.4 Proposal detail pages

Proposal pages are worth indexing because they expose protocol evolution and
governance activity.

Proposal pages should have:

- proposal title;
- proposal summary/body description;
- current status;
- canonical path URL.

### 8.5 Type lists and Explore

These pages are useful as discovery hubs and internal link anchors, even though
their SEO value is lower than stable detail pages.

They should still have:

- path-based public URLs;
- route-specific title and description;
- stable canonical handling;
- crawl-friendly first-response page structure where feasible.

## 9. Structured data direction

Structured data should be introduced carefully and truthfully.

Recommended priorities:

- site-level `Organization` / `WebSite`
- Docs and Blog article-like structured data
- artifact-type-aware structured data for major artifact families
- breadcrumb data for Docs and other hierarchical public routes

Recommended mapping direction:

- preprints and reports: article-like schemas
- blog posts: blog-post-like schemas
- datasets: dataset-like schemas
- software releases: software/project-like schemas

Structured data must not pretend that protocol IDs are ordinary user-facing
marketing properties. They can appear as identifiers where appropriate, but the
main schema should remain readable and semantically honest.

## 10. Social preview design

SEO and social preview quality are tightly related for PaperProof because much
of its discovery happens through shared links.

Every major public page should support:

- `og:title`
- `og:description`
- `og:url`
- `twitter:card`
- `twitter:title`
- `twitter:description`

Where reliable preview art exists, route families should also define:

- `og:image`
- `twitter:image`

The image choice should be stable, relevant, and not misleading.

## 11. Sitemap and robots design

### 11.1 Sitemap requirements

The sitemap should remain generated from real public content, not from guessed
or fabricated page lists.

High-priority entries include:

- Docs pages
- official Blog pages
- public artifact detail pages
- type-list pages
- proposal detail pages
- primary discovery pages

### 11.2 Robots requirements

`robots.txt` should continue to allow crawling of meaningful public pages while
avoiding confusion around non-public or machine-only paths where appropriate.

The precise allow/disallow policy should stay aligned with the deployed route
shape and should be rechecked whenever new public route families are added.

## 12. Rendering strategy by page class

PaperProof should not use one rendering strategy for every page.

The intended long-term split is:

- public reading routes:
  - path-based
  - crawl-friendly
  - metadata-rich
  - server-assisted or server-rendered where justified
- interactive wallet routes:
  - app-first
  - client-driven
  - not optimized primarily for search indexing

This allows the product to improve public discoverability without breaking the
client-side strengths of the protocol application.

## 13. Priority roadmap

### 13.1 Baseline that should always remain deployed

These items are now baseline requirements and should not regress:

- public path-route accessibility
- server rewrite support
- `robots.txt`
- `sitemap.xml`
- page-level `title`
- page-level `description`
- page-level `canonical`

### 13.2 Next layer to keep improving

The next important layer is:

- better route-family metadata quality;
- stronger social preview coverage;
- structured data rollout for key page families;
- more crawl-friendly first-response body content on high-value public pages.

### 13.3 Highest-value long-term target

The highest-value long-term target is:

- Docs, official Blog, artifact detail, and proposal detail pages whose first
  public response is both metadata-rich and meaningfully readable even for weak
  JS crawlers.

That is more important than chasing cosmetic SEO tweaks.

## 14. Validation checklist

Every official deploy should continue verifying at least:

- home route works;
- key path routes work;
- `robots.txt` is reachable;
- `sitemap.xml` is reachable;
- public API health works;
- canonical path URLs do not regress into broken or placeholder routes;
- representative official Docs and Blog pages still resolve correctly.

For major SEO changes, validation should also include:

- title checks;
- description checks;
- canonical checks;
- a small set of route-family response checks using public URLs;
- share-preview spot checks when metadata or image handling changes.

## 15. Final recommendation

PaperProof should continue treating SEO as a public-content accessibility layer,
not as a separate content system and not as a reason to weaken protocol
semantics.

The correct steady-state direction is:

- path-based public URLs;
- truthful per-page metadata;
- stable sitemap and robots behavior;
- verified official-content serving;
- progressively stronger first-response readability for high-value public
  content;
- no regression in wallet, governance, publishing, or other protocol-app
  interaction flows.
