# Reading Sui Overflow 2026 Through PaperProof Protocol

## Direct Dataset Links

- DeFi & Payments: [PaperProof-dataset-001172-be47024491e4](https://paperproof.site/#/artifact/PaperProof-dataset-001172-be47024491e4)
- Special - DeepBook: [PaperProof-dataset-001172-8e4d9dd3a5ff](https://paperproof.site/#/artifact/PaperProof-dataset-001172-8e4d9dd3a5ff)
- Special - Walrus: [PaperProof-dataset-001172-df605da089ff](https://paperproof.site/#/artifact/PaperProof-dataset-001172-df605da089ff)
- The Agentic Web: [PaperProof-dataset-001172-ffa42b9c40a1](https://paperproof.site/#/artifact/PaperProof-dataset-001172-ffa42b9c40a1)

Sui Overflow 2026 generated a large amount of public project information across several tracks. Rather than leaving that material as scattered markdown files or temporary research notes, four track-specific snapshots have now been packaged and published as `dataset` artifacts on PaperProof Protocol.

These four datasets are useful because they are more than summaries. Each one preserves a downloadable package with the original intelligence markdown snapshot, a machine-readable overview, a schema, and source provenance. That makes the material readable by people, inspectable by researchers, and reusable by agents or downstream tooling through a protocol-native artifact format.

This post does not rank projects or tracks. Its aim is narrower and, I think, more useful: technical analysis, statistical analysis, and submission-structure analysis based on four published datasets.

## Dataset Artifacts

| Track | Artifact Code | Artifact Link |
|---|---|---|
| DeFi & Payments | `PaperProof-dataset-001172-be47024491e4` | [Open dataset](https://paperproof.site/#/artifact/PaperProof-dataset-001172-be47024491e4) |
| Special - DeepBook | `PaperProof-dataset-001172-8e4d9dd3a5ff` | [Open dataset](https://paperproof.site/#/artifact/PaperProof-dataset-001172-8e4d9dd3a5ff) |
| Special - Walrus | `PaperProof-dataset-001172-df605da089ff` | [Open dataset](https://paperproof.site/#/artifact/PaperProof-dataset-001172-df605da089ff) |
| The Agentic Web | `PaperProof-dataset-001172-ffa42b9c40a1` | [Open dataset](https://paperproof.site/#/artifact/PaperProof-dataset-001172-ffa42b9c40a1) |

## What Is In Each Package

Each dataset package contains five files:

| File | Purpose |
|---|---|
| `README.md` | Human-readable overview of the dataset and its intended uses |
| `dataset_overview.json` | Structured snapshot metadata and summary statistics |
| `schema.json` | Schema for the overview and summary structure |
| `sources.json` | Provenance and source mapping |
| Original markdown snapshot | The full research note behind the packaged dataset |

This packaging choice matters. Many hackathon analyses are easy to read once and hard to reuse later. A PaperProof Protocol dataset turns the same research into something that can be downloaded, verified, versioned, and cited again.

In PaperProof terms, this is the difference between a loose file and a durable artifact. A dataset is not merely an attachment or a storage object. It can carry a stable series identity, typed versions, a verifiable content commitment, and an official artifact page that remains meaningful even if future apps, dashboards, or research workflows change.

## Why This Material Fits PaperProof's Artifact Model

It helps to think of these Overflow materials not just as "research notes," but as evidence packages about a particular ecosystem moment. That matters because PaperProof is designed around artifact families rather than a single generic upload primitive.

| Overflow material | Natural PaperProof artifact shape | Why that matters |
|---|---|---|
| Track intelligence snapshot | `dataset` | Treats ecosystem research as reusable data rather than as an ephemeral post |
| Long-form analytical blog | `blog_post` | Makes interpretation, methodology, and cross-track conclusions versionable |
| Methodology note or technical appendix | `technical_report` | Supports more formal writeups, structured analysis, and future revisions |
| Source archive, parser, or exporter package | `software_release` | Lets downstream users reproduce or extend the dataset workflow |
| Raw supporting files, edge cases, schemas, or one-off supplements | `generic_file` | Preserves irregular but still important supporting artifacts |

Seen this way, PaperProof is not only a place where the final blog can live. It is a way to keep the surrounding research package coherent over time: the dataset itself, the analysis of the dataset, the tooling used to prepare it, and any later corrections or expansions.

## High-Level Comparison

| Track | Project Rows | Raw Records in Snapshot | Mainnet | Testnet | Unknown | Devnet | Package IDs Listed | GitHub Links | Website Links | YouTube Links |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| DeFi & Payments | 162 | 162 | 42 | 109 | 8 | 3 | 126 | 160 | 140 | 160 |
| Special - DeepBook | 136 | 136 | 6 | 120 | 6 | 4 | 100 | 136 | 125 | 136 |
| Special - Walrus | 223 | 223 | 27 | 184 | 10 | 2 | 173 | 221 | 191 | 221 |
| The Agentic Web | 159 | 159 | 27 | 108 | 17 | 7 | 110 | 158 | 146 | 158 |

Several technical and statistical patterns stand out immediately.

1. Walrus is the largest of the four snapshots by a clear margin, with 223 indexed project rows.
2. DeFi & Payments shows the highest mainnet count in this set, which is useful for analyzing how often teams in that track presented a production-facing deployment status.
3. DeepBook has the highest testnet share in this set, which makes it useful for studying earlier-stage trading and market-structure experimentation.
4. The Agentic Web combines meaningful scale with a broad mix of agent, wallet, and application-related ideas.

One underappreciated point is that the public materials around these projects are themselves part of the product signal. A package ID, a domain, a demo video, a repo, a deck, and a technical writeup together form the evidence surface by which outsiders judge seriousness. PaperProof matters here because it is designed to turn that kind of scattered evidence into stable artifacts with explicit type, lineage, and retrieval semantics.

## Delivery Surfaces and Public Access

One useful way to read these datasets is to separate protocol ambition from delivery surface. Public links do not tell the whole story, but they do reveal how teams choose to present themselves to users, developers, and reviewers.

### Website and Hosting Distribution

| Track | Custom Domain | Vercel | `wal.app` | No Website Link |
|---|---:|---:|---:|---:|
| DeFi & Payments | 48.1% | 29.0% | 0.0% | 13.6% |
| Special - DeepBook | 28.7% | 45.6% | 0.7% | 8.1% |
| Special - Walrus | 30.9% | 39.5% | 2.7% | 14.3% |
| The Agentic Web | 29.6% | 45.3% | 0.6% | 8.2% |

This distribution suggests several things.

1. A meaningful share of teams invested in a branded domain rather than only a platform-hosted preview, especially in DeFi & Payments.
2. Vercel is the most visible hosting surface across three of the four tracks, which suggests that fast frontend iteration was more common than bespoke infrastructure.
3. Native `wal.app` website exposure is still rare even inside the Walrus track. That is notable because it suggests Walrus is often used as a storage or proof primitive before it is used as the primary public website surface.
4. The Walrus track still contains the highest visible concentration of Walrus-native website presence, but even there the dominant pattern is hybrid: a conventional frontend plus Walrus-backed content or evidence.

### Public Interface Diversity

The public links also show that many projects do not rely on a single user interface. Across the four tracks, recurring interface shapes include:

- browser frontend;
- GitHub repository as developer-facing entry point;
- demo video;
- pitch deck;
- X profile or other social profile;
- Telegram bot or chat surface in some agentic and prediction-market oriented submissions;
- documentation pages or npm package pages in a smaller but important subset.

Examples include Telegram- or chat-first access layers such as QuickPredict and DeepPredict Chat, npm- or SDK-facing distribution points such as FlowGate, Phasis, and Say Ur Intent, and multi-surface products such as Sup Wallet that explicitly describe web, mobile, policy, and adapter surfaces together.

That matters because "can users access this only through one official website" is often answered with "no" at the project-presentation layer, even when the product itself is still application-centric. Many teams already expose at least two interfaces: a user-facing app and a developer-facing code or documentation surface.

This is one place where PaperProof reads more clearly as infrastructure than as a single site. Its architecture deliberately separates protocol truth from the official interface: the website, SDKs, community skill, indexers, and future third-party portals are all meant to sit on top of the same artifact state rather than become its sole keeper. Looking across these Overflow submissions, that separation feels increasingly important because many serious projects already want more than one public surface.

It also changes how outsiders can work. A researcher may prefer the dataset artifact, a builder may prefer the repo and software-release path, an investor may prefer the analytical writeup, and an agent may prefer structured machine-readable files. PaperProof's artifact model is appealing here because it does not force all of those audiences into one interface or one content format.

## Technology Stack and Native-ness

These datasets do not provide a uniform schema for technology stacks, so any stack analysis should be treated as sample-based rather than exhaustive. Even so, the long-form writeups are rich enough to show clear patterns.

### Sui-Native Components

Across the sample, the most visible Sui-native technical choices include:

- Sui Move smart contracts;
- PTBs for multi-step atomic workflows;
- DeepBook and DeepBook Predict integrations in the DeepBook track and adjacent submissions;
- Walrus blob storage and, in some cases, Walrus Sites;
- SuiNS, zkLogin, sealed objects, events, policy objects, or object-centric permissioning in more technically explicit projects.

Representative examples include FlowGate and Say Ur Intent for PTB-centric execution design, Aegis and Sup Wallet for policy objects and constrained authority, Skew and Phasis for DeepBook-native market surfaces, and WalForm or Polar for Walrus- and SuiNS-facing application design.

This is an important distinction. Many projects are not merely using Sui as a settlement chain. Their public descriptions often emphasize primitives that are specific to Sui's object model, transaction composition, or ecosystem services.

### Non-Sui Technical Layers

The same submissions also show a strong conventional application stack:

- React, Next.js, or Vite on the frontend;
- TypeScript and Node.js as the most common application/runtime layer;
- occasional Rust, Python, PostgreSQL, MongoDB, SQLite, Cloudflare Workers, Railway, or on-render hosting;
- mobile or desktop surfaces in a smaller subset.

That conventional layer is especially visible in projects such as WalDrive, deepskew, PredictOps, TuskOS, and many Vercel-hosted consumer-facing entries across all four tracks.

In other words, the dominant pattern is not purely web3-native stack only. It is a layered architecture where Sui-native settlement or control logic is paired with familiar web application tooling.

PaperProof itself fits this layered pattern, but in a clarifying way. At the bottom are Sui objects and Walrus content; above that sits the artifact protocol layer; above that come SDKs, skills, indexers, and application surfaces. That middle layer matters because it gives docs, datasets, software releases, reports, and long-form knowledge objects a protocol identity that is not reducible to either raw storage or a single frontend codebase.

### Web3-Native vs Web2-Carried Concepts

The datasets also reveal a useful strategic split.

- Some submissions clearly adapt familiar web2 concepts onto Sui: payments, invoicing, payroll, merchant checkout, healthcare records, appointments, productivity, or business operations.
- Others are much more web3-native or chain-native in framing: on-chain vaults, prediction markets, object rentals, policy-gated agent execution, protocol-native memory, Walrus-backed artifacts, or tokenized fund mechanics.

Examples of web2-carried concepts include Payfrica, Hongbao, Sui SafeSend, and various payroll, merchant, or payment-link products. Examples of more web3-native framing include Usufruct-style object rental logic, Sup Wallet's capped delegation model, SkillWal's on-chain skill marketplace, or WALL·E's one-file agent publishing model.

Neither direction is inherently better. But they imply different evaluation criteria:

- web2-carried concepts should be judged on whether chain integration adds real trust, automation, auditability, portability, or ownership advantages;
- web3-native concepts should be judged on whether they are using Sui primitives in ways that are difficult to replicate with conventional application architecture.

PaperProof is a useful comparison point because it tries to bridge both directions. It borrows familiar web2 content forms such as docs, datasets, blog posts, reports, and software releases, but treats them as web3-native artifact objects with version history, official interaction bindings, and machine-resolvable state. That hybrid positioning is one reason it can speak both to traditional publishing logic and to newer agent- and protocol-native workflows.

## Package IDs, Contract Footprint, and Protocol Depth

Package ID disclosure is one of the strongest lightweight indicators in these datasets, because it shows how often teams exposed an actual on-chain package reference rather than only a frontend.

| Track | Package IDs Listed |
|---|---:|
| DeFi & Payments | 77.8% |
| Special - DeepBook | 73.5% |
| Special - Walrus | 77.6% |
| The Agentic Web | 69.2% |

That does not prove contract quality, but it does show that a large majority of submissions in every track were willing to expose at least one package ID or explicit on-chain package reference.

The more advanced long-form writeups add another layer beyond package presence: some teams explicitly describe contract count, module count, or approximate Move line counts. Those disclosures are not common enough to summarize as a reliable full-track metric, but they are common enough to support a qualitative observation:

1. A minority of projects present substantial contract-surface detail, including multi-package layouts, rough LOC estimates, or explicit separation between core protocol, application, and operator infrastructure.
2. Those disclosures appear more frequently in technically ambitious DeepBook, Walrus, and Agentic submissions than in lighter demo-style application entries.
3. For most projects, the dataset supports "package exposed" analysis more reliably than "contract size" analysis. Contract LOC should therefore be treated as selectively observable, not as a full leaderboard metric.

Representative examples of richer contract-surface disclosure include Phasis, Automark, LeafSheep, Aegis Project, and several Walrus-track infrastructure entries that describe package boundaries or module roles in public materials.

For PaperProof, protocol depth is not only about how much Move code exists. It is also about whether a system distinguishes content bytes from artifact identity, current version from historical versions, and application display from protocol truth. That distinction is central to PaperProof's own model: an artifact is not just a blob pointer, but a typed series with version records, official comments and likes, and a state surface that independent indexers and SDKs can reconstruct.

## Security, Verification, and Trust Signaling

The security lens is especially important, but the data here requires careful wording. The datasets do not uniformly expose audit status, formal verification status, or invariant coverage. What they do show is a spectrum of trust signaling.

### What Can Be Observed Reliably

- Some projects explicitly mention formal verification, Sui Prover usage, or proved invariants.
- Some mention audits or planned audits.
- Some expose protocol writeups detailed enough to discuss invariants, capability boundaries, hot-potato patterns, replay protection, or policy enforcement.
- Many expose neither audits nor formal methods in their public submission-facing materials.

Examples of stronger public trust signaling include TuskScan, SuiShield, toldproof, ProofCapsule, Aegis, and projects that explicitly mention Sui Prover, formal specs, durable evidence capsules, or verifiable audit records.

### What That Means

The safest conclusion is not "most projects are insecure." The safer conclusion is:

1. formal verification and audit language is still the exception rather than the rule in public hackathon-facing materials;
2. teams that do mention formal methods tend to use that as a strong differentiation signal;
3. for most entries, public trust is being asked for through demos, repositories, and architecture claims rather than through external assurance artifacts.

That distinction matters because an application can be technically interesting without yet being security-mature. For readers of these datasets, visible security posture should be treated as a separate dimension from feature completeness or mainnet status.

This is another area where PaperProof's design priorities feel relevant. PaperProof has been opinionated about deployment manifests, drift checks, typed SDK workflows, indexer correctness, and formal-verification-oriented contract work precisely because artifact protocols are easy to misread if clients silently trust the wrong package, wrong object binding, or incomplete provider results. For systems that want to become durable public infrastructure, correctness of interpretation matters almost as much as correctness of execution.

## Tokens, Economic Design, and Revenue Design

Another important omission in the earlier draft was token usage. Here again, the source material is uneven. Some projects explicitly discuss tokens, vesting, reward systems, fee models, or protocol-native revenue logic. Many others do not.

The most useful way to interpret this is:

1. token exposure is not uniformly disclosed across the four tracks;
2. several submissions clearly rely on token or yield mechanics, but not every project turns that into a public tokenomic story;
3. where token language is present, it often appears in one of four forms:
   - incentive or reward layer;
   - governance or fee layer;
   - tokenization / wrapped-asset layer;
   - trading, vault, or share-token layer.

That suggests the datasets are better for observing where token design is important than for constructing a precise "tokenized vs non-tokenized" census.

Examples include SuiPump and launch-oriented products where token lifecycle is central, Epoch and vesting-related designs where token release logic is itself the product, and vault or share-based systems such as Automark where tokenized or coin-like positions are part of the architecture even if the project is not framed as a token launch.

Just as important, however, is the difference between token design and revenue design. A project may have no native token and still present a meaningful economic model.

Across the long-form samples, recurring revenue or monetization patterns include:

- protocol fees on settlement, execution, swaps, vault operations, or marketplace actions;
- builder fees, operator fees, or take rates on successful flows;
- subscription or access layers around higher-value workflows;
- spread capture, routing economics, or market-making related revenue;
- managed-service fees for users who choose convenience over self-operation;
- software-style monetization through SDKs, skills, hosted runtimes, or premium interfaces.

Examples of explicit revenue or fee design appear in Skew's builder fee, Sup Wallet's adapter and service framing, WALL·E's price, stake, and royalty model, LeafSheep's managed-service fee logic, and a range of DeFi / trading products where the monetization path is tied to routing, vaults, fees, or settlement volume.

This distinction matters because some of the more credible submissions do not lead with a token at all. Instead, they explain where cash flow, fee capture, or sustainable operator revenue would come from.

For analytical purposes, it is helpful to separate projects into three broad buckets:

1. no visible economic design in the public submission materials;
2. economic design is present, but mostly implicit through trading, yield, or settlement flows;
3. explicit revenue design is described, such as fee schedules, service charges, builder fees, marketplace take rates, or protocol-native monetization paths.

That is often a stronger business signal than token language alone. A token can exist without a sustainable business model, while a fee-bearing or service-bearing architecture may already express a real economic design even without a token.

## SDKs, Skills, and Developer Reusability

Another missing dimension in the earlier draft was whether projects expose reusable developer surfaces instead of only end-user apps.

Based on the long-form materials, at least a smaller but meaningful subset of projects mention:

- SDK packages;
- command-line tools;
- skills or MCP-style integration surfaces;
- bots or operator runtimes;
- multiple access layers for both humans and agents.

Representative examples include FlowGate SDK, Automark SDK and Runner, Phasis SDK, WalDrive's installable skill, wdoublesync's CLI plus skill file, verity's MCP server, TuskOS with the tusk-memory SDK, and MemWal Agent Memory's setup skill and MCP-facing memory surface.

This matters for usability analysis. A product that can only be used through one official website is fundamentally different from a product that also exposes:

- an SDK;
- a skill or agent integration path;
- a documented protocol interface;
- or a runner, operator, or bot layer.

Across the sample, these reusable surfaces appear most visibly in the more infrastructure-heavy DeepBook, Walrus, and Agentic entries. DeFi & Payments contains some of them too, but it more often presents the app surface first and the reusable developer surface second.

PaperProof belongs squarely in this discussion. It is not just an official website with publish buttons. It already spans multiple developer access layers: protocol contracts, SDKs in multiple languages, an indexer-oriented read layer, and skill-based access for agentic or scripted workflows. That makes it a useful reference case when asking whether a project is trying to become reusable ecosystem infrastructure or is mainly shipping a single application.

That distinction matters even more for research artifacts than for consumer apps. A consumer app can still be useful if it only works through one website. A research corpus, benchmark dataset, protocol note, or official release history is much more valuable when scripts, indexers, and agents can consume it directly without scraping a UI. PaperProof's developer surfaces are therefore not just convenience features; they are part of the reason the artifact layer can remain reusable.

## Protocol vs Application Positioning

One of the most important analytical questions is whether a submission is really a protocol, really an application, or a hybrid.

The datasets suggest that all three exist.

### Application-First

These are submissions whose public surface is mostly a website or workflow, even if they use on-chain packages underneath. They are often easiest to demo and easiest to understand quickly.

Examples include consumer-facing payment or wallet flows such as Payfrica, Sui SafeSend, Suisend, QuickPredict, or various one-task agent frontends.

### Protocol-First

These are submissions that emphasize a reusable primitive, contract architecture, policy engine, vault model, marketplace rule set, or a new composable object pattern. They often provide more architectural detail and more developer-oriented materials.

Examples include ProofCapsule, SkillWal, Automark, Sup Wallet, Aegis Project, and several Walrus infrastructure entries such as zing-cdn or Coral.

### Hybrid

The most strategically interesting submissions are often hybrid:

- they have a protocol core;
- they expose an application surface for accessibility;
- and they sometimes add an SDK, skill, bot, or operator interface for integration.

Good examples of this hybrid shape include FlowGate, Phasis, TuskOS, WalDrive, Sup Wallet, and WALL·E.

From the public materials, the DeepBook, Walrus, and Agentic tracks appear to contain a higher share of explicit hybrid or infrastructure-heavy positioning, while DeFi & Payments contains a larger volume of application-first packaging around financial use cases.

PaperProof is best understood as protocol-first with hybrid delivery. The protocol layer is the durable core, while the official app, docs, blog, dataset pages, and skill-based workflows are access layers on top. That positioning matters here because many Overflow teams appear to be moving in the same general direction: not abandoning applications, but trying to make more of their value reusable across interfaces, agents, and downstream builders.

Another way to put it is that PaperProof treats application pages as views over protocol artifacts, not as the final home of the work. That is a useful lens for reading Overflow submissions, because many teams already have more than one "truth-shaped" surface: website copy, repo README, demo narration, package IDs, and architecture notes. A mature artifact layer helps those surfaces converge rather than drift apart.

## Track-by-Track Reading

## DeFi & Payments

The DeFi & Payments track has 162 rows, 42 mainnet-tagged entries, and strong public-link coverage. From a statistical perspective, that makes it a useful dataset for studying how teams describe deployment readiness, payment flows, financial primitives, and adjacent infrastructure.

Its category mix is dominated by `DeFi / payments`, which is not surprising, but the snapshot also contains smaller pockets of proof, audit, provenance, and AI workflow projects. That suggests the category is broad enough to absorb adjacent infrastructure work whenever teams can frame it in financial or payment terms.

For researchers, this dataset is useful for studying:

- how teams communicate product readiness in a financially legible category;
- how often public repos and demos are supplied when conversion or trust matters;
- how crowded the payments-plus-infrastructure narrative has become on Sui.

A second useful reading is to break the track into broad submission families. Based on the category and narrative patterns in the source file, the largest families include:

- direct payment and checkout products;
- credit, lending, or underwriting products;
- savings, treasury, and yield management tools;
- tokenization and asset-wrapping ideas;
- agent-assisted finance and policy-gated finance workflows.

Representative names include Payfrica, JustPay.wtf, ArcPay, Hongbao, Sui SafeSend, Suisend, BACKSTOP, Sweem, and FlowGate.

From a quality-analysis perspective, the track is uneven in a predictable way. The strongest entries tend to expose more than a landing page: package IDs, richer repositories, clearer deployment claims, or deeper architecture notes. The weaker entries often still show a valid product idea, but expose less evidence about implementation depth, security posture, or developer reusability.

## Special - DeepBook

The DeepBook snapshot is smaller at 136 rows and much more testnet-heavy. Only 6 entries are marked mainnet in the source snapshot, while 120 are testnet. That does not imply weakness. It more likely reflects the fact that exchange, market-structure, and execution-oriented projects often need more iteration before they can credibly claim a production posture.

The category mix is still led by `DeFi / payments`, but `DeepBook / trading` is much more visible here than in the broader tracks. That makes this dataset especially useful for looking at:

- trading and market design experiments;
- protocol-adjacent interfaces built around order books, routing, or prediction;
- the difference between general DeFi app language and market-structure language.

This is the most specialized of the four datasets in thematic terms. It is especially useful for focused analysis of exchange, liquidity, and market-structure design rather than broad ecosystem mapping.

The track also appears to subdivide into a few recognizable clusters:

- prediction-market access layers and simplified retail interfaces;
- DeepBook-native or DeepBook-adjacent trading infrastructure;
- vaults, hedging systems, and structured trading strategies;
- analytics, observability, explainers, and operator consoles.

Representative names include CallIt, QuickPredict, DeepPredict Chat, Skew, VolShape Studio, PredictOps, deepskew, Automark, and Phasis.

Quality in this track is often tied to whether a project can explain a real market primitive rather than only a UI wrapper. The more convincing entries tend to show how they compose with DeepBook, expose contract logic, or surface non-trivial trading or risk abstractions.

## Special - Walrus

The Walrus dataset is the largest snapshot in this group, with 223 project rows. It also has the highest word count in the source research note, which reflects how many different directions Walrus-related teams appear to be exploring.

What makes this track especially interesting is not only its size, but its composition. The summary shows a strong overlap between:

- `AI / agent workflow`;
- `Walrus storage tooling`;
- content, memory, or proof-oriented infrastructure.

This implies that Walrus is being framed not just as storage, but as an application primitive for higher-level systems. In practice, that means the dataset is useful for asking questions such as:

- how often teams pair storage with agents or memory systems;
- whether Walrus is being positioned as infrastructure, product feature, or ecosystem substrate;
- how much of the experimentation is aimed at long-lived artifacts rather than short-lived transactions.

Among the four tracks, this one offers the largest sample for studying how storage-native narratives are emerging on Sui.

The visible submission families here include:

- storage tooling and file-management interfaces;
- agent memory and long-term recall systems;
- artifact proof, provenance, and audit-trail systems;
- creator, publishing, and media surfaces backed by Walrus;
- hybrid application stacks where Walrus is one component inside a broader app.

Representative names include WalrusOS, mnemwal, WalForm, WalDrive, Polar, DoubleSync, indelible.Blob, zing-cdn, TuskScan, verity, TuskOS, MemWal Agent Memory, Coral, and toldproof.

This track is also the clearest place to observe the difference between "Walrus mentioned" and "Walrus-centered design." Some projects use Walrus as auxiliary storage. Others make Walrus the defining architectural primitive. That difference is important when evaluating how natively a project is aligned with the storage layer itself.

This distinction is especially important for PaperProof because it is not trying to be a website that merely uploads files to Walrus. Its thesis is that Walrus-backed content becomes much more valuable when it is lifted into a protocol artifact model with typed versions, official interactions, and reusable read paths for apps, SDKs, and agents. In that sense, the Walrus track is full of projects that could plausibly benefit from a stronger artifact layer even when storage is already present.

## The Agentic Web

The Agentic Web snapshot contains 159 rows and a wider spread of deployment states than DeepBook. It has 27 mainnet-tagged entries, 108 testnet entries, and 17 marked unknown. That wider uncertainty band is itself informative. Agentic products often present ambitious interaction models before deployment conventions fully settle.

The category summary suggests that the track is not purely AI agent in the narrow sense. It includes a substantial amount of DeFi-adjacent and application-facing work, alongside more direct agent workflow ideas. That makes the dataset useful for examining:

- how teams merge wallets, agents, and user trust boundaries;
- whether agentic is being used as a real architectural category or as a surface-level label;
- how many projects expose enough public materials for external evaluation.

This track is a strong lens for studying how new interaction models are being tested on top of existing crypto application patterns.

Broadly, the visible clusters here include:

- agent wallets and scoped execution systems;
- agent memory, recall, and knowledge systems;
- policy, consent, and risk-review layers for autonomous execution;
- skill, MCP, or tool-serving infrastructure;
- application copilots and operator consoles for humans supervising agents.

Representative names include Sup Wallet, Aegis, ProofCapsule, SkillWal, Say Ur Intent, SuiSoul, Sui Pump, Agent Policy Builder, and several wallet- or guardrail-oriented agent products.

Quality differences in this track often come down to control design. The more robust submissions usually say something concrete about approval boundaries, policy scope, replay protection, auditable execution, or verifiable memory. The weaker ones are more likely to stop at an AI assistant on top of crypto framing without showing how authority is actually constrained.

This is also where PaperProof's agent-facing direction becomes relevant. PaperProof does not treat AI as a magic frontend overlay; it treats prompts, memory descriptors, and official artifact context as structured protocol-adjacent objects that can be resolved by SDKs and skills without taking signing authority away from the user. That is not the only way to design agentic systems, but it offers a useful contrast with projects that foreground AI interaction while leaving the trust boundary implicit.

## Cross-Track Takeaways

Looking across all four datasets, a few broader conclusions emerge.

| Observation | Why It Matters |
|---|---|
| Public link coverage is consistently high | These tracks are unusually researchable because most entries expose repositories, demos, or websites |
| Mainnet presence varies sharply by track | Track positioning influences whether teams optimize for production claims or for experimentation |
| Category boundaries are porous | Tracks often contain adjacent narratives, not only their headline theme |
| Walrus and Agentic themes overlap strongly | Storage, memory, agents, and long-lived application state are increasingly being combined |
| Reusable dataset packaging changes the value of the research | Once the snapshot becomes a PaperProof Protocol artifact, it can be versioned, linked, verified, and reused by others |

Another important takeaway is that the four tracks are not only content buckets. They are different filters on product maturity and architectural emphasis.

- DeFi & Payments has the strongest visible production posture by mainnet count and branded-domain presence.
- DeepBook has the clearest specialization around market structure, but also the strongest testnet skew.
- Walrus has the widest thematic spread and the strongest concentration of storage-, memory-, and artifact-oriented experimentation.
- The Agentic Web is where interface design, policy design, and execution-control design become the main analytical questions.

Taken together, these four snapshots help explain why PaperProof's artifact model is more than cosmetic packaging. The ecosystem is producing code, datasets, docs, demos, release archives, research notes, agent skills, and long-lived public evidence across many surfaces. Without an artifact layer, that knowledge remains fragmented across repos, websites, videos, and storage links. PaperProof matters because it is explicitly designed to reduce that kind of fragmentation.

## Governance, DAO Design, and Protocol-Level Evolution

Another dimension worth making explicit is governance. A meaningful share of web3 projects talk about community, but far fewer expose a concrete governance surface that can evolve protocol rules over time. In the Overflow materials, governance is sometimes present as token-holder voting, sometimes as multi-sig or operator control, and sometimes not described at all in the public-facing submission materials.

For analytical purposes, it is useful to distinguish three cases:

1. no visible governance path beyond operator control;
2. community language is present, but the concrete contract or policy mechanism is unclear;
3. explicit on-chain governance or DAO machinery is part of the architecture.

This matters because governance changes what counts as a durable protocol. A product that can adjust fees, permissions, supported object classes, or operating parameters through a governed process is structurally different from a product that depends entirely on ad hoc operator updates.

PaperProof is relevant here not as an abstract comparison, but as a concrete example. PaperProof already uses protocol governance as part of its system model. Its governance layer is not only decorative signaling. It is designed to support real protocol decisions such as fee adjustment, enabling or disabling supported artifact types, authority transfers, and future protocol evolution through a DAO-oriented contract architecture on Sui mainnet.

That is an important distinction when comparing infrastructure-style projects. If a system wants to become a durable public artifact layer rather than a single operator-managed application, governance is not optional forever. It becomes part of the infrastructure story itself.

## Native Tokens, Economic Coordination, and Governance Rights

Token design should not be reduced to "does this project have a token." The more important question is what role the token plays inside the system.

Across the Overflow materials, token language appears in several recurring forms:

- speculative or launch-centered token narratives;
- reward or incentive coordination;
- protocol fee alignment;
- governance rights;
- vault, share, or position representation.

Many projects still do not make their token model explicit in public materials. That does not automatically mean no token exists, but it does mean the public-facing economic story is often incomplete.

PaperProof is again a useful counterexample because its native token has a concrete protocol role. PaperProof has `PPRF`, a native token already deployed on mainnet, and its primary role today is DAO governance. That makes the token legible as part of protocol coordination rather than only as an accessory to an application narrative.

This matters for interpretation. A token tied to governance can help explain how protocol rules evolve, how participation is coordinated, and how the community can influence long-term artifact infrastructure. It is a different kind of signal from a token that exists mainly to support launch attention or speculative circulation.

## Formal Verification, Contract Surface, and Trust Depth

Earlier in this article I treated contract depth and security signaling as a cross-track observation. It is worth extending that point because the difference between "has contracts" and "has serious contract discipline" is large.

Across the Overflow materials, most projects can at best be evaluated through a mix of package IDs, repos, architecture notes, and public claims. Only a smaller subset exposes strong assurance language such as:

- formal verification;
- explicit invariant design;
- proved capability boundaries;
- third-party audits;
- or detailed trust-surface analysis.

That gap is not unique to Overflow. It is common across emerging web3 ecosystems. But it matters when deciding which projects are trying to become durable infrastructure rather than only fast-moving apps.

PaperProof belongs in this discussion directly, not peripherally. PaperProof spans multiple mainnet packages and more than 10,000 lines of contract and test code across its protocol surface, and it has an explicit formal-verification workstream using Sui Prover. That makes it relevant whenever formal methods, assurance discipline, or deep contract surface is being used as an example of stronger trust signaling.

In other words, if we use examples of projects that expose stronger proof-oriented or assurance-oriented design discipline, PaperProof should be named alongside them where it fits. Omitting it from that category would create the false impression that it sits outside the same trust-depth conversation.

## PaperProof as a Comparative Example, Not an Outside Observer

One of your requested corrections is important at the methodological level: whenever a category or example set includes projects whose traits are also present in PaperProof, PaperProof should appear there too rather than being discussed only in a separate concluding paragraph.

That principle matters because otherwise the reader can incorrectly infer that PaperProof is merely the publication venue for this analysis rather than one of the projects whose protocol shape meaningfully intersects with several of the evaluation dimensions used in the article.

PaperProof belongs inside the comparative frame in several places:

- as a protocol-first or hybrid delivery project rather than a pure app;
- as a project with a native governance token;
- as a project with explicit DAO-oriented governance logic;
- as a project with formal-verification work using Sui Prover;
- as a project with multiple public access surfaces beyond one official website;
- as a project where typed datasets, reports, software releases, and long-form notes are first-class protocol objects.

That does not mean every section should become a PaperProof section. It means that when named examples are used, PaperProof should be included wherever it genuinely matches the structural category under discussion.

## NFT-Controlled Artifacts and a Future Artifact Market

Another strategic dimension worth surfacing is artifact ownership and transferability.

Many web3 projects think about NFTs primarily as collectibles, badges, access passes, or financial wrappers. But for artifact systems, NFTs can also serve a more infrastructural role: a transferable control object tied to a durable series of content.

This is highly relevant to PaperProof's trajectory. PaperProof's artifact model already makes a distinction between the content bytes, the artifact series identity, and the application layer that renders the artifact. Extending that model so that artifact control is represented through an NFT-compatible ownership surface creates a much larger design space.

Why this matters:

- artifact control can become legible as an asset rather than only as an app-local permission;
- existing Sui NFT wallet and marketplace infrastructure can be reused rather than reinvented;
- transferability can support secondary markets around high-value digital works, datasets, research archives, branded series, software-release lines, or culturally important artifacts;
- the resulting market is not merely a market for files, but a market for control over versioned, protocol-native artifact series.

That point is strategically important because it expands the economic story around artifact infrastructure. If an artifact can be governed, versioned, cited, and also transferred through NFT-compatible control primitives, the artifact layer starts to look more like a genuine digital asset substrate than a publishing convenience layer.

This is one reason PaperProof stands out in comparative analysis. It is not only trying to make files verifiable. It is moving toward a world in which knowledge objects, release histories, and long-lived digital works can become durable, governable, and market-compatible assets.

## What Gets Lost Without an Artifact Layer

It is worth being explicit about what usually breaks when ecosystem intelligence is left in ordinary web form only.

| If material lives only as scattered web surfaces | What tends to break later | What PaperProof helps preserve |
|---|---|---|
| Repo + website + slide deck + video | No stable unit of citation for the whole package | One artifact identity per published work, with version lineage |
| Static blog post or note | Updates overwrite context or fragment across follow-up posts | Add-version history and current-version clarity |
| Hosted files without explicit semantics | Outsiders can retrieve bytes but not confidently infer meaning | Typed artifact class and structured metadata |
| UI-only discovery | Agents and scripts must scrape pages or rely on brittle parsing | SDK- and indexer-readable object model |
| One operator-owned database | Future third parties depend on the original site staying alive and consistent | Protocol-visible state that independent apps can reconstruct |

This does not mean PaperProof removes all fragility. Storage still has economics, applications still matter, and quality still depends on the publisher. But it does mean that important ecosystem work no longer has to live only as an accidental bundle of links.

## Why Publishing These on PaperProof Protocol Matters

The main value is not just archival. It is structural.

If these materials remained private notes, static files, or short-lived posts, their usefulness would decay quickly. By publishing them as dataset artifacts on PaperProof Protocol, they become:

- linkable and discoverable through an artifact page;
- versionable if the underlying research is refreshed later;
- downloadable as a complete package rather than a single loose note;
- inspectable by humans and machines through both narrative and structured files;
- easier to reuse in follow-on blogs, dashboards, scouts, agents, or ecosystem studies.

That is a meaningful difference. PaperProof Protocol is not only a place to host content metadata. It is a protocol structure for turning research outputs into reusable digital artifacts.

That framing matters beyond this one blog post. Many Sui projects now need a durable home for things that are more structured than a tweet and more reusable than a PDF left in a repo: datasets, software releases, technical notes, benchmark results, prompt packages, governance evidence, and official knowledge pages. PaperProof's artifact model is designed for exactly this middle layer between raw storage and application-specific presentation.

It is also a better fit for how modern crypto projects actually work. Many teams already produce a trail of artifacts over time: launch notes, architecture diagrams, testnet updates, security notes, benchmark data, SDK packages, agent skills, and release bundles. Those materials are usually scattered because no single mainstream product treats them as one protocol-native family. PaperProof's six-type artifact model is valuable precisely because it gives that family a shared lifecycle without flattening everything into a single content format.

## Why This Matters To Different Readers

The value of these published datasets is not the same for every audience.

| Audience | What they likely want from the Overflow data | Why PaperProof is useful for them |
|---|---|---|
| Researchers and analysts | A stable corpus they can cite, compare, and revisit | Versioned datasets and downloadable structured packages |
| Builders | Concrete project references, package IDs, stack choices, and reusable patterns | Durable access to technical materials and future software-release companions |
| Investors and ecosystem teams | Signals about maturity, specialization, and design quality | Easier comparison across time without depending on one temporary dashboard |
| Agents and automation workflows | Machine-readable summaries, schemas, and stable references | Structured artifacts plus SDK/skill access paths |

That audience split is one reason PaperProof deserves more than a passing mention in this article. The protocol matters not only because these datasets were published on it, but because the same artifact package can now be consumed differently by humans, applications, and AI workflows without requiring a different truth source for each audience.

## Limits and Cautions

These datasets should be read carefully.

- They reflect public submission-facing information rather than private project performance.
- A high count does not imply higher quality.
- A mainnet label does not by itself validate security, traction, or product maturity.
- Category labels are useful summaries, but some projects naturally fit more than one category.
- Several of the deeper analytical dimensions in this post, such as technology stack, formal verification, audits, SDKs, skills, token design, or contract LOC, are sample-based observations from long-form public descriptions rather than uniformly structured fields across every entry.

In other words, these datasets are best used as research inputs, not as ranking outputs.

## Closing

The four Sui Overflow 2026 track datasets show a practical use case for PaperProof Protocol: taking ecosystem research that would otherwise remain fragmented, packaging it into a structured artifact, and giving it a stable on-protocol home.

For readers, the immediate benefit is simple: you can open a dataset page, inspect the metadata, and download the full package.

For researchers, builders, investors, and agent developers, the more interesting benefit is that the same material can now be cited, revisited, compared, and versioned without depending on a single temporary document link.

More broadly, these datasets also make a case for PaperProof itself. Much of what appears in Sui Overflow 2026 is ambitious but operationally fragmented: websites in one place, repos in another, videos elsewhere, structured data rarely preserved, and reusable context often left implicit. PaperProof is one answer to that problem. It turns project knowledge into artifacts with a protocol identity, so that future apps, indexers, researchers, and agents can resolve the same work without starting from scattered links every time.

If the Sui ecosystem keeps producing richer project surfaces, more agent tooling, more Walrus-backed content, and more protocol-adjacent research, the need for this kind of artifact layer should grow rather than shrink. In that sense, the Overflow datasets are not only about the projects they describe. They are also a concrete demonstration of the record-keeping problem PaperProof is meant to solve.
