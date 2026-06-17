# PaperProof: Verifiable Knowledge Infrastructure for the Agentic Web

Author: PaperProof Labs  
Category: Protocol Vision  
Status: Official Blog Draft  
Suggested Artifact Type: `blog_post`  

Digital knowledge is becoming more powerful, more automated, and more fragile
at the same time.

Research papers move through preprint servers, PDFs, datasets, repositories,
social announcements, discussion threads, model-generated summaries, and
application-specific databases. Software releases are published through source
control, package registries, audit reports, changelogs, and community posts.
AI agents increasingly read, summarize, remember, recommend, and act on these
materials. Yet the internet still lacks a common evidence layer for answering
basic questions:

- What exactly is this work?
- Which version am I looking at?
- Where is the content stored?
- Which discussion belongs to this artifact?
- Which metadata was committed on chain?
- Which prompt or memory configuration guided an agent?
- Can another application verify the same record without trusting this
  website?

PaperProof is our answer to that missing layer. It is a protocol for
verifiable knowledge artifacts, built on Sui and Walrus, with SDKs, a reference
indexer, official documentation, a static web application, protocol-native
Copilot prompts, and wallet-linked agent memory.

The immediate application is concrete: publish a work, keep its identity stable,
add new versions, store the content on Walrus, record the artifact relationship
on Sui, attach official discussion and feedback objects, and let humans or
agents resolve the same record later. The longer-term potential is broader:
PaperProof can become a shared knowledge layer for research outputs, software
release evidence, DAO records, public technical reports, community discussions,
agent prompts, memory descriptors, and agent-generated work products.

PaperProof does not try to replace every publishing platform, research
platform, forum, repository, or AI interface. Instead, it provides a durable
coordinate system around digital works so that independent applications can
refer to the same artifact, inspect its versions, resolve its content, validate
its official interaction objects, and reason about its history.

## The problem: content is everywhere, identity is weak

Modern digital work rarely lives in one place.

A serious technical artifact may include a PDF, a Markdown document, source
code, diagrams, datasets, release files, screenshots, comments, votes, and
follow-up revisions. A project may announce one version on social media, revise
another version in a repository, store files in a decentralized network, and
discuss corrections in a community channel.

This is useful, but it also creates uncertainty. Links rot. Copies drift.
Comments become detached from the work they discuss. AI systems may summarize
outdated versions. Users may not know whether a page is official, mirrored,
deprecated, or manipulated.

For human readers, that uncertainty is inconvenient. For AI agents, it is a
structural problem. Agents need stable references, version boundaries, content
hashes, and trustworthy context windows. Without those, automation scales
confusion as easily as it scales productivity.

PaperProof begins from a simple premise: knowledge objects should have durable
protocol identity.

## What a PaperProof artifact is

A PaperProof artifact is not just an uploaded file. It is a continuing series
with an on-chain identity and typed versions.

The series gives the work a stable handle. Each version records immutable
metadata, content references, hashes, creator information, timestamps, and
links to prior versions. Walrus stores the content bytes. Sui records the
artifact structure, version lineage, official interaction bindings, and
governance-aware protocol state.

This model lets applications distinguish between:

- the artifact as an ongoing work;
- the latest version selected by the protocol state;
- older versions that remain part of the record;
- content bytes stored in Walrus;
- metadata and references committed on Sui;
- discussion and feedback objects officially bound to the artifact.

That distinction matters. A reader may want the latest version. A reviewer may
need the exact version cited in a dispute. An indexer may need canonical
events. An AI agent may need the active version while preserving the ability to
explain how it was resolved.

## Why Sui and Walrus fit this model

Sui gives PaperProof an object-centric execution environment. Artifact series,
typed version records, comment trees, likes books, governance vaults, type
registries, fee managers, prompt registries, and memory registries can be
modeled as explicit objects with ownership, shared access, events, and upgrade
discipline.

This object model is especially well suited to PaperProof because knowledge
artifacts are not merely token balances. They are structured objects with
relationships: a series points to versions, a version points to content
references, a series binds an official comment tree and likes book, a registry
binds artifact types, and governance objects define which changes are official.
Sui's object-centric design makes these relationships natural to model and
natural for SDKs and indexers to validate.

Sui also gives PaperProof a strong event layer. Publishing, adding versions,
creating comment trees, changing status, transferring ownership, and updating
governance-aware registries can emit canonical events. The reference indexer
can scan these events, reject look-alike package noise, and materialize query
views for websites, dashboards, agents, and analytics services.

Walrus gives PaperProof decentralized storage for the content itself. The
protocol does not need to force large documents, Markdown packages, PDFs,
datasets, or media files into chain state. Instead, Sui records verifiable
references and hashes, while Walrus carries the content payload.

Walrus is valuable here because PaperProof needs more than a database row and
more than a short-lived web URL. Large content should be stored in a
decentralized storage layer designed for blob availability, while the chain
records which blob belongs to which artifact version and which hash the app
expects. This lets a frontend, indexer, or agent download content from Walrus
and compare it with the committed PaperProof reference.

Together, they allow a clean separation:

- Sui records identity, state, relationships, versions, and events.
- Walrus stores the content bytes.
- SDKs and indexers turn those records into usable application data.
- Interfaces decide how to render the artifacts for humans and agents.

This separation is one reason PaperProof can support many artifact families:
preprints, technical reports, datasets, software releases, blog posts, forum
topics, generic files, prompts, and future agent-native records.

It is also why PaperProof is aligned with both ecosystems. It gives Sui a
serious object-graph application beyond financial transfers, and it gives
Walrus a high-value content layer where stored blobs become part of versioned,
discoverable, and agent-readable artifacts.

## Application surfaces PaperProof can unlock

PaperProof is not limited to one publication format. The same protocol model
can support several high-value surfaces:

- Research and technical publishing: preprints, whitepapers, yellowpapers,
  academic notes, datasets, and reproducibility packages.
- Open-source and security records: software releases, source hashes, package
  hashes, audit reports, incident reports, and changelogs.
- DAO and ecosystem records: governance references, proposal attachments,
  public statements, grant reports, and milestone evidence.
- Official project content: Docs, Blog, Forum topics, release notes, prompt
  packages, and curated manifests.
- Agentic web infrastructure: verifiable prompts, memory descriptors,
  agent-generated research notes, task reports, and collaborative knowledge
  trails.

The common value is continuity. PaperProof gives each work a durable identity,
lets the work evolve through versions, and keeps the evidence readable by
humans, applications, and agents.

## The agentic web needs verifiable context

The next internet will not be read only by people. It will be read by agents.

Agents will browse documentation, answer questions, summarize discussions,
prepare submissions, check citations, compare versions, remember user
preferences, and recommend next actions. That future requires more than
chatboxes. It requires verifiable context.

PaperProof approaches this at two levels.

First, public knowledge artifacts are made versioned and inspectable. An agent
can refer to a PaperProof artifact series, resolve the latest version, inspect
the content hash, load the Walrus content, and understand the official comments
or likes associated with the work.

Second, the official PaperProof app treats Copilot prompts and memory as
protocol-aware capabilities. Official prompts can be stored as PaperProof
artifacts, registered by route, versioned over time, and loaded by the app
instead of being hidden as untracked frontend constants. Agent memory is
wallet-linked and app-scoped. The registry records governed discovery metadata,
while private memory content remains in MemWal.

This is a practical design choice. The goal is not to put private memory text
on chain. The goal is to make the official capability discoverable,
governable, and bounded, while keeping private context in the memory layer.

This is where PaperProof connects directly to the idea of the agentic web.
Agents need more than raw text. They need durable object references, version
resolution, content verification, official prompts, scoped memory, and
application policies. PaperProof turns those pieces into protocol surfaces
rather than leaving them as invisible website internals.

## Protocol-native prompts

Prompts are becoming part of application logic. They guide how agents answer,
what they emphasize, which safety boundaries they follow, and how they explain
protocol concepts to users.

If prompts matter, they should be versioned.

PaperProof's native prompt registry lets the official app bind a route or
capability to a prompt artifact series. The app can resolve the latest official
version, download the prompt package, validate it, and inject it into Copilot.
Later updates can publish a new artifact version and update the registry
without requiring users to trust an invisible code change.

For ordinary users, this means Copilot can improve over time. For developers
and auditors, it means prompt changes can become part of the evidence trail.
For the broader ecosystem, it shows how agent behavior can be made more
inspectable without freezing innovation.

## Wallet-linked agent memory

Agent memory should be useful, but it must not become a careless privacy leak.

PaperProof's Agent Memory design separates layers:

- the browser controls whether memory is enabled locally;
- MemWal stores private memory content;
- Sui records the official memory capability registration and availability;
- the official app enforces one active memory entry per wallet and app;
- deleting the registry entry tombstones the chain-side entry without deleting
  external Walrus or MemWal data.

The intended memory content is modest: preferred language, answer style,
recent focus topics, and ongoing task summaries. These are valuable enough to
make Copilot feel continuous, but bounded enough to avoid pretending that the
system is a full personal data vault.

This design is especially important for the agentic web. Agents need continuity
to be helpful. Users need control to feel safe. Protocols need explicit
registries so official capabilities can be discovered, disabled, updated, or
audited.

## Official interactions, not arbitrary attachments

A common weakness in content systems is that discussions and reactions are
loosely attached. A random forum thread, mirror page, or third-party comment
section may claim to belong to a work, but applications have to guess whether
that attachment is official.

PaperProof avoids this ambiguity by binding official interaction objects to
artifact series. First publication creates official comments and likes objects.
The series records those relationships. Indexers and clients can validate the
binding before presenting a comment tree or likes count as official.

This does not prevent third-party interfaces from creating their own
discussion layers. It simply lets official clients preserve the difference
between protocol-bound interactions and external commentary.

## The role of governance

PaperProof uses governance-aware controls where they are useful, without making
every feature heavy.

The core protocol includes governance objects for parameter changes, fee
configuration, upgrade discipline, and official authority boundaries. The
prompt registry and memory registry follow a similar management philosophy:
they are lightweight, but not arbitrary. Official state changes should be made
by the expected authority path rather than by any address that discovers a
public function.

This is not governance theater. It is operational hygiene. A public protocol
needs a way to distinguish official registry state from look-alike objects and
unauthorized writes.

## For ordinary users

For ordinary users, PaperProof should feel simple:

- publish a work;
- see a stable artifact identity;
- add a new version when the work changes;
- read official Docs, Blog, and Forum content;
- use Copilot to understand the protocol;
- optionally enable wallet-linked memory;
- inspect provenance when needed.

Users do not need to think about every object, package, indexer, or registry.
The official app should make the happy path legible while leaving the evidence
available for those who want to inspect it.

## For Web3 users

For Web3 users, PaperProof demonstrates a pattern that goes beyond tokenized
content.

The value is not merely that something is "on chain." The value is that the
chain records the right things: identity, version lineage, content references,
official interaction bindings, governance-controlled registries, and canonical
events. Walrus handles the content storage. SDKs and indexers make the system
usable.

This is the kind of infrastructure that can support more serious applications
than one-off uploads: research archives, open-source release records, public
technical reports, grant documentation, governance references, AI-readable
knowledge bases, and agent collaboration logs.

## For experts and builders

For developers, PaperProof is intentionally not only a website. It includes:

- Move contracts deployed on Sui mainnet;
- TypeScript, Rust, and Python SDK surfaces;
- a reference indexer with JSONL, SQLite, and PostgreSQL support;
- canonical event filtering;
- deployment manifests;
- formal-verification-oriented contract work;
- official Docs published as PaperProof artifacts;
- protocol-native prompt and memory registries.

The official app is a reference implementation. The protocol is the shared
surface. Independent applications can build their own interfaces, dashboards,
indexers, bots, or agent systems using the same public records.

## A protocol that uses itself

PaperProof is designed to be self-demonstrating.

The official Docs are intended to be PaperProof artifacts. Official prompts are
PaperProof prompt artifacts. Blog posts can be `blog_post` artifacts. Forum
topics can be artifacts with official comment trees. Agent memory has a
chain-side registry and a private memory layer. The project website is not just
describing a protocol; it is becoming one of the first applications of that
protocol.

This matters because infrastructure becomes credible when it carries real
work. PaperProof's own documentation, prompts, memory capability, Blog, and
Forum are early examples of the same model we expect other applications to use.

## What PaperProof does not claim

PaperProof is an evidence and coordination layer. It does not prove that every
artifact is true, legal, safe, complete, or endorsed by PaperProof Labs.
Quality, legality, moderation, review, reputation, and social trust remain
important.

The protocol records commitments and relationships. Interfaces and communities
interpret them.

That boundary is deliberate. A good knowledge infrastructure should preserve
facts without pretending to replace judgment.

## Closing

The agentic web needs more than faster answers. It needs durable references,
verifiable content, version-aware knowledge, and controlled memory.

PaperProof brings those pieces together: Sui for object identity and protocol
state, Walrus for decentralized content storage, SDKs and indexers for
builders, and a reference application that makes artifacts, prompts, memory,
Docs, Blog, and Forum part of one coherent system.

Our goal is simple to state and hard to build: make important digital knowledge
easier to verify, easier to update, easier to discuss, and easier for agents to
use responsibly.

That is the foundation PaperProof is building for the agentic web.
