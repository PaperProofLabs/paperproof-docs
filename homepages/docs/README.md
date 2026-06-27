# PaperProof Docs Content Tree

This directory contains the source Markdown documents for the official
PaperProof Docs homepage.

## Publishing model

Each first-level Docs section has an `index.md` overview document. Each
second-level Docs entry has its own Markdown document. Every document is
intended to be published as an independent PaperProof artifact series so that
it can be versioned, verified, and curated by the official Docs manifest.

Docs articles should normally use an archived or locked official comments tree.
They remain PaperProof artifacts, but the official website should not show a
comment composer for Docs content.

## Navigation tree

| First-level section | Overview artifact | Second-level documents |
|---|---|---|
| Getting Started | `getting-started/index.md` | Introduction, Quick Start, Why Sui and Walrus, Research and Presentation Materials |
| Protocol | `protocol/index.md` | Artifact Model, Content and Versioning, Comments and Likes, Manifests and Canonical State |
| Developers | `developers/index.md` | TypeScript SDK, Python SDK, Rust SDK, PaperProof Skill, Indexer Integration |
| Copilot | `copilot/index.md` | Native Prompts, Agent Memory, Memory Privacy and Access |
| Governance and Economics | `governance-and-economics/index.md` | Governance, PPRF Utility, Fees and Sustainability |
| Competitive Analysis | `positioning-and-competitive-landscape/index.md` | Ecosystem Position, Web3 Counterparts, Web2 Counterparts, Structural Advantages |
| Safety and Operations | `safety-and-operations/index.md` | User Safety, Interface Policy, Mainnet and Upgrades, Formal Verification, FAQ |

## Artifact mapping convention

Every published Markdown file is mapped through `manifest.json` with:

```text
Artifact Code: PaperProof-...
Series ID: 0x...
Current Version ID: 0x...
Latest Content Hash: sha256:...
Comments Tree: archived-or-locked
```

The website manifest may then map its stable Docs route to the published series.
The manifest controls official navigation and curation. The PaperProof artifact
series and its Walrus-backed versions remain the content source of truth.
Content updates should append a new version to the existing series, then refresh
the manifest metadata used by the static site fallback.
