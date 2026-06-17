# From Walrus Blob to On-chain Artifact: The PaperProof Publishing Model

Author: PaperProof Labs  
Category: Technical Explanation  
Status: Official Blog Draft  
Suggested Artifact Type: `blog_post`  

Publishing important digital work should not end with a link.

A link can point to a file, but it rarely explains what the work is, which
version is current, who published it, where the discussion belongs, how the
content hash is checked, or how another application should index it. A storage
blob can preserve bytes, but it does not by itself create a full knowledge
object.

PaperProof builds the missing layer between stored content and usable
protocol-level identity.

In PaperProof, content can live in Walrus while artifact identity, version
lineage, official interactions, governance-aware metadata, and events live on
Sui. The result is a publishing model that is durable enough for serious
records and practical enough for web applications.

This is the central application value of PaperProof: it turns decentralized
storage from a place to put bytes into a complete artifact system. A blob can
become a paper, a report, a dataset, a software release note, a blog post, a
forum topic, a prompt package, or an agent output with version history and
official interaction state.

This post explains the model from the bottom up.

## The basic separation

PaperProof separates content storage from protocol state.

Walrus stores the bytes: Markdown packages, PDFs, datasets, technical reports,
images, release archives, generic files, and other payloads.

Sui records the protocol facts: artifact series, version objects, content
hashes, Walrus blob references, typed metadata, official comments trees,
official likes books, ownership, status, fee policy, governance objects, and
canonical events.

This separation gives each layer a clear job:

| Layer | Responsibility |
|---|---|
| Walrus | Store content bytes |
| Sui | Record artifact identity, version state, references, and events |
| SDKs | Help applications publish, read, validate, and parse records |
| Indexer | Turn events into queryable views |
| App | Render artifacts and guide users |

The model avoids two extremes. It does not put large files directly on chain,
and it does not reduce publishing to an unstructured storage pointer.

For Sui, this means PaperProof uses the chain for what Sui is good at:
structured objects, ownership, shared state, events, and programmable rules.
For Walrus, this means stored blobs gain a higher-level application context:
they are no longer isolated payloads, but content records linked to artifact
identity and version state.

## Why a blob is not enough

A Walrus blob is valuable, but by itself it answers only part of the problem.

It can tell us where bytes are stored. It does not automatically tell us:

- whether the blob is part of a continuing work;
- which version of the work it represents;
- which content type it should be rendered as;
- whether there is a newer version;
- which official comment tree belongs to it;
- who owns or controls the artifact series;
- what event history produced it;
- whether an app is reading an official package or a look-alike record.

PaperProof adds these missing relationships.

A blob becomes part of a PaperProof artifact when it is referenced by a typed
version record under an artifact series. The version records content metadata,
hashes, Walrus references, timestamps, and typed fields. The series tracks the
current version and official interaction objects.

That extra structure is what makes the blob useful to applications and agents.
A frontend can render it correctly. An indexer can classify it. A forum can
attach replies. A Copilot can cite it. A user can compare versions. A third
party can verify that the content it downloaded is the content the protocol
committed to.

## Artifact series: the durable identity

The central object is the artifact series.

An artifact series represents the continuing work. It remains stable while
versions are added. A paper may receive corrections. A dataset may receive a
new snapshot. A software release record may be updated with a new changelog. A
blog post may receive a revised edition. The series is the durable identity
that ties those versions together.

This distinction matters because users and applications often need both:

- "show me the current version";
- "show me exactly what version existed earlier";
- "show me the history of changes";
- "show me the comments for the work as a whole";
- "show me the official artifact code."

PaperProof makes those queries possible because the series and versions are
separate protocol concepts.

This maps naturally onto Sui's object model. The series is a durable object.
Versions are separate records. Interaction objects are bound by ID. Events
announce changes. Ownership and governance rules define who can update which
state. Instead of flattening a work into one database row, PaperProof models it
as a public object graph.

## Why Sui's object graph matters

PaperProof benefits from Sui because the protocol is relationship-heavy.

An artifact is not only a balance transfer or a single NFT-like record. It is a
set of linked objects:

- a root and registry defining the official protocol context;
- a type index defining enabled artifact families;
- an artifact series defining the continuing work;
- version records defining immutable revisions;
- a comments tree defining official discussion;
- a likes book defining official feedback;
- governance and fee objects defining protocol policy;
- prompt and memory registries defining agent-related capabilities.

Sui lets these be represented as explicit objects with events and access
rules. That gives PaperProof a strong foundation for SDK validation, indexer
replay, and app-level trust boundaries.

## Why Walrus availability matters

PaperProof also benefits from Walrus because artifact content is often too
large, too varied, and too media-rich to live directly on chain.

Docs, blog packages, PDFs, datasets, images, diagrams, software archives,
prompt packages, and future agent reports should be stored as content blobs.
Walrus provides the storage layer, while PaperProof records how those blobs are
used. The app does not have to trust a random URL alone; it can resolve a
PaperProof version, download the associated Walrus content, and compare it
against the committed hash or reference.

This gives Walrus a natural application layer. PaperProof helps turn blob
storage into verifiable publishing, discussion, and agent-readable knowledge.

## Typed versions

Not every artifact is the same kind of work.

A preprint has authors, abstract, field, license, and paper-specific metadata.
A dataset may have format, schema, and data-specific description. A software
release may record source hash, package hash, repository, and changelog. A
blog post may include title, summary, author, tags, language, Markdown body,
and asset package information.

PaperProof supports typed artifact families while preserving a common
protocol backbone. Applications can render different types appropriately, but
indexers and SDKs still benefit from shared concepts:

- series ID;
- version ID;
- artifact code;
- content hash;
- Walrus blob ID;
- Walrus blob object ID;
- content type;
- owner;
- status;
- timestamp;
- official comments tree;
- official likes book;
- canonical events.

This is what lets PaperProof support research, software, official project
writing, community discussion, and generic files without inventing a separate
protocol for every content type.

## Official comments and likes

Publishing is not only storage. Knowledge needs discussion.

When a PaperProof artifact is first published, the protocol can create official
interaction objects: a comments tree and a likes book. The artifact series
records these object IDs. Clients and indexers can validate the binding before
presenting a discussion or feedback count as official.

This is a subtle but important design choice. Anyone can create a discussion
somewhere on the internet. That does not mean it is the official discussion
for a specific artifact. PaperProof gives applications a way to know which
comment tree is actually bound to the series.

Different surfaces can use this differently:

- Docs may show no public comments or use locked trees.
- Blog posts can show the official discussion thread.
- Forum topics can use the comments tree as replies.
- Research artifacts can support review notes or community questions.

The protocol provides the binding. The interface decides the experience.

## Version updates

Updating a PaperProof artifact should not erase history.

When a new version is added, the series can point to the latest version while
older version objects remain available. This supports both normal user
experience and auditability.

A reader usually wants the latest version. A reviewer may need a specific
historical version. An AI agent may need to say which version it used when
answering. An indexer may need to replay events to reconstruct state.

PaperProof's version model keeps those needs aligned.

## Content hash and verification

Content references are only useful if applications can check what they
download.

PaperProof versions can include content hashes and Walrus references. When an
app downloads a body from Walrus, it can compare bytes against the committed
hash. This helps detect accidental mismatch, stale content, or incorrect
references.

For ordinary users, this can remain mostly invisible. The app can show a short
hash or verification indicator. For experts, the full hash, blob ID, object ID,
series ID, and version ID are available for inspection.

This layered visibility is important. A serious protocol should expose
evidence without forcing every user to read raw object IDs all day.

## Canonical events and indexers

On-chain objects are essential, but applications also need fast queries.

PaperProof emits events that indexers can consume. The reference Rust indexer
scans canonical PaperProof event streams, writes accepted and rejected events,
tracks cursors, and can persist data to JSONL, SQLite, or PostgreSQL. It can
also use Sui checkpoint ingestion for production-style backfills.

The indexer does not blindly trust any event that looks similar. It uses
official deployment metadata and canonical filtering to reject look-alike
package events. This is important for a public protocol. Event names alone are
not identity. Official package IDs, object relationships, and deployment
manifests matter.

Indexed views can power:

- Explore pages;
- artifact detail pages;
- Blog lists;
- Forum category pages;
- analytics;
- governance dashboards;
- airdrop calculations;
- developer APIs;
- agent-readable context.

Raw protocol records remain the foundation. Indexers make them fast and
convenient.

This is important for real adoption. Ordinary users expect fast lists, search,
pagination, statistics, and activity feeds. Expert users expect evidence and
replayability. PaperProof's indexer model is designed to serve both: fast
database-backed views built from canonical Sui events.

## The publishing flow

At a high level, a PaperProof publishing flow looks like this:

1. Prepare the content locally.
2. Compute or provide a content hash.
3. Store the content in Walrus.
4. Collect Walrus blob references.
5. Build a typed PaperProof publication transaction.
6. Sign through the user's Sui wallet.
7. Create the artifact series, first version, and official interaction objects.
8. Later, add new versions through version transactions.
9. Let indexers and apps discover the events.

For users, the official app should hide unnecessary complexity. For builders,
the SDKs expose the components needed to implement custom flows.

## Why not just use a normal database?

A normal database is useful for application state, but it is not enough for
shared public knowledge infrastructure.

If one website stores a blog post, another app cannot automatically treat that
database row as a durable public artifact. If the website disappears, the
record may disappear. If the data changes, history may not be preserved. If
comments are stored in a private database, independent clients cannot validate
the official thread.

PaperProof does not eliminate databases. It gives databases better source
material. An indexer database can be rebuilt from protocol events. A website
can cache data for speed. But the artifact identity and version commitments
live in the protocol.

## Why not just use decentralized storage?

Decentralized storage is necessary, but it is not sufficient.

Storage gives bytes a place to live. Publishing needs meaning around those
bytes. It needs a model for versions, ownership, official interactions,
content types, governance, events, and application discovery.

PaperProof uses Walrus because content storage should be robust. It uses Sui
because artifact relationships and state transitions need a programmable
object layer.

The combination is the product.

## Blog, Docs, and Forum as examples

The official PaperProof website demonstrates the model.

Docs can be generic-file artifacts whose Markdown bodies are loaded lazily from
Walrus. Each page maps to a series ID. Updates can publish new versions without
changing the user's mental model.

Blog posts can use the `blog_post` artifact type. A post can have a title,
summary, author, tags, Markdown body, assets, official comments, and version
history.

Forum topics can also be artifacts. The topic body is the artifact content.
The official comments tree becomes the reply structure.

This turns the website from a static brochure into a protocol-backed
application. The interface remains familiar. The underlying records become
verifiable.

The same pattern can extend to many applications: a research portal can publish
papers and datasets; a security team can publish audit reports and remediation
updates; a DAO can publish proposals and milestone evidence; an AI platform can
publish prompts, memory descriptors, and agent output reports. Each app can
have its own interface while sharing the same artifact mechanics.

## What developers get

Developers can build on PaperProof through SDKs and indexer outputs.

The TypeScript SDK supports browser and app integration. The Rust SDK supports
indexers, services, and backend tools. The Python SDK supports scripting,
research workflows, and automation. The reference indexer shows how to turn
events into persistent data.

This matters because a protocol should not require every developer to manually
assemble transaction blocks and parse raw events. PaperProof's SDKs are part of
the infrastructure, not an afterthought.

## What users get

Users get a familiar publishing experience with stronger records behind it.

They can see an artifact code. They can inspect versions. They can update a
work without erasing history. They can participate in official comments. They
can use Copilot to understand the protocol. They can rely on the app for a
simple interface while knowing deeper evidence exists.

That is the right balance for mainstream adoption. Most users do not want to
live inside block explorers. But they benefit when applications are built on
records that block explorers, SDKs, and indexers can verify.

## Closing

A Walrus blob stores bytes. A PaperProof artifact gives those bytes durable
knowledge identity.

The publishing model is deliberately layered: Walrus for content, Sui for
state, SDKs for integration, indexers for queryability, and the app for user
experience. This lets PaperProof support serious digital work without forcing
every piece of content into one rigid platform.

From research papers to software releases, from Docs to Blog, from Forum topics
to agent prompts, the same principle applies:

important digital work should be stored, versioned, discussed, indexed, and
verified as an artifact.

That is what PaperProof is built to make possible.
