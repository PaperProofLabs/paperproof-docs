# Ecosystem Position

Docs Path: `positioning-and-competitive-landscape/how-to-position-paperproof`

Artifact Code: PaperProof-generic_file-001169-51a7dae8183c
Series ID: 0x51a7dae8183cf9ecf4ac63a4201f5f27a0e3e5c4100b4313a693c4db6895b1cc
Comments Tree: locked

PaperProof should not be introduced as "a better blog" or "a decentralized
forum." Those descriptions are too narrow and create the wrong mental model.

The more accurate framing is:

`PaperProof is a protocol-native artifact layer for publishing, versioning,
verifying, discussing, and governing high-value knowledge objects across human
and AI workflows.`

## The core unit is the artifact

Most content systems are centered on one of two things:

- the author account;
- the post or message.

PaperProof is centered on the artifact series. A series is a continuing work
with:

- a stable identity;
- typed versions;
- verifiable content commitments;
- official discussion bindings;
- historical continuity;
- integration-friendly state.

That shift matters because long-lived work behaves differently from ordinary
social content. A paper, report, dataset, SDK release, or official guide may
need years of updates, references, and downstream reuse.

## A protocol, not only an app

The official website is a reference surface, not the protocol boundary.
Independent teams can build:

- publication portals;
- research repositories;
- release dashboards;
- community forums;
- agent tools;
- archival mirrors;
- analytics and compliance views.

All of them can point at the same canonical artifact series and version
history.

## What PaperProof combines

At a high level, PaperProof combines several usually separate functions:

| Function | What PaperProof adds |
|---|---|
| Publishing | Typed artifact creation and append-only versions |
| Verification | Content hash commitments and Walrus references |
| Discussion | Official comments tree bound to the artifact |
| Participation | Official likes book and governed participation surfaces |
| Discovery | Manifest, indexer, and SDK-compatible state |
| Governance | Fee, registry, and official route controls where appropriate |
| Agent use | Prompt and memory-adjacent protocol surfaces |

## What it is not trying to be

PaperProof is not trying to replace every social network, every code host, or
every research institution.

It is trying to supply the missing protocol layer underneath durable digital
knowledge works, so that important artifacts do not depend entirely on one app
database, one website policy, or one storage link.

## Best short descriptions

Different audiences may need slightly different summaries:

| Audience | Useful description |
|---|---|
| Developers | A verifiable artifact protocol on Sui + Walrus |
| Researchers | A versioned protocol layer for papers, reports, datasets, and technical records |
| Product teams | A shared artifact backend for docs, blogs, forums, and release surfaces |
| Investors | Infrastructure for durable knowledge objects and agent-readable content |
| Community users | A way to publish and evolve important works without losing identity or history |
