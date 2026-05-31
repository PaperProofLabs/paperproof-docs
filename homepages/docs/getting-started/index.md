# Getting Started

Docs Path: `getting-started`

Artifact Code: PaperProof-generic_file-001144-d8fa60402ace
Series ID: 0xd8fa60402ace853407db6703b6c5ecc43520ad6577bf8d804ca4e94c3d0686b8
Comments Tree: locked

PaperProof is a Sui-native protocol for durable digital artifacts backed by
Walrus storage. It turns stored content into verifiable, versioned,
discussable, and agent-readable knowledge objects.

The easiest way to understand PaperProof is to separate three ideas:

1. Walrus stores large content such as PDFs, datasets, software archives, and
   long-form text.
2. Sui stores compact protocol state such as artifact identity, typed versions,
   ownership, official interactions, governance state, and events.
3. Applications, SDKs, indexers, and agents read those shared protocol facts
   without depending on one private application database.

Start with the introduction, then use the quick start to explore the official
application. The final article in this section explains why both Sui and Walrus
are structural parts of the protocol.

PaperProof is already deployed on Sui mainnet. The official website is the
first protocol client, but it is not the protocol itself. A third-party
frontend, indexer, wallet tool, agent, or script can read the same objects and
events. This separation matters because durable public records should not
depend on the continued operation of one application database.

The simplest mental model is:

```text
ArtifactSeries = stable identity
VersionRecord  = immutable revision
Walrus blob    = durable content package
CommentsTree   = official discussion
LikesBook      = lightweight participant signal
```

PaperProof records publication facts and protocol relationships. It does not
automatically prove that a claim is true, a file is safe, or a work is
endorsed. The value is an inspectable evidence trail.

## In this section

- [Introduction](./introduction.md)
- [Quick Start](./quick-start.md)
- [Why Sui and Walrus](./why-sui-and-walrus.md)
- [Research and Presentation Materials](./research-and-presentation-materials.md)
