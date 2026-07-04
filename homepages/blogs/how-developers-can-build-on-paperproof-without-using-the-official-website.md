# How Developers Can Build on PaperProof Without Using the Official Website

Author: PaperProof Labs  
Category: Developer Ecosystem  
Status: Official Blog Draft  
Suggested Artifact Type: `blog_post`  

One of the easiest ways to misunderstand PaperProof is to assume that using the
protocol means using `paperproof.site`.

The official website is important. It is the main public reference
application, the place where many users first encounter the protocol, and a
working demonstration of artifact publishing, browsing, governance, comments,
and version history.

But the official website is not the boundary of the system.

PaperProof is designed so that developers can publish, read, verify, and build
artifact-native workflows without depending on the official front end. That
independence is one of the clearest tests of whether PaperProof is truly
infrastructure.

## What "build on PaperProof" actually means

To build on PaperProof is not merely to embed an iframe or link to the official
site.

It means using the protocol model and its supporting tooling directly:

- publish artifacts through protocol-aware code paths;
- add new versions without relying on the official UI;
- resolve artifact series and versions from chain and storage data;
- bind application experiences to protocol-native artifact identity;
- use SDKs, indexers, and skills as reusable building blocks;
- create new front ends or workflows with their own branding and logic.

In other words, PaperProof is intended to support independent applications, not
just a single canonical product surface.

## The layers developers can reuse

Developers can think of PaperProof as a layered stack.

| Layer | What developers can use directly |
|---|---|
| Sui packages and shared objects | Protocol state, transactions, events, governance hooks |
| Walrus storage references | Durable content blobs for artifact payloads |
| PaperProof artifact model | Types, series, versions, content commitments, linked interaction objects |
| SDKs | Publish, read, validate, and automate protocol operations |
| Skills and scripts | Reusable workflows for publishing and operations |
| Indexer patterns | Queryable artifact views reconstructed from protocol state |

This means developers are not forced into a single integration style. They can
enter at the layer that best fits their product.

## Developers do not need the official website to publish

One practical implication is that publishing does not need to happen through the
official website.

A developer or team can publish through code, scripts, or skill-based flows.
This is already visible in the PaperProof ecosystem:

- official Docs, Blog, and Forum content are handled through repository-backed
  publishing workflows;
- the community skill supports reusable artifact operations without relying on
  the official UI;
- SDK-based integrations can prepare content, upload payloads, and submit
  protocol transactions directly;
- local and operational tooling can support publishing from developer machines
  or structured environments.

This matters because it allows PaperProof to fit many publishing contexts:

- CI-driven software release publication;
- documentation pipelines;
- academic or research tooling;
- community-operated portals;
- agent-assisted workflows;
- enterprise integrations.

The official site is therefore one interface, not the only gateway.

## Developers do not need the official website to read

Reading is equally important.

If PaperProof artifacts could be interpreted correctly only by the official
site, then the protocol would not yet be doing enough work.

Developers should be able to read artifacts through:

- SDK read clients;
- indexer queries;
- direct protocol and storage reconstruction;
- custom front ends;
- agent tools that consume artifact metadata and content.

This is why stable artifact identity, version history, content hashes, Walrus
references, and structured metadata matter so much. They create a common object
model that multiple applications can resolve independently.

## What kinds of applications can be built without the official website

The design space is wider than a simple clone of `paperproof.site`.

Developers could build:

- a research-focused interface for preprints and technical reports;
- a dataset catalog with stronger data preview, download, and schema tools;
- a software release portal for protocol packages and changelog navigation;
- a DAO knowledge base where proposals, reports, and artifacts share one
  evidence layer;
- an academic submission workflow that publishes to PaperProof as the durable
  record layer;
- an AI tool that ingests PaperProof artifacts as verified public inputs;
- a private or enterprise-facing portal that uses PaperProof for artifact
  lifecycle while adding its own access control or workflow UX.

These are not edge cases. They are part of the reason the protocol exists.

## Why independent front ends are good for the protocol

Some ecosystems treat alternative front ends as fragmentation. For PaperProof,
they are a sign of health.

If multiple applications can use the same artifact layer, that means:

- the protocol abstractions are strong enough to travel;
- developers are not trapped inside one product;
- users gain more interface choice;
- specialized experiences can emerge for different artifact categories;
- the ecosystem can grow without centralizing every use case into one website.

This also matters strategically. PaperProof does not need to win by being the
only interface. It can succeed by becoming the most useful artifact substrate.

## Skills and SDKs are part of the developer story

A protocol becomes more adoptable when developers have multiple ways to work
with it.

PaperProof already points in that direction through:

- TypeScript SDK support for protocol-aware reads and writes;
- community skill flows for reusable publishing and artifact operations;
- official operations workflows for running the public service;
- repository-based publishing pipelines for official Docs, Blog, and Forum;
- indexer-backed application patterns that reconstruct artifact views.

These tools matter because they reduce dependence on manual UI interaction.

They also support teams with different preferences. Some developers want an
SDK. Some want a scriptable skill. Some want repository workflows. Some want to
connect PaperProof to a broader automation environment.

The protocol should meet all of them where they are.

## What developers should rely on conceptually

When building outside the official website, developers should think in terms of
artifact primitives rather than page primitives.

The key concepts are:

| Concept | Why it matters |
|---|---|
| Artifact type | Tells the application what kind of work it is dealing with |
| Series identity | Provides stable continuity across versions |
| Version identity | Represents an immutable published state |
| Content hash | Enables verification of the actual bytes |
| Walrus reference | Points to durable content storage |
| Comments tree / likes book | Binds official interaction state |
| Status and metadata | Helps applications render meaningful context |

If developers build around these primitives, they can create very different user
experiences while still remaining compatible with the same underlying protocol
records.

## This also matters for the future artifact economy

As PaperProof evolves toward NFT-backed artifact control, independence from the
official website becomes even more important.

If artifact control becomes transferable and market-readable, then the
ecosystem should expect many third-party surfaces:

- marketplace integrations;
- specialized artifact management tools;
- portfolio or archive clients;
- DAO and governance dashboards;
- research and media portals.

That future works cleanly only if the protocol is already designed to support
developers without forcing them through the official website.

## What the official website should remain

None of this means the official website is unimportant.

It should remain:

- the clearest public demonstration of the protocol;
- a high-quality reference interface;
- a place where users can immediately understand artifact publishing and
  browsing;
- a source of official Docs, Blog, Forum, and governance participation;
- a living example of what PaperProof-native UX can look like.

But it should not be mistaken for the protocol itself.

That distinction is healthy for users and for builders alike.

## The long-term standard

The long-term standard for infrastructure is straightforward:

Can other people build serious things on top of it without asking permission
from the original website?

For PaperProof, that is the right test.

If developers can publish their own artifacts, build their own clients, run
their own workflows, and still interoperate around the same artifact model,
then PaperProof is succeeding as infrastructure rather than merely as an app.

That is the future we are building toward: not one mandatory interface, but a
shared protocol layer for verifiable digital artifacts across many interfaces,
tools, and communities.
