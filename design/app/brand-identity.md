Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Interface-Source-Available

# PaperProof Brand Identity

This document records the intended distinction between PaperProof Protocol and
PaperProof Labs visual identity assets.

## Protocol and Labs

PaperProof Protocol refers to the open protocol layer and official deployed
protocol instances. PaperProof Labs refers to the originating team and
maintainer of the official interface, SDKs, reference indexer, documentation,
and brand identity.

The two identities are intentionally related, but they are not identical:

- PaperProof Protocol is the protocol, object model, deployed contracts, event
  layer, content commitment layer, governance surface, PPRF coordination layer,
  and Sui/Walrus integration layer.
- PaperProof Labs is the originating and maintaining team behind the official
  website, official docs, SDKs, reference indexer, official blog, releases,
  project communication, and brand stewardship.

This distinction helps third-party builders integrate with PaperProof Protocol
without implying that they are operated by PaperProof Labs.

## Logo Assets

The app keeps the following long-lived logo assets in `public/`:

| Asset | Meaning | Intended use |
|---|---|---|
| `public/logo_protocol.paperproof.png` | PaperProof Protocol logo | Protocol-level identity, app navigation, favicon source, protocol diagrams, SDK compatibility references, and `Powered by PaperProof Protocol on Sui and Walrus` |
| `public/logo_labs.paperproof.wordmark.png` | PaperProof Labs mark with Labs wordmark | Official-team identity, official blog authorship, release notes, GitHub organization references, contact blocks, and official announcements |
| `public/favicon.png` | Existing protocol-logo favicon | Browser favicon |
| `public/logo.png` | Existing protocol-logo app asset | Existing app logo references |
| `public/logo_labs.paperproof.png` | Original Labs-logo upload | Source asset retained for compatibility and traceability |

The protocol logo should be used when the subject is the protocol itself. The
Labs mark should be used when the subject is the official team, official
publisher, or official maintainer identity.

## Third-Party Use

Third parties may describe factual compatibility with PaperProof Protocol and
may build independent websites, applications, indexers, dashboards, agents,
explorers, developer tools, and community entrypoints for the protocol.

Third parties must not use PaperProof Labs identity, Labs logo assets, official
website expression, official UI text, official static assets, or brand
presentation in a way that suggests operation, endorsement, affiliation,
official interface status, governance authority, or sponsorship by PaperProof
Labs unless separately authorized.

Functional similarity that naturally follows from protocol interoperability is
not prohibited. Confusing similarity with the official PaperProof interface or
PaperProof Labs identity is prohibited.
