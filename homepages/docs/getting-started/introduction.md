# Introduction to PaperProof

Docs Path: `getting-started/introduction`

Artifact Code: PaperProof-generic_file-001144-c86c5f43d31b
Series ID: 0xc86c5f43d31ba62f97dac4e056c1e25d7d42fc675262357c06a9cae9c633f55a
Comments Tree: locked

Important digital works increasingly live across unstable boundaries: storage
links, repository releases, social posts, preprint pages, datasets, software
packages, and application databases. These surfaces are useful, but none of
them alone gives the work itself a durable protocol identity.

PaperProof addresses this missing layer. A PaperProof artifact is not merely an
uploaded file or a page in one application. It is a continuing protocol object
with typed versions, Walrus content references, official comments, official
likes, ownership, status, timestamps, and canonical events.

## Protocol, not just platform

PaperProof should be understood as an artifact protocol, not merely as a
content site.

- `Walrus` stores large content packages.
- `Sui` stores compact shared protocol state.
- `PaperProof` defines how artifacts, versions, official interactions, and
  governance-visible relationships fit together.
- `Applications, SDKs, indexers, and agents` read those shared facts in
  different ways.

That separation matters because high-value works should not depend on one
private application database to remain understandable, verifiable, and
referenceable.

## What PaperProof adds

PaperProof adds a durable coordinate system around content:

- a stable artifact series identity;
- append-only version history;
- typed metadata for different artifact families;
- verifiable Walrus content references;
- official comments and likes bound to the series;
- governance-aware protocol parameters;
- SDKs and indexer surfaces for independent integrations;
- protocol-native prompts and wallet-linked Copilot memory capabilities.

## Why this is different from ordinary content platforms

Most publishing platforms start from the page, the feed, or the profile.
PaperProof starts from the artifact itself.

That changes the center of gravity:

- the core unit is a continuing work, not a disposable post;
- the version history is protocol-native, not a convenience feature;
- official discussion and lightweight signals are bound to the artifact;
- indexers and agents can validate what is official without trusting one
  frontend to tell them.

## What PaperProof does not claim

PaperProof records commitments and protocol relationships. It does not prove
that a paper is correct, a dataset is lawful, a release is secure, or a blog
post is endorsed. Applications and communities still need judgment,
moderation, review, and policy.

## One protocol, many entry points

The official website is a reference application, not the only entrance.
Independent frontends, wallets, explorers, dashboards, scripts, academic tools,
indexers, and agents can use the same public protocol objects.

## How the official application fits in

![PaperProof application architecture and flow](assets/application-architecture-flow.png)

The official website is one client in a broader system:

- users or agents initiate publication and reading workflows;
- SDKs prepare hashes, packages, reads, and transactions;
- Walrus stores the durable content package;
- Sui stores the canonical protocol relationships and events;
- indexers and APIs accelerate reads, but they are not the trust root.

## A continuing work, not a disposable page

When an artifact is published, PaperProof creates an `ArtifactSeries`. The
series remains stable while revisions accumulate. Each revision is a separate
typed, immutable version record with content references, a hash, an author,
timestamps, and a pointer to the previous version. Readers can distinguish the
current revision from the historical record without losing either.

This model is useful beyond academic papers. The same primitives can support
technical specifications, audit reports, public statements, software release
records, dataset snapshots, model cards, agent-generated reports, and long-form
posts. Applications decide how to render each family, while the protocol
preserves the common evidence layer.

## Why official bindings matter

PaperProof does not ask applications to guess which discussion belongs to a
work. First publication creates one official `CommentsTree` and one official
`LikesBook`, both bound to the series. The series records those object IDs.
Indexers and interfaces can validate the binding before presenting a thread or
count as official.

The same philosophy appears throughout the protocol:

- `PaperProofRoot` binds the official registry, fee manager, and governance
  vault.
- `PromptRegistry` binds an app route to an official prompt artifact series.
- `MemoryRegistry` binds Copilot memory discovery to governed provider policy
  without storing private memory bodies.

## Protocol evidence is not endorsement

On-chain objects and events show that an action occurred. They do not
automatically establish authorship rights, legality, correctness, peer review,
investment value, or PaperProof Labs endorsement. Official interfaces may
hide, label, de-rank, delist, or stop previewing content for safety, abuse,
copyright, privacy, fraud, malware, spam, or policy reasons. Independent
interfaces remain free to interpret public protocol facts under their own
policies.

## Early product surfaces

The official Docs, Blog, and Forum are intended to become early users of the
protocol itself. Docs articles can be published as versioned artifacts with
locked or archived discussion. Blog posts can use `blog_post` artifacts with
open comments. Forum topics can use the same artifact family while treating
the official comment tree as the discussion thread.
