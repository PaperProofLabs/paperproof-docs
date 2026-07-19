# The Controller-NFT Upgrade Is Now Live on PaperProof

Author: PaperProof Labs  
Category: Protocol Upgrade  
Status: Official Blog Draft  
Suggested Artifact Type: `blog_post`  

The controller-NFT upgrade is now live on PaperProof mainnet.

This is one of the most important protocol upgrades PaperProof has completed so
far, because it changes what artifact control means at the protocol layer.
PaperProof artifacts are no longer controlled only through a legacy
owner-address model. Control is now bound to a controller NFT, which means the
right to operate an artifact series can exist as a transferable on-chain asset
while the artifact's public identity, version history, and authorship record
remain intact.

This is a major structural step for the protocol. At the same time, ordinary
users should still find the experience familiar: reading, publishing, browsing,
and updating artifacts should continue to feel like PaperProof. The point of
the upgrade is not to make users think about extra complexity. The point is to
make artifact control much stronger underneath the surface.

## What changed

Before this upgrade, artifact control relied mainly on a series owner path.
That model was workable, but it had important limitations. It made control more
static, less portable, and less compatible with the broader digital-asset
infrastructure of Sui.

After this upgrade, each artifact series can be controlled through a dedicated
controller NFT. In practice, that means:

- the right to add new versions follows the controller;
- the right to govern artifact-level control flows follows the controller;
- the right to control the linked comments tree can also follow the controller;
- control can move through NFT transfer rather than only through legacy
  owner-bound paths.

This gives PaperProof a cleaner separation between historical publication record
and present control authority.

## What users should notice

For many users, the most important result is that they do not need to change
how they think about ordinary PaperProof usage.

Readers can still open Docs, Blog posts, datasets, software releases, reports,
and preprints in the same way. Publishers can still create artifacts, add new
versions, and operate through the PaperProof website, SDKs, and skills. The
upgrade is designed so that the protocol becomes more powerful without making
the normal publishing flow feel foreign.

What changes is the control model behind that experience.

| Area | Before the upgrade | After the upgrade |
|---|---|---|
| Artifact control | Mostly tied to a legacy owner path | Tied to a controller NFT |
| Add version authority | Followed the owner model | Follows the controller model |
| Comments-tree control | Followed the old authority path | Can follow the same controller authority |
| Transferability | More protocol-specific and operationally awkward | Wallet-native and compatible with NFT transfer flows |
| Historical record | Risk of conflating control with long-term artifact identity | Historical identity stays stable while control can move |

For most users, the practical difference is not "the UI looks different." The
practical difference is "artifact control is now much more serious."

## What stayed the same

Important things did not change.

Original authorship is still preserved.  
The fact that control can move does not rewrite who originally published an
artifact or who published prior versions.

Version history is still preserved.  
The upgrade does not flatten a series into a mutable latest state. Historical
versions remain historical versions.

Artifact identity is still preserved.  
The upgrade does not require abandoning the artifact model or reinterpreting an
artifact as a simple collectible.

The website and SDK goal is still continuity.  
PaperProof should continue to feel like a publishing and artifact protocol,
even though the authority model underneath it is now more powerful.

This continuity matters. A good protocol upgrade should improve the system's
structure without forcing users to relearn the entire product.

## Why this upgrade matters

The deeper significance of this upgrade is that it turns artifact control into
something the broader Sui ecosystem can understand more naturally.

An artifact series is not just content sitting on a website. In PaperProof, it
can be a long-lived digital object with versions, public references, comment
context, and operational value. Once the control right of that series is bound
to an NFT, the ecosystem can reason about that control in a more standard way.

That matters for several reasons.

First, it makes artifact stewardship transferable in a cleaner way.  
A software release line, research series, or public dataset can move from one
holder to another without destroying the artifact's continuity.

Second, it makes artifact control more compatible with wallet and marketplace
infrastructure.  
PaperProof can now plug into a much broader asset environment instead of
keeping control semantics isolated inside one protocol-specific owner field.

Third, it makes the protocol more suitable for real organizational use.  
Individuals, teams, multisigs, communities, and future acquirers can hold or
transfer artifact control in a more legible way.

Fourth, it strengthens PaperProof's position as artifact infrastructure rather
than just a content application.  
When control itself becomes assetized, the protocol moves closer to a true
artifact economy.

## Why this matters for Sui and Walrus

This is also an important upgrade at the ecosystem level.

Sui is especially good at programmable digital objects and explicit ownership
semantics. Walrus is especially good at durable content storage. PaperProof
sits above that stack as the artifact layer that turns stored content and
on-chain state into versioned public digital artifacts.

The controller-NFT upgrade strengthens that stack:

- Sui gets a stronger example of NFTs representing meaningful protocol control,
  not just collectible media or generic profile items;
- Walrus gets a stronger role in the lifecycle of long-lived artifacts whose
  content remains durable even when control changes;
- PaperProof becomes a clearer example of how Web3 can support transferable
  control over serious digital work.

This is important because Web3 still needs more examples of assets that
represent stewardship over real informational objects, not only speculation
around attention.

## Why it matters for developers and communities

For developers, this upgrade means the protocol can support a richer class of
applications.

A builder can now imagine clients and marketplaces where artifact control is a
first-class concept. A research portal, release-management tool, community
archive, or governance-aware publishing interface can build on PaperProof while
reusing controller-aware semantics instead of inventing them from scratch.

For communities, this matters because public digital work often outlives the
first wallet that created it. A community knowledge base, a DAO report series,
or a software release lineage may need new stewardship over time. The
controller-NFT model makes that transition much more natural.

## What this says about PaperProof

This upgrade reflects something fundamental about the direction of PaperProof.

PaperProof is not trying to be only a place where content gets posted. It is
trying to be a protocol where important digital artifacts can have:

- stable identity;
- durable versions;
- preserved authorship;
- verifiable storage references;
- linked interaction objects;
- governance context;
- and now, transferable control as a native digital asset.

That is a much larger ambition than ordinary publishing software.

## The larger meaning

The controller-NFT upgrade does not make PaperProof "an NFT app."

It makes PaperProof a stronger artifact protocol.

That distinction matters. The goal is not to decorate content with NFTs. The
goal is to give artifact control the right protocol form for a world where
important digital work should be transferable, governable, versioned, and
legible across applications.

This upgrade brings PaperProof much closer to that goal.

For users, it means stronger control semantics without losing the familiar
publishing experience.  
For developers, it means a more capable artifact substrate.  
For the Sui and Walrus ecosystem, it means a clearer example of how digital
objects, durable storage, and protocol-native asset control can work together.

And for PaperProof itself, it marks the beginning of a more serious stage:
artifact control is no longer just an internal rule. It is now part of the
protocol's asset layer.
