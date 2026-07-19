# Getting Started

Docs Path: `getting-started`

Artifact Code: PaperProof-generic_file-001144-d8fa60402ace
Series ID: 0xd8fa60402ace853407db6703b6c5ecc43520ad6577bf8d804ca4e94c3d0686b8
Comments Tree: locked

![PaperProof ecosystem position in the Sui and Walrus stack](assets/ecosystem-stack.png)

PaperProof is a Sui-native protocol for durable digital artifacts backed by
Walrus storage. It gives important works a stable protocol identity, version
history, official interaction surfaces, and machine-readable evidence that can
outlive any single website.

The fastest way to understand PaperProof is to separate five layers:

1. `Sui` stores compact shared state such as artifact identity, version links,
   official bindings, governance state, and canonical events.
2. `Walrus` stores large content packages such as PDFs, datasets, software
   archives, and long-form markdown.
3. `PaperProof Protocol` binds those two layers into durable artifact series,
   immutable versions, official comments, official likes, and verifiable
   content references.
4. `SDKs, indexers, and skills` make those protocol objects easy to publish,
   read, verify, and integrate into other products.
5. `Applications` such as docs, blogs, forums, research portals, release
   surfaces, and agent workflows can all build on the same public artifact
   layer.

This means PaperProof is not just a website. The official website is an early
client of the protocol, but the protocol can also support third-party
frontends, independent indexers, wallet tools, scripts, research platforms,
and agent-native products.

## What problem PaperProof solves

Important works often get split across unstable surfaces:

- the file lives in one storage system;
- the discussion lives on another website;
- the latest version lives in an app database;
- the public link depends on one operator staying online;
- agents and integrators have no canonical way to verify what is official.

PaperProof adds a protocol layer under those surfaces so that the work itself
has continuity even when interfaces change.

## The simplest mental model

```text
ArtifactSeries = stable identity for one continuing work
VersionRecord  = one immutable revision in that series
Walrus blob    = durable content package
CommentsTree   = official discussion bound to the series
LikesBook      = lightweight official signal bound to the series
```

## What PaperProof is good for

PaperProof is especially useful when a work has value beyond one moment in a
feed:

- papers, preprints, and technical reports;
- official docs and versioned knowledge bases;
- software releases and package records;
- dataset snapshots and research artifacts;
- long-lived forum topics, public statements, and agent-readable prompts.

## What PaperProof does not claim

PaperProof records publication facts and protocol relationships. It does not
automatically prove that a claim is true, a file is safe, or a work is
endorsed. The value is an inspectable, verifiable evidence trail.

## In this section

- [PaperProof Forwarding Brief](./paperproof-forwarding-brief.md)
- [Introduction](./introduction.md)
- [Quick Start](./quick-start.md)
- [Why Sui and Walrus](./why-sui-and-walrus.md)
- [Research and Presentation Materials](./research-and-presentation-materials.md)
- [Licenses and Reuse](./licenses-and-reuse.md)
