# What the Sui and Walrus Stack Still Needs for Durable Knowledge

Author: PaperProof Labs  
Category: Ecosystem Analysis  
Status: Official Blog Draft  
Suggested Artifact Type: `blog_post`  

Sui and Walrus together provide an unusually powerful foundation.

Sui offers object-centric programmable state, shared objects, events,
ownership, and rich coordination logic. Walrus offers decentralized storage for
large payloads and public content. Together, they give builders a foundation
for applications that go well beyond token transfer or generic file hosting.

But a strong foundation is not the same as a complete knowledge layer.

If we care about durable digital knowledge rather than only stored bytes or
isolated application data, the stack still needs additional protocol structure.
That is the gap PaperProof is designed to address.

## Durable knowledge is a stricter requirement than decentralized storage

It is tempting to assume that once content is stored on a decentralized network,
the durability problem is solved.

That is only partly true.

Storage durability answers one question: can the bytes persist?

Durable knowledge requires answers to a broader set of questions:

- What exactly is this object?
- Who published it?
- Which version is current?
- What was published before?
- Which comments and reactions are official?
- Can another client resolve the same artifact?
- Can an indexer reconstruct useful views from public data?
- Can agents read and validate the object model without trusting one website?

Walrus can preserve content bytes. Sui can preserve structured state. But the
stack still needs a domain layer that turns those primitives into reusable
knowledge artifacts.

## The current stack is powerful but still too low-level for artifact semantics

This is not a criticism of Sui or Walrus. It is a statement about abstraction
layers.

Base layers should not be expected to solve every application domain directly.
Sui is not supposed to dictate what a research artifact is. Walrus is not
supposed to define release semantics for a software package or a dataset.

Once teams begin building around knowledge objects, however, the absence of a
shared artifact layer becomes clear.

| Base capability | What it does well | What it does not decide by itself |
|---|---|---|
| Sui objects | Represent ownership, state, rules, and events | What counts as an artifact series or version lifecycle |
| Walrus blobs | Store bytes durably at scale | Whether a blob is canonical, current, discussed, or versioned |
| Generic apps | Render content and attach local workflows | Cross-app artifact identity and shared semantics |

Durable knowledge needs the third column to be resolved by a protocol layer,
not repeatedly improvised by each product team.

## The stack still needs first-class artifact identity

A blob is not yet an artifact.

An object on chain is not yet a paper, report, dataset, or release.

What is missing is first-class artifact identity: a stable, typed unit that can
outlive any individual file, page, or front end.

This identity layer should answer:

- what category of work the object belongs to;
- which series it belongs to;
- which version is latest;
- where the content is stored;
- how the content is verified;
- which interaction objects are official;
- how external applications should refer to it.

PaperProof supplies this layer through artifact types, series, versions,
content commitments, and linked interaction objects.

Without such a layer, ecosystems tend to fall back to ad hoc identifiers,
application-local URLs, or storage pointers that are difficult to interpret
outside the original interface.

## The stack still needs protocol-native versioning

Durable knowledge changes over time. The stack therefore needs a shared way to
express lineage across time.

This requires more than storing several files. It requires a protocol-level
model for artifact series and immutable versions, where external clients can
resolve both current and historical states.

Why this matters is easy to see:

- preprints get revised;
- datasets get corrected;
- software releases get patched;
- reports get expanded;
- official docs improve over time;
- agent-facing instructions may change between runs.

When versioning is not protocol-native, every application is forced to invent
its own answer. That fragments the ecosystem and weakens interoperability.

PaperProof treats versioning as a first-class primitive precisely because the
Sui and Walrus stack needs a reusable answer here.

## The stack still needs linked interaction objects

Knowledge artifacts do not exist in isolation.

They accumulate discussion, feedback, reactions, governance context, and often
community memory. In most web systems, that information becomes siloed in
application databases or detached from the underlying work.

For durable knowledge, that is a problem. A serious artifact should be able to
carry its official interaction context with it.

This is why PaperProof links artifacts to official comments trees and official
likes books. The point is not merely social engagement. It is to avoid a world
in which the work is stored in one place, the official discussion in another,
and the historical context in a third, with no protocol-level binding.

If the stack wants durable public knowledge, interaction context matters too.

## The stack still needs better indexability

Raw on-chain and storage data are not the same as developer-usable data.

A durable knowledge layer also needs indexable structure:

- event streams that mean something at the artifact level;
- object relationships that can be reconstructed by third-party services;
- consistent metadata that front ends and agents can consume;
- canonical fields for status, type, version, content hash, and storage
  references.

Without these, every explorer, app, or analytics layer must write custom
parsing logic from scratch.

PaperProof's indexer is not the only possible indexer. That is the point. The
protocol should be indexable by any serious ecosystem participant. Durable
knowledge becomes stronger when reconstruction is not private knowledge.

## The stack still needs agent-friendly public knowledge structure

As the agentic web expands, this requirement becomes even clearer.

Agents do not only need access to files. They need access to structured,
versioned, interpretable public knowledge objects. They need to know what they
are reading and whether the state is current or historical.

An agent-friendly stack for durable knowledge needs:

- stable artifact identity;
- explicit version lineage;
- content verification points;
- typed metadata;
- discoverable public records;
- optional memory and prompt-related artifact patterns.

This is one reason PaperProof already goes beyond ordinary publishing. It aims
to make artifact records legible to humans, applications, and agents at the
same time.

## The stack still needs an ecosystem layer above the reference website

Another thing the stack still needs is ecosystem-level reuse.

If a knowledge protocol works only through one official website, then it has
not yet become real infrastructure. It has become an application with protocol
branding.

Durable knowledge on Sui and Walrus should support:

- multiple websites;
- specialized vertical clients;
- enterprise or academic portals;
- agent tools and skills;
- SDK-driven publishing workflows;
- independent indexers and explorers.

PaperProof matters most if it can sit beneath many such experiences rather than
remaining confined to a single official interface.

That is why the protocol, SDKs, indexer, community skill, and official
operations flows all matter together. They create a path from ecosystem
foundations to reusable artifact infrastructure.

## The stack still needs market-readable control primitives

A final missing layer is economic and operational.

If high-value digital artifacts are going to become more important on chain,
then control over those artifacts should eventually become more legible and
transferable as well. This is where NFT-backed artifact control becomes a
natural extension of the durable knowledge thesis.

The objective is not to financialize everything for its own sake. It is to make
artifact control interoperable with the broader digital asset infrastructure of
the ecosystem. When that happens, a knowledge artifact can become not only
verifiable and versioned, but also operationally portable and market-readable.

That is a major part of what a mature Sui and Walrus knowledge layer still
needs.

## What PaperProof is trying to contribute

PaperProof does not replace Sui or Walrus. It depends on them.

What it contributes is a protocol layer for durable knowledge artifacts:

- typed artifact categories;
- stable series identity;
- immutable versions;
- content hash commitments;
- Walrus blob references;
- linked official interaction objects;
- indexable protocol events and object relationships;
- SDK and skill pathways for reusable publishing and reading.

This is why we describe PaperProof as a protocol for artifacts rather than as a
content application.

The website matters. The user experience matters. But the larger goal is to
help the Sui and Walrus stack grow a missing middle layer: one that can support
knowledge objects, not just storage objects.

## The broader implication

The future of decentralized knowledge will not be secured by storage alone, nor
by chain state alone.

It will require domain-specific protocols that make important public work
understandable, version-aware, verifiable, indexable, and reusable across many
interfaces.

For Sui and Walrus, durable knowledge still requires that layer.

PaperProof is our attempt to build it.
