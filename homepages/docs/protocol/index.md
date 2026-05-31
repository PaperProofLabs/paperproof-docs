# Protocol

Docs Path: `protocol`

Artifact Code: PaperProof-generic_file-001144-22d38471b17f
Series ID: 0x22d38471b17fad0cdc55b563de71baffb480b7641a7a7098dab88c9dcb775b2f
Comments Tree: locked

The PaperProof protocol records durable facts around digital artifacts. It does
not attempt to replace every platform, review process, or community workflow
that surrounds an artifact.

The protocol core is intentionally compact:

- Sui objects define artifact identity and official state.
- Walrus carries large content.
- Events expose state transitions for applications and indexers.
- Manifests bind clients to the active official deployment.
- SDKs encode common integration rules.

The deployed protocol is deliberately broader than one publishing website.
Each stable artifact series can become a shared coordinate for citations,
discussion, software release evidence, dataset history, public commitments,
agent-generated reports, and third-party products.

## Core object families

| Layer | Important objects |
|---|---|
| Publishing | `PaperProofRoot`, `TypeRegistry`, `ArtifactSeries`, typed version records |
| Interaction | `CommentsTree`, `LikesBook` |
| Governance | `GovernanceVault`, `FeeManager`, `GovernanceConfig`, `Proposal` |
| Copilot | `PromptRegistry`, `MemoryRegistry`, `MemoryEntry` |

A familiar Move type or event name is not enough to establish official status.
Clients should validate the active deployment, canonical root, and object
relationships before deriving trusted views.

## In this section

- [Artifact Model](./artifact-model.md)
- [Content and Versioning](./content-and-versioning.md)
- [Comments and Likes](./comments-and-likes.md)
- [Manifests and Canonical State](./manifests-and-canonical-state.md)
