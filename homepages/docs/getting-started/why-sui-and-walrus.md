# Why Sui and Walrus

Docs Path: `getting-started/why-sui-and-walrus`

Artifact Code: PaperProof-generic_file-001144-25087190c45a
Series ID: 0x25087190c45af2f04df9a0a67e7f8b435293d322b6e2dfafaa28d70814a76042
Comments Tree: locked

PaperProof uses Sui and Walrus because the protocol needs both programmable
object state and durable large-content storage.

## What Sui contributes

Sui provides object-centric protocol state. PaperProof models artifacts,
versions, comments trees, likes books, governance vaults, proposals, registries,
and memory capability entries as explicit objects with relationships.

Sui Programmable Transaction Blocks also let applications compose compatible
Move calls into one user-signable workflow. This reduces signature burden while
preserving wallet approval.

## What Walrus contributes

Walrus stores large content that should not become Sui object bytes: PDFs,
datasets, source archives, software packages, images, long comments, prompt
packages, and static sites.

PaperProof records commitments and references to that content so applications
can retrieve and verify it.

## Why the combination matters

Without Sui, artifact identity and lineage would fall back to application
database conventions. Without Walrus, PaperProof would become a thin link
registry or a conventional hosted website with chain receipts.

Together they make it possible to turn Walrus blobs into verifiable,
versioned, discussable, and agent-readable knowledge artifacts.

## Explicit object relationships

Sui lets PaperProof express relationships as state rather than application
conventions. An `ArtifactSeries` records its current version, official comments
tree, and official likes book. The canonical root records its type registry,
fee manager, and governance vault. Copilot registries bind to the same
ecosystem authority boundary.

This makes validation practical. An indexer can reject a foreign comments tree
even if it has a familiar event name. A frontend can check that a registry
belongs to the official root. A deployment manifest can be verified against
live object bindings rather than trusted as an unexplained list of addresses.

## Storage and verification path

The normal content read path is:

1. Read the canonical series and version record from Sui.
2. Extract the declared content hash and Walrus blob reference.
3. Retrieve the bytes from a Walrus-compatible endpoint.
4. Verify the bytes against the recorded hash.
5. Render or process the declared content type.

The chain record remains useful even if a content gateway is temporarily
unavailable. A careful interface shows the identity and the failed preview
state separately.

## Concurrency and composability

Sui object separation also reduces avoidable contention. Likes and comments use
different shared objects. Copilot memory registrations create separate shared
`MemoryEntry` objects. Programmable Transaction Blocks let applications compose
compatible calls into a single wallet-approved transaction where the protocol
workflow allows it.

## Operational consequence

Applications must degrade honestly across independent services. A static site
may still read chain state when an indexer is unavailable. Ordinary Copilot may
still work when a MemWal relayer lacks browser CORS support. A Walrus preview
failure should not be displayed as a missing artifact. PaperProof uses multiple
layers deliberately, so clients should preserve the difference between a
verified empty result and an incomplete read.
