# paperproof-docs

This repository is the documentation, brand, design, and project-record
repository for the PaperProof ecosystem.

It is intended to preserve and organize the non-code materials that define,
describe, support, and evidence the PaperProof project, including whitepapers,
brand assets, diagrams, screenshots, design notes, governance materials, token
materials, DID drafts, and legal or rights-related records.

## Repository structure

This repository is a documentation and project-record hub. Some root folders
hold production content directly; others are lightweight routing folders that
point to the repository, subfolder, or file where the current substantive
material lives.

| Path | Status | Substantive content |
|---|---|---|
| `homepages/docs/` | Active content | Source Markdown package for the official Docs surface published to [paperproof.site](https://paperproof.site/). Start with [homepages/docs/getting-started/introduction.md](./homepages/docs/getting-started/introduction.md), [homepages/docs/protocol/artifact-model.md](./homepages/docs/protocol/artifact-model.md), and [homepages/docs/developers/indexer-integration.md](./homepages/docs/developers/indexer-integration.md). |
| `homepages/blogs/` | Active content | Official Blog Markdown package, including diagrams and image assets. See [paperproof-verifiable-knowledge-infrastructure.md](./homepages/blogs/paperproof-verifiable-knowledge-infrastructure.md), [from-walrus-blob-to-on-chain-artifact.md](./homepages/blogs/from-walrus-blob-to-on-chain-artifact.md), and [assets/application-architecture-flow.svg](./homepages/blogs/assets/application-architecture-flow.svg). |
| `homepages/forums/` | Active content | Seed content for the official Forum surface, including developer support, governance, protocol discussion, and showcase posts. |
| `design/app/` | Active design record | Product, content, Copilot memory, server-rendering, and UX design notes. Key files include [dynamic-site-design.md](./design/app/dynamic-site-design.md), [content-format-design.md](./design/app/content-format-design.md), [copilot-memwal-memory-design.md](./design/app/copilot-memwal-memory-design.md), and [official-content-server-rendering-plan.md](./design/app/official-content-server-rendering-plan.md). |
| `legal/` | Active policy record | Protocol user-content, official-interface, takedown, incentive, role-separation, and operating-time policy templates. Start with [legal/protocol-user-content-and-risk.md](./legal/protocol-user-content-and-risk.md). |
| `screenshots/` | Active evidence record | Website, GitHub, SDK publication, and Skill demo screenshots used by papers, slides, blogs, and hackathon materials. See [screenshots/README.md](./screenshots/README.md). |
| `artifacts/` | Active release record | JSON records and checkpoints from publishing or extending Docs, Blog, Forum, flagship materials, and Walrus-backed official artifacts. |
| `scripts/` | Active operations | Publishing scripts for Docs, Blog, Forum, and flagship-material version records: [publish-docs.mjs](./scripts/publish-docs.mjs), [publish-blogs.mjs](./scripts/publish-blogs.mjs), [publish-forums.mjs](./scripts/publish-forums.mjs), and [add-flagship-material-versions.mjs](./scripts/add-flagship-material-versions.mjs). |
| `overflow2026/` | Active hackathon research | Sui Overflow 2026 Walrus-track intelligence, competitor notes, problem statements, and winner benchmark dataset materials. |
| `whitepaper/` | Routing folder | Current paper sources and PDFs live in [PaperProofLabs/paperproof-papers](https://github.com/PaperProofLabs/paperproof-papers). This folder preserves the documentation-repo slot for whitepaper-adjacent records. |
| `diagrams/` | Routing folder | Current diagram source/assets live mainly under [homepages/blogs/figures/tikz](./homepages/blogs/figures/tikz) and [homepages/blogs/assets](./homepages/blogs/assets), and are also reused by the papers and slides repositories. |
| `brand/` | Routing folder | Current brand guidance is tracked here and in [design/app/brand-identity.md](./design/app/brand-identity.md). Public organization context is at [PaperProofLabs on GitHub](https://github.com/PaperProofLabs). |
| `governance/` | Routing folder | Current governance-facing documentation is in [homepages/docs/governance-and-economics](./homepages/docs/governance-and-economics), and protocol/governance implementation context lives in [PaperProofLabs/paperproof-contracts](https://github.com/PaperProofLabs/paperproof-contracts). |
| `token/` | Routing folder | PPRF token-contract work lives in [PaperProofLabs/PPRF-token-contracts](https://github.com/PaperProofLabs/PPRF-token-contracts). Docs-facing token material is in [homepages/docs/governance-and-economics/pprf-utility.md](./homepages/docs/governance-and-economics/pprf-utility.md). |
| `did/` | Routing folder | DID-related ideas are not a primary live workstream yet. Related durable-identity design currently appears in [homepages/docs/protocol/artifact-model.md](./homepages/docs/protocol/artifact-model.md) and [homepages/docs/protocol/manifests-and-canonical-state.md](./homepages/docs/protocol/manifests-and-canonical-state.md). |
| `archive/` | Routing folder | Reserved for deprecated drafts and superseded records. Current publish checkpoints are kept in [artifacts/](./artifacts/). |

## Related repositories

| Repository | Role |
|---|---|
| [PaperProofLabs/paperproof-app](https://github.com/PaperProofLabs/paperproof-app) | Official website, publishing UI, artifact detail pages, Docs/Blog/Forum rendering, Copilot, API/server, and indexer-facing integration. |
| [PaperProofLabs/paperproof-contracts](https://github.com/PaperProofLabs/paperproof-contracts) | Sui mainnet contract packages for artifact identities, categories, versioning, metadata, and events. |
| [PaperProofLabs/paperproof-indexer-reference](https://github.com/PaperProofLabs/paperproof-indexer-reference) | Reference indexer for tracking PaperProof on-chain events and serving fast canonical content to app/server surfaces. |
| [PaperProofLabs/paperproof-papers](https://github.com/PaperProofLabs/paperproof-papers) | White paper, yellow paper, and academic paper sources/PDFs. |
| [PaperProofLabs/paperproof-slides](https://github.com/PaperProofLabs/paperproof-slides) | Hackathon and protocol presentation deck. |
| [PaperProofLabs/paperproof-community-skill](https://github.com/PaperProofLabs/paperproof-community-skill) | Community-facing PaperProof Skill for AI/agent workflows that publish or update PaperProof artifacts. |
| [PaperProofLabs/paperproof-official-skill](https://github.com/PaperProofLabs/paperproof-official-skill) | Official-only operational skills for production deployment, wallet-connected website automation, demo-video production, and private competitive-intelligence maintenance. |
| [PaperProofLabs/paperproof-sdk-py](https://github.com/PaperProofLabs/paperproof-sdk-py) | Python SDK published through PyPI. |
| [PaperProofLabs/paperproof-sdk-ts](https://github.com/PaperProofLabs/paperproof-sdk-ts) | TypeScript SDK published through npm. |
| [PaperProofLabs/paperproof-sdk-rs](https://github.com/PaperProofLabs/paperproof-sdk-rs) | Rust SDK published through crates.io. |
| [PaperProofLabs/paperproof-sui-overflow-2026](https://github.com/PaperProofLabs/paperproof-sui-overflow-2026) | Public Sui Overflow 2026 submission entry repository. |
| [MystenLabs/MemWal](https://github.com/MystenLabs/MemWal) | Upstream memory component used by the PaperProof Copilot memory design. |

## Rights and license

This repository is made publicly available for transparency, project record
preservation, security and design review, research, evaluation, factual
reference, and ecosystem understanding.

PaperProof Protocol refers to the open protocol layer and official deployed
protocol instances. PaperProof Labs refers to the originating team and
maintainer of the official interface, SDKs, reference indexer, documentation,
and brand identity.

It is not distributed under a permissive open-source or open-content license.
Use of the repository materials is governed by the root `LICENSE`, `NOTICE`,
`TRADEMARKS.md`, and `CONTENT_NOTICE.md` files.

No patent license is granted by access to this repository or by any public
availability of its contents.

This repository protects PaperProof documentation expression, brand assets,
design materials, project records, and narrative materials. It is not intended
to prevent third parties from building independent applications, indexers,
wallets, dashboards, agents, explorers, developer tools, or other integrations
that interoperate with the official PaperProof protocol using public contract
interfaces, SDKs, official deployment identifiers, object IDs, event schemas,
and other factual protocol metadata, provided they do not copy protected
PaperProof documentation or brand materials, misuse PaperProof marks, or
falsely claim official status.

## License Matrix

This repository uses differentiated rights for different kinds of material.
The repository-level `LICENSE` is the default for documentation, brand, design,
and project-record materials unless a file, directory notice, third-party asset,
or separate agreement states otherwise.

| Material | Terms |
|---|---|
| Whitepaper drafts, diagrams, screenshots, design notes, governance notes, token-layer materials, DID drafts, project records, and protected documentation expression | PaperProof Documentation and Brand Source-Available License under the root `LICENSE` |
| Brand assets, names, logos, icons, visual identities, and token identity materials | Reserved under the root `LICENSE` and `TRADEMARKS.md`; no implied endorsement or official status |
| Third-party references, excerpts, or assets | Their own upstream terms, where applicable |
| Public contract interfaces, official deployment identifiers, object IDs, event schemas, and other factual protocol metadata | May be used for interoperability with the official PaperProof protocol |
| Independent third-party applications, wallets, indexers, dashboards, agents, explorers, and developer tools | Permitted when they interoperate through public protocol interfaces and do not copy protected PaperProof documentation or brand materials, misuse marks, or falsely claim official status |

This matrix is intended to preserve PaperProof documentation expression,
brand identity, and project records while keeping the protocol open to
compatible Web3 applications and ecosystem development.

For protocol-use, user-content, official-interface, takedown, and risk
boundaries, see
[legal/protocol-user-content-and-risk.md](./legal/protocol-user-content-and-risk.md).

Related operational policy templates:

- [legal/incentive-program-template.md](./legal/incentive-program-template.md)
- [legal/takedown-review-process.md](./legal/takedown-review-process.md)
- [legal/official-discretion-and-change-policy.md](./legal/official-discretion-and-change-policy.md)
- [legal/identity-and-role-separation.md](./legal/identity-and-role-separation.md)
- [legal/official-operations-effective-time.md](./legal/official-operations-effective-time.md)
- [legal/related-party-and-conflict-policy.md](./legal/related-party-and-conflict-policy.md)
