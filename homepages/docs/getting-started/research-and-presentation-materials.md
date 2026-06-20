# Research and Presentation Materials

Docs Path: `getting-started/research-and-presentation-materials`

Artifact Code: PaperProof-generic_file-001144-6b259991d78f
Series ID: 0x6b259991d78f2265d77f302168d9f801b093707234bdfaee06d9f7763ccf4c85
Comments Tree: locked

PaperProof is documented through several complementary materials. They describe
the same protocol from different angles: ecosystem vision, implementation-level
specification, system-design analysis, and presentation narrative.

This page is a reading guide and evidence map. The papers, slides, demo video,
official website, SDKs, and submission hub are meant to be read together: the
papers explain the protocol, the slides and video tell the story quickly, and
the live website shows the deployed system.

## Materials at a glance

| Material | Primary purpose | Best audience | Suggested reading mode |
|---|---|---|---|
| Whitepaper | Explain why PaperProof should exist and what ecosystem role it can play | Users, builders, ecosystem partners, reviewers, and community members | Start here for the product and protocol vision |
| Yellow paper | Define the protocol model and integration rules with implementation-level precision | Auditors, SDK maintainers, indexer builders, advanced frontend developers, and protocol contributors | Use as the technical specification |
| Academic paper | Present PaperProof as a system-design contribution with architecture, trust boundaries, and evaluation evidence | Researchers, hackathon judges, protocol designers, and technically deep reviewers | Read for structured analysis and evidence |
| Slides | Tell the shortest coherent story for a live pitch or recorded demonstration | Hackathon judges, ecosystem reviewers, and presentation audiences | Use as the guided overview |
| Demo video | Show the completed website, slides, SDK evidence, and protocol workflow in one short recording | Hackathon judges and ecosystem reviewers | Watch before or after opening the live app |
| Submission hub | Link the public repositories, deployment evidence, screenshots, and contract package IDs | Hackathon judges and technical reviewers | Use as the table of contents for review |

The materials are not duplicates. They intentionally vary in tone, depth, and
reader assumptions.

## Whitepaper

The PaperProof whitepaper is the accessible ecosystem document. It explains the
problem that PaperProof addresses: important digital works often depend on
mutable pages, application databases, storage links, repository conventions,
and social feeds that do not provide a durable protocol identity.

The whitepaper introduces PaperProof as a reusable artifact layer:

```text
stable identity
  + typed append-only versions
  + Walrus-backed content
  + official discussion
  + governance-readable state
  + SDK and agent integration
```

Its emphasis is value and adoption rather than exhaustive contract detail. It
describes:

- why durable artifact infrastructure matters;
- the difference between a file and a continuing artifact series;
- core use cases for papers, datasets, software releases, technical reports,
  blogs, forum topics, and generic files;
- the division of labor between Sui and Walrus;
- comments, likes, governance, and PPRF participation;
- SDK and developer ecosystem paths;
- protocol-native prompts and wallet-linked Agent Memory;
- roadmap, limitations, risk, and safety boundaries.

The whitepaper should be the first paper for readers who want to understand the
project before inspecting Move packages or object IDs.

### Current source files

| File | Role |
|---|---|
| `whitepaper/paperproof-whitepaper.tex` | LaTeX source |
| `whitepaper/paperproof-whitepaper.pdf` | Generated PDF |

### PaperProof artifact mapping

The whitepaper has a dedicated PaperProof artifact series. Updates should
append versions to that series rather than replace the original record.

```text
Artifact Code: PaperProof-preprint-001162-0c3f8fd7d4eb
Series ID: 0x0c3f8fd7d4ebf2ce5c89519a75893adde281a2fa1053c9625e886d25170d8c8d
```

## Yellow paper

The PaperProof yellow paper is the protocol specification. It is stricter than
the whitepaper and should be used when an implementation decision, object
relationship, event rule, validation bound, or integration contract needs to be
stated precisely.

The yellow paper covers:

- notation and terminology;
- the protocol object inventory;
- deployment manifests and canonical bindings;
- the artifact-type registry;
- `ArtifactSeries` and typed version records;
- Walrus content references and verification boundaries;
- official `CommentsTree` and `LikesBook` objects;
- governance vaults, proposals, voting, execution, and claims;
- events, canonical indexing, and trusted-entry rules;
- SDK transaction builders, reads, queries, and watch semantics;
- validation rules and error handling;
- upgrades, object versions, migration, and deployment drift;
- security boundaries;
- package IDs, object IDs, and event constants.

The yellow paper is useful when building an SDK, reviewing a contract change,
implementing an indexer, or validating that an interface is reading the
official object graph rather than look-alike state.

### Current source files

| File | Role |
|---|---|
| `yellow-paper/paperproof-yellow-paper.tex` | LaTeX source |
| `yellow-paper/paperproof-yellow-paper-updated.pdf` | Current generated PDF |

### PaperProof artifact mapping

The yellow paper has its own artifact series and version history. Its series is
distinct from the whitepaper because the documents serve different audiences
and may evolve at different rates.

```text
Artifact Code: PaperProof-preprint-001162-064b3cf9a09c
Series ID: 0x064b3cf9a09c61e5a1fdef46ac6fa59f631d871b9769e5f0a0d4736387b29eec
```

## Academic paper

The academic paper presents PaperProof as a system and protocol-design
contribution rather than as a product brochure. Its working title is:

```text
PaperProof: Sui-Native Artifact Infrastructure for Durable, Verifiable, and
Agent-Readable Knowledge Objects
```

The paper frames the research problem, design goals, architecture, security
model, implementation evidence, and limitations. It is intended for readers
who want to understand why the protocol has its current shape and how its
design choices fit together.

Topics include:

- the limits of storage-only publication models;
- durable artifact identity and typed version lineage;
- object-centric protocol state on Sui;
- large-content storage and retrieval through Walrus;
- official interaction bindings;
- canonical indexing and event trust;
- SDK and query layers;
- governance and upgrade boundaries;
- protocol-native prompts;
- wallet-linked Agent Memory;
- implementation and mainnet evidence;
- formal-verification posture;
- limitations and related work.

The academic paper includes architecture diagrams and sequence diagrams. These
help explain publication flow, verification flow, object relationships,
governance, deployment reality, and the optional agentic memory layer.

### Current source files

| File | Role |
|---|---|
| `academic-paper/paperproof-academic.tex` | LaTeX source |
| `academic-paper/paperproof-academic.pdf` | Generated PDF |
| `academic-paper/Ref.bib` | Bibliography |
| `academic-paper/figs/` | Architecture and sequence diagrams |

### PaperProof artifact mapping

The academic PDF has its own versioned artifact series. A new revision,
conference-style edit, or evidence refresh should become a new version under
the same stable series identity.

```text
Artifact Code: PaperProof-preprint-001162-c2fff6d39f06
Series ID: 0xc2fff6d39f0603eb08b0775aab0f7f996fc01faff797f10871cfff45729743c8
```

## Presentation slides

The PaperProof slides are the pitch and demonstration deck. They are not a
replacement for the papers. Their job is to tell the project story quickly and
support a live or recorded demonstration.

The slides explain:

- what PaperProof is;
- why Sui and Walrus fit the problem;
- how artifact publication and versioning work;
- how protocol-native prompts and Agent Memory extend the design;
- which contracts, SDKs, and app components already exist;
- how the official Docs, Blog, and Forum become the first PaperProof-backed
  applications;
- which screenshots and live actions should appear in a demo;
- how PaperProof differs from a storage app or a chatbot;
- why the project fits a Walrus-first track while remaining Agentic Web ready;
- the adoption path and ecosystem potential.

### Current source files

| File | Role |
|---|---|
| `paperproof-slides.tex` | LaTeX Beamer source |
| `paperproof-slides.pdf` | Generated pitch deck |

### PaperProof artifact mapping

The deck has a versioned PaperProof artifact series. Presentation updates
should append versions so reviewers can inspect how the project story evolved
alongside protocol releases.

```text
Artifact Code: PaperProof-technical_report-001162-4f414f76bdc5
Series ID: 0x4f414f76bdc501616f690cf418ea50b5803d07a14cca13289a8fe6fc18b2eb78
```

## Demo video and public submission hub

The public demo video is available on YouTube:

```text
https://www.youtube.com/watch?v=OjRZrhqZ4ZY
```

The Sui Overflow submission hub is:

```text
https://github.com/PaperProofLabs/paperproof-sui-overflow-2026
```

Use the hub when you need one public entry point for the website, repositories,
SDK package links, screenshots, formal-verification branch, deployment notes,
and primary Sui package ID.

## Recommended reading paths

Different readers can start with different materials:

| Reader | Suggested path |
|---|---|
| New user or community member | Whitepaper -> official Docs -> app |
| Hackathon judge | Demo video -> slides -> app -> submission hub -> academic paper |
| SDK or frontend developer | Getting Started -> yellow paper -> SDK Docs -> mainnet manifest |
| Indexer builder | Yellow paper -> Indexer Integration -> Manifests and Canonical State |
| Auditor or security reviewer | Yellow paper -> Formal Verification -> contract repository -> deployment records |
| Researcher | Academic paper -> yellow paper -> formal-verification evidence branch |

## Versioning rule

These materials should remain separate artifact series because each has its
own identity, revision rhythm, citation use, and audience. When a material is
updated, publish a new version under the existing series and cite the exact
version ID when precision matters.

```text
Stable series ID -> latest version for normal readers
Exact version ID -> citation, review, audit, or reproducibility
```

The official app should store stable series IDs in its lightweight manifest and
resolve current versions at runtime. That preserves automatic updates without
hard-coding a particular PDF version or Walrus blob.
