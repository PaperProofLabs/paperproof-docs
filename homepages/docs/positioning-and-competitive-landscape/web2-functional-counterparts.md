# Web2 Functional Counterparts

Docs Path: `positioning-and-competitive-landscape/web2-functional-counterparts`

Artifact Code: PaperProof-generic_file-001169-f5379686b8c3
Series ID: 0xf5379686b8c3694be0115e30e7edc2ac13a87fac266f4946ce17e6e4aa570c88
Comments Tree: locked

There is no single web2 product that fully matches PaperProof.

The closest comparison is a functional stack:

`PaperProof ≈ Ghost or Substack + arXiv or OSF + Zenodo + GitHub Releases + Discourse`

This is useful because it shows that PaperProof is not replacing just one
workflow category. It is trying to unify several categories that are usually
split across different web2 systems.

## Functional mapping

| Web2 category | Representative products | What those products do | PaperProof overlap |
|---|---|---|---|
| Long-form publishing | Ghost, Substack, Medium | Publish essays, notes, and subscriber-facing writing | `blog_post`, Docs, and official long-form publication surfaces |
| Research and preprints | arXiv, OSF | Share manuscripts, drafts, and research context | `preprint` and `technical_report` artifact families |
| Data and archival release | Zenodo | Publish data snapshots and cite durable research outputs | `dataset` artifacts and durable version references |
| Software release records | GitHub Releases | Track package and source release history | `software_release` artifacts and version lineage |
| Structured community discussion | Discourse | Keep topic-centered, searchable, long-lived discussions | Official comments tree and forum-style artifact discussion |

## The key difference from web2

Web2 platforms usually rely on the platform database as the main source of
truth:

- this page exists;
- this post is the latest;
- this thread belongs here;
- this attachment belongs to that page.

PaperProof shifts that center toward protocol state plus verifiable content
commitments:

- the series object identifies the continuing work;
- the version records identify exact revisions;
- the content hash commits to retrieved bytes;
- Walrus references carry the content location layer;
- official comments and likes are bound by object IDs, not by page guesswork.

## Why the combined comparison is better

Calling PaperProof "web3 Medium" undersells the release, data, and formal
artifact side. Calling it "web3 arXiv" misses software, discussion, and
governance. Calling it "web3 GitHub Releases" misses documents and research.

The combined comparison is more faithful because PaperProof is trying to unify
several high-value artifact workflows within one consistent protocol model.

## Practical implication

A team that today spreads important knowledge across:

- a docs site;
- a blog;
- a preprint page;
- a dataset archive;
- a release page;
- a forum thread;

can instead treat those outputs as related artifact series with stable identity
and auditable history, while still rendering them through different interface
experiences.

