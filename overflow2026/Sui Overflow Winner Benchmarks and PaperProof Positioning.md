# Sui Overflow Winner Benchmarks and PaperProof Positioning

This document summarizes past Sui Overflow winners, extracts patterns from the
winning projects, and compares those patterns with PaperProof's current
hackathon position.

PaperProof project account on X: <https://x.com/LabsPaperproof>

## Source Notes

Primary public sources:

- Sui Foundation, "Announcing the Sui Overflow Hackathon Winners", 2024:
  <https://blog.sui.io/2024-sui-overflow-hackathon-winners/>
- Sui Foundation, "Announcing the Sui Overflow 2025 Hackathon Winners", 2025:
  <https://blog.sui.io/2025-sui-overflow-hackathon-winners/>
- Sui Overflow 2026 official site:
  <https://overflow.sui.io/>
- Local 2026 track notes:
  `overflow2026/Walrus Track Problem Statement.md`
- Local 2026 track notes:
  `overflow2026/Agentic Web Problem Statement.md`

The official Sui blog pages are treated as the authoritative source for winner
names, tracks, placements, and short project descriptions. Some project links
have moved or become inactive, so this document focuses on project type,
winning signal, and relevance to PaperProof rather than link availability.

## Executive Summary

Past Sui Overflow winners usually scored well because they were not merely
"apps that use Sui." They made a Sui primitive central to the product:

- Move objects as accounts, assets, permissions, or game state.
- Sui PTBs as a user-visible workflow compiler.
- Walrus as verifiable data, storage, or publication infrastructure.
- Seal, zkLogin, randomness, or ZK as a real security or privacy feature.
- Developer tools that reduce friction for Sui builders.
- Consumer experiences where Sui is hidden behind a usable product loop.

PaperProof is strongest when presented as a verifiable data and agent-memory
protocol, not just as a publishing website. Its best track fit is likely
Walrus, with Agentic Web and Infra & DevX as secondary narratives.

PaperProof's main advantage is depth: it already has mainnet contracts, a TS
SDK, Walrus-backed artifacts, versioning, comments, governance, native Copilot
prompts, and a Copilot memory registry. Its main weakness is presentation: the
demo must become much easier to understand in 30-60 seconds.

## 2024 Winner Landscape

Sui Overflow 2024 had 352 submissions, 32 primary winners, eight tracks, and
strong participation from builders across 79 countries. The winning projects
showed a broad spread: consumer payments, DeFi, games, tooling, randomness,
zkLogin, and multichain infrastructure.

### Consumer and Mobile

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Pandora Finance | Prediction market | Simple consumer-facing market with voting incentives. |
| 2nd | stream.gift | Creator payments | Clear Web2 pain point: Twitch donations with fewer middlemen. |
| 3rd | AdToken | Advertising | Uses Sui object model for campaign state and fast settlement. |
| 3rd | Wave Wallet | Telegram wallet | Distribution-first wallet UX inside an existing social channel. |

Pattern: winners had an obvious user story. They did not require judges to
understand protocol architecture before understanding the product.

PaperProof implication: the product story should start with "prove and discuss
research/software artifacts with durable versions," not with contract modules.

### DeFi

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Hop Aggregator | Swap aggregation | Performance and better routing are direct user value. |
| 2nd | Aeon | Asset management | Custody and execution as a platform. |
| 3rd | Shio | MEV auctions | Sui-native market-structure primitive. |
| 3rd | Hakifi | Hedging/insurance | Risk mitigation with guided recommendations. |

Pattern: DeFi winners typically showed direct financial utility, routing,
capital efficiency, or risk management.

PaperProof implication: PaperProof should not try to look like DeFi. If entered
in Agentic Web, the relevant angle is risk-aware agent memory and verifiable
knowledge, not trading.

### Gaming

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | AresRPG | 3D MMORPG | Ambitious Web2-quality game using Sui as the sole database. |
| 2nd | Wagmi Kitchen | Onchain board game | Fully onchain game mechanics with wagering. |
| 3rd | Infinite Seas | MMO | Player trade, battle, diplomacy, and microtransactions. |
| 3rd | Shall We Move | Card games | Onchain fairness through randomness/encryption. |

Pattern: winning games either had strong visual appeal or a crisp onchain
fairness reason.

PaperProof implication: PaperProof needs a crisp visual demo path, even though
it is not a game. Judges reward projects they can see working.

### Infrastructure and Tools

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Kraken | Multisig ecosystem | Native and smart-contract multisig for teams and individuals. |
| 2nd | SuiGPT | Contract AI tooling | LLM-assisted decompilation, explanation, and contract support. |
| 3rd | BitsLab IDE | Move IDE | Out-of-box online Move development environment. |
| 3rd | SuiPass | Credentials | Onchain passport and interoperable credential layer. |

Pattern: tool winners reduced developer or user friction around Sui.

PaperProof implication: PaperProof's TS SDK, indexer story, artifact version
model, and Copilot prompt/memory registry can support an Infra & DevX story,
but the demo should show a concrete workflow, not only architecture.

### Advanced Move Features

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Promise | ZK quiz/ad engagement | Uses ZK to make interaction verifiable. |
| 2nd | Su Protocol | DeFi primitive | Capital-efficient protocol design. |
| 3rd | Sui Simulator | Dev tool | Read/call Sui contracts without CLI. |
| 3rd | Sui Metadata | Move library | Generic metadata storage/retrieval primitive. |

Pattern: judges rewarded projects that made Move/Sui capabilities visible.

PaperProof implication: PaperProof's Move side should be shown through actual
object flows: artifact series, version objects, comments trees, governance,
prompt registry, memory registry.

### Multichain, Randomness, zkLogin

Representative winners:

- Sui NTT: Wormhole NTT implementation on Sui.
- Wormhole Kit: React integration for Wormhole bridging.
- Sui dApp Starter: project scaffold using Sui randomness.
- BioWallet: biometric hardware wallet flow.
- PinataBot: Telegram trading bot using zkLogin.
- LiquidLink: universal social profile and growth layer.

Pattern: these tracks rewarded specific Sui ecosystem primitives. The product
needed to make the primitive unavoidable.

PaperProof implication: for 2026, PaperProof should make Walrus and Sui object
identity unavoidable in the demo. If the app could be rebuilt as a normal
database app with no loss, the story is weak. If versioned artifacts, verifiable
content, and agent memory provenance depend on Sui/Walrus, the story is strong.

## 2025 Winner Landscape

Sui Overflow 2025 had 599 project submissions, 36 primary winners across nine
tracks, and a broader emphasis on AI, storage, payments, privacy, and consumer
experience. AI was the second most popular track, and Walrus-sponsored
Programmable Storage became a clear theme.

### AI

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Suithetic | Verifiable synthetic data | LLM-generated structured datasets stored onchain with marketplace utility. |
| 2nd | OpenGraph | Decentralized ML data | Users can build, verify, and deploy ML models on Sui and Walrus. |
| 3rd | RaidenX | DeFAI data layer | AI-enabled trading data layer and safer UX for Sui trading. |
| 4th | Hyvve | AI data marketplace | Incentivized dataset sourcing, verification, and monetization. |

Pattern: AI winners were data-centric, not just chatbots. They turned AI
outputs, datasets, or agent actions into verifiable assets.

PaperProof implication: PaperProof's strongest AI story is not "Copilot chat."
It is "AI prompts, memory descriptors, and artifact knowledge become versioned,
verifiable protocol objects."

### Cryptography

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | ZeroLeaks | Whistleblowing | Anonymous, verifiable document sharing with ZK, Seal, and Walrus. |
| 2nd | Shroud | Confidential trading | ZK confidential swaps with auditability. |
| 3rd | Sui Sentinel | AI security game | AI-vs-AI token defense with secure compute. |
| 4th | Sui Shadow | Confidential art | Encrypted NFT reveal using Seal and zkLogin. |

Pattern: privacy and verification were rewarded when tied to a real use case.

PaperProof implication: PaperProof can optionally strengthen its privacy story
around Copilot memory: private memory in MemWal/Walrus, public registry only for
discovery, and future Seal-based privacy.

### DeFi

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Magma Finance | Yield abstraction | Modular vaults with AI rebalancing and capital routing. |
| 2nd | Pismo Protocol | Perpetuals | Unified account model and Move-native account objects. |
| 3rd | MizuPay | BTC-backed payments | BTC collateral to stablecoin and payment flows. |
| 4th | Kamo Finance | Yield trading | Tokenized yield and time-decay AMM. |

Pattern: DeFi winners made Move-native account/asset structures central.

PaperProof implication: if PaperProof enters Agentic Web, avoid looking like a
generic AI wrapper. The "Sui-specific" reason must be visible: object-scoped
artifact identity, PTB flows, governance checks, and verifiable memory registry.

### Degen

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | MoonBags | Token launchpad | Fee-sharing launch mechanics that turn launch activity into user incentives. |
| 2nd | Kensei | Social/governance layer | Community forums, bonding curves, staking, and AI agents for token communities. |
| 3rd | MFC.CLUB | Memecoin launchpad | Gamified token creation and competition. |
| 4th | Objection! AI | AI identity game | Courtroom-style game where players stake on human-vs-AI identity. |

Pattern: Degen winners translated crypto-native behavior into simple,
shareable loops. They were not necessarily protocol-deep, but they were easy to
explain and had strong community hooks.

PaperProof implication: PaperProof should not become a degen product, but it
can borrow the clarity of a shareable loop: publish, verify, discuss, ask
Copilot, and share the artifact.

### Entertainment and Culture

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | GiveRep | Social reputation | AI and blockchain to reward valuable X contributions. |
| 2nd | SWION | Onchain visualization | Turns onchain activity into an immersive visual experience. |
| 3rd | Exclusuive | NFT customization | Modular NFTs, Kiosk, no-code creator tools, real-world deployment. |
| 4th | Numeron | AI RPG | Fully onchain AI-powered RPG. |

Pattern: judges rewarded projects that made blockchain feel tangible and
social.

PaperProof implication: PaperProof's X account matters. A better public demo
could connect PaperProof artifacts, discussions, and X distribution. But social
distribution should support the protocol story, not replace it.

### Explorations

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | Suibotics | Robotics coordination | Hardware, AI, and Sui smart contracts. |
| 2nd | Skepsis | Prediction market | Staked forecasting and measurable collective belief. |
| 3rd | PactDa | Agreements | Smart-contract agreements with zkLogin and escrow. |
| 4th | PredictPlay | Entertainment markets | AMM-driven cultural prediction markets. |

Pattern: exploratory winners still had a concrete demo loop.

PaperProof implication: PaperProof is conceptually deep; it must avoid feeling
like a whitepaper. The demo should be one coherent artifact lifecycle.

### Infra and Tooling

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | SuiSQL | Decentralized SQL | Indexes, joins, filters, and SQL-like access for Sui/Walrus data. |
| 2nd | Sui Provenance Suite | Deployment provenance | Verifiable code deployment and origin tracing. |
| 3rd | Suipulse | Data streaming | Low-latency data stream protocol. |
| 4th | Noodles.FI | Analytics/action | Discovery plus one-click strategy execution. |

Pattern: the best Infra projects solved a developer pain and could be explained
as a missing layer.

PaperProof implication: PaperProof can be framed as "a verifiable artifact and
agent knowledge layer for Sui/Walrus." That is a strong missing-layer story,
but it needs a concise demo.

### Payments and Wallets

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | PIVY | Stealth payments | Self-custodial payment links with stealth addresses. |
| 2nd | Sui Multisig | Wallet tooling | CLI-first multisig management. |
| 3rd | SeaWallet | Programmable wallet | Smart-contract wallet with protection and inheritance. |
| 4th | Coindrip | Token streams | Programmable token distribution. |

Pattern: wallet/payment winners simplified a painful financial action.

PaperProof implication: wallet UX is not PaperProof's strongest area. The app
should minimize signatures, hide internal parameters, and make each PTB
understandable.

### Programmable Storage

| Placement | Project | Category | Winning Signal |
| --- | --- | --- | --- |
| 1st | SuiSign | Document signing | Sui + Walrus for file upload, signer definition, and verifiable signatures. |
| 2nd | WalGraph | Graph database | Sui/Walrus graph database with JSON-LD and CRUD operations. |
| 3rd | SuiMail | Wallet-native email | Decentralized email with pay-to-send spam control. |
| 4th | Walpress | Site builder | Decentralized website builder on Walrus with SuiNS and templates. |

Pattern: storage winners did not merely upload files. They added structure,
workflow, identity, or verifiability around stored data.

PaperProof implication: this is the most relevant historical benchmark. A
PaperProof artifact is not just a Walrus blob; it is a versioned object with
identity, comments, governance, and agent-readable context.

## Detailed Winner Profiles

This section expands the winner tables into project-level notes. The goal is to
make each benchmark easier to compare against PaperProof.

### 2024 Consumer and Mobile

**Pandora Finance**  
A decentralized prediction-market product where users vote on future outcomes.
Its strength was a clear consumer loop: choose an event, express a view, and get
incentivized for participation. PaperProof can borrow the clarity of this loop:
users should immediately understand what they can publish, verify, or discuss.

**stream.gift**  
A Twitch-focused donation product using Sui as a payment layer to reduce
middleman costs. Its strength was distribution through an existing creator
platform. PaperProof can learn from this by connecting artifacts to external
sharing channels such as X, without making the social layer the protocol core.

**AdToken**  
A decentralized advertising solution for advertisers and affiliates, using
Sui's object model for campaign management and fast confirmations. Its strength
was mapping a real business workflow onto Sui objects. PaperProof has a similar
opportunity with artifact objects, version objects, comments, prompts, and
memory entries.

**Wave Wallet**  
A Telegram-based Sui wallet with investment tools. Its strength was putting
wallet functionality inside a familiar user environment. PaperProof should
borrow the lesson of hiding complexity: users should not need to understand
registry internals before using Copilot memory or artifact verification.

### 2024 DeFi

**Hop Aggregator**  
A swap aggregator focused on better routes and faster trade execution. Its
strength was immediate measurable value. PaperProof's equivalent measurable
value should be "can I verify this artifact and its latest version quickly?"

**Aeon**  
A custody-led digital asset service platform that integrates execution and
asset management. Its strength was packaging multiple financial operations into
one coherent interface. PaperProof can borrow this packaging discipline for
artifact lifecycle operations.

**Shio**  
An MEV auction platform for transaction ordering on Sui. Its strength was
building market-structure infrastructure that is meaningful specifically on a
high-performance chain. PaperProof's analogous infrastructure claim is
verifiable artifact and agent-context infrastructure.

**Hakifi**  
A decentralized hedging and insurance companion that helps users select assets
and receive coverage recommendations. Its strength was risk explanation for
users. PaperProof can apply this to Copilot: explain artifact state, PTB risk,
and memory/privacy boundaries in plain language.

### 2024 Gaming

**AresRPG**  
A 3D open-world MMORPG using Sui as its sole database while onboarding Web2
players through a familiar game experience. Its strength was ambition plus a
visible product. PaperProof should not hide behind protocol depth; it needs a
visible artifact experience.

**Wagmi Kitchen**  
A fully onchain cooking-themed board game where players wager while collecting
ingredients and serving meals. Its strength was a complete gameplay loop.
PaperProof can borrow the lesson that every demo should have a beginning,
middle, and end.

**Infinite Seas**  
An MMO with trading, battle, diplomacy, microtransactions, and player-to-player
transactions. Its strength was a world with multiple interactions. PaperProof's
world is smaller, but it can still show multiple artifact interactions:
publish, version, comment, verify, and ask Copilot.

**Shall We Move**  
A poker-style card-game implementation with onchain dealing, shuffling, hiding,
encryption, and randomness for fairness. Its strength was a clear fairness
reason for going onchain. PaperProof's equivalent is provenance and version
fairness: users should know exactly which artifact version they are seeing.

### 2024 Infrastructure and Tools

**Kraken**  
A multisig ecosystem with native and smart-contract multisig mechanisms for
teams and individuals. Its strength was identity, control, and workflow
coordination. PaperProof can borrow this for governance-aware registries and
operator-controlled official prompt/memory availability.

**SuiGPT**  
An LLM tool for decompiling, beautifying, and explaining Sui contracts, plus
chatbot/community support. Its strength was AI as a developer assistant.
PaperProof's Copilot should be positioned as an artifact and protocol-state
assistant, not just a generic chat window.

**BitsLab IDE**  
A browser-based Move development environment with tutorials and plugins. Its
strength was reducing setup friction. PaperProof's SDK and static app should
make artifact integration similarly low-friction for developers.

**SuiPass**  
An onchain passport combining credentials and security services for
interoperable access. Its strength was standardized identity and credential
data. PaperProof can borrow the registry pattern: official artifact, prompt,
and memory capabilities should be discoverable by other tools.

### 2024 Advanced Move Features

**Promise**  
A ZK quiz and ad-engagement platform. Its strength was making engagement
verifiable rather than merely interactive. PaperProof can borrow the idea that
user interactions around knowledge should produce verifiable records.

**Su Protocol**  
A capital-efficient DeFi design that shifts volatility from risk-averse users
to risk-seeking users rather than relying only on over-collateralization. Its
strength was a novel protocol mechanism. PaperProof's protocol mechanism is
artifact identity plus version lineage plus governed agent context.

**Sui Simulator**  
A developer tool for reading and calling Sui contracts without the CLI. Its
strength was lowering developer friction. PaperProof can borrow this by making
artifact and registry inspection possible from the app, not only from a CLI.

**Sui Metadata**  
A Move library for storing, retrieving, and managing primitive data chunks
without depending on predefined structs. Its strength was being a reusable
primitive. PaperProof should make its artifact and prompt/memory registry model
feel reusable by other apps.

### 2024 Multichain

**Sui NTT**  
The Sui implementation of Wormhole Native Token Transfer for fungible and
non-fungible cross-chain assets. Its strength was ecosystem integration.
PaperProof can borrow the importance of compatibility: artifacts and memory
descriptors should be easy for other agents or apps to resolve.

**Wormhole Kit**  
A React library for integrating Wormhole bridging into apps. Its strength was
developer convenience. PaperProof's TS SDK can play a similar role for
verifiable artifact publishing and reading.

**SuiWalletBot**  
A Telegram bot for Sui wallet management, Wormhole transfers, and DeFi
positions. Its strength was meeting users where they already are. PaperProof's
X account and shareable artifact links can play a similar distribution role.

**Multichain Meme Creator**  
A no-code meme creation and cross-chain swap platform. Its strength was
removing developer requirements. PaperProof should remove user requirements to
know Walrus blob IDs, descriptor IDs, or package IDs.

### 2024 Randomness

**Sui dApp Starter**  
A full-stack scaffold for projects using Sui randomness, with network and
transaction tooling. Its strength was accelerating builders. PaperProof can
borrow this by adding integration examples and an SDK quickstart.

**BioWallet**  
A hardware-wallet-like experience using biometrics, multisig, and WebAuthn to
avoid seed-phrase friction. Its strength was onboarding and safety. PaperProof
should aim for similarly low-friction memory and wallet flows.

**SuiAutochess**  
An onchain auto-battle game using Sui native randomness for transparent,
secure gameplay. Its strength was making randomness visible as a fairness
feature. PaperProof should make content hashes, versions, and comments visible
as trust features.

**HexCapsule**  
A timelock-encryption project using Drand and Move-generated keys for delayed
decryption. Its strength was a precise cryptographic use case. PaperProof's
privacy claims should be similarly precise: public artifact facts, private
memory body, public discovery metadata.

### 2024 zkLogin

**PinataBot**  
A Telegram trading bot using zkLogin for user-friendly Sui asset trading. Its
strength was Web2-style onboarding. PaperProof can borrow this principle by
keeping wallet and memory operations simple and staged.

**LiquidLink**  
A universal social profile for Sui, with leaderboards and referral programs.
Its strength was social growth mechanics. PaperProof should use social sharing
for artifact visibility, while keeping verifiable artifact identity as the core.

**Webauth on Sui**  
A zkLogin and WebAuthn demonstration that improves ephemeral key security. Its
strength was combining primitives for a safer login flow. PaperProof can borrow
the "composition of primitives" story: Sui objects, Walrus, MemWal, prompts,
and governance each do one part.

**Aalps Protocol**  
A "real-time Reddit for commodities" that uses zkLogin and supplier
verification/data-access mechanisms. Its strength was combining domain data
with access control. PaperProof can borrow the idea of domain-specific artifact
communities, especially for research, software releases, datasets, or reports.

### 2025 AI

**Suithetic**  
A platform for generating structured, verifiable synthetic data with LLMs,
storing it onchain, and creating a dataset marketplace. Its strength was
turning AI output into a structured, verifiable asset. PaperProof should frame
Copilot prompts and artifact context the same way: as versioned knowledge
assets, not ephemeral chat messages.

**OpenGraph**  
A decentralized data-management system for building, verifying, and deploying
machine-learning models on Sui and Walrus. Its strength was combining model
workflows with verifiable data infrastructure. PaperProof can borrow this
agent/data infrastructure framing for artifacts and memory.

**RaidenX**  
A DeFAI data layer for AI-enabled trading apps and agents, designed to lower UX
barriers and improve safety. Its strength was AI plus safer action. PaperProof
can use Copilot to make PTBs, artifact provenance, and governance state safer
to understand.

**Hyvve**  
A token-incentivized data marketplace for sourcing, verifying, and monetizing
AI-ready datasets. Its strength was incentives around data quality. PaperProof
can borrow the quality narrative: versioned artifacts and comments create
verifiable knowledge quality signals.

### 2025 Cryptography

**ZeroLeaks**  
A ZK-powered whistleblowing platform for anonymous, verifiable document sharing
with Seal, Walrus, and end-to-end encryption. Its strength was a high-stakes
privacy use case. PaperProof should be careful and explicit about public versus
private information, especially for Copilot memory.

**Shroud**  
A privacy-first trading protocol using ZK proofs for confidential swaps while
preserving auditability and compliance tooling. Its strength was balancing
privacy and accountability. PaperProof can borrow this balance for memory:
private memory body, public capability metadata.

**Sui Sentinel**  
An AI-versus-AI token-defense platform where defender agents protect tokens
from prompt attacks and attackers attempt to break them. Its strength was
turning AI security into a visible game. PaperProof can borrow the visibility
lesson: prompt governance and memory safety should be demonstrable.

**Sui Shadow**  
A confidential art marketplace where artists encrypt and mint hidden NFT tiles
using Seal and zkLogin for suspenseful reveals. Its strength was a tangible
privacy experience. PaperProof could later use Seal to create tangible private
review, embargo, or memory-access experiences.

### 2025 DeFi

**Magma Finance**  
A programmable yield abstraction layer unifying staking, lending, and LP
strategies with AI-powered rebalancing. Its strength was bundling many DeFi
actions into a user-facing optimization layer. PaperProof can borrow the
orchestration idea for artifact workflows.

**Pismo Protocol**  
A composable perpetuals exchange using a unified account model, shared LP base,
and Move-native account objects. Its strength was composability through native
objects. PaperProof's artifact series and memory entries should be presented as
similarly composable objects.

**MizuPay**  
A BTC-backed stablecoin and payment flow using LBTC collateral, staking, and
USDC payouts. Its strength was connecting crypto collateral to real-world
payment utility. PaperProof can borrow the "bridge to real utility" lesson:
verifiable artifacts should map to real research, code, reports, and datasets.

**Kamo Finance**  
A permissionless yield-trading protocol with tokenized yield, time-decay AMM,
and ve(3,3)-style incentives. Its strength was a complete mechanism. PaperProof
should make its mechanism complete too: content, version, comments, governance,
Copilot context.

### 2025 Degen

**MoonBags**  
A Sui token launchpad that shares fees during bonding curve and post-listing
phases. Its strength was direct creator/trader incentives. PaperProof can
borrow the immediacy of incentives, but apply it to credibility and discovery
rather than speculation.

**Kensei**  
A community layer with token-based forums, bonding curves, Wormhole-enabled
staking, and AI agents for token communities. Its strength was combining
community tools and AI agents. PaperProof can borrow the idea of an artifact
community around each paper, report, dataset, or software release.

**MFC.CLUB**  
A gamified memecoin launchpad for token creation and competition. Its strength
was reducing the token-creation flow into a game-like product. PaperProof can
borrow the flow simplicity without adopting the degen tone.

**Objection! AI**  
An Ace Attorney-inspired courtroom game where players cross-examine opponents
to determine whether they are human or AI, with SUI staking and rewards. Its
strength was a memorable demo. PaperProof needs an equally memorable artifact
and Copilot demo moment.

### 2025 Entertainment and Culture

**GiveRep**  
A social reputation and rewards platform for meaningful X engagement, using AI
and blockchain to surface quality contributions. Its strength was social
visibility. PaperProof can use its X account to showcase artifact publishing
and Copilot memory as short, shareable clips.

**SWION**  
A visual, immersive representation of onchain activity through an underwater
garden metaphor. Its strength was making abstract blockchain state feel
tangible. PaperProof should make artifact state visually legible.

**Exclusuive**  
A modular NFT customization and distribution platform using Sui Kiosk, no-code
creator tools, and real-world campus deployment. Its strength was real user
context. PaperProof should prepare real sample artifacts rather than purely
synthetic placeholders.

**Numeron**  
A fully onchain AI-powered RPG using smart contract logic and Dubhe Engine. Its
strength was combining AI with an interactive onchain world. PaperProof can
borrow the "AI inside a verifiable stateful world" framing.

### 2025 Explorations

**Suibotics**  
An exploration of physical machine-to-machine coordination with hardware, AI,
and Sui smart contracts. Its strength was frontier ambition plus concrete
hardware. PaperProof is less hardware-oriented, but similarly ambitious in
connecting AI and verifiable state.

**Skepsis**  
A decentralized prediction market where users stake on probabilistic outcomes.
Its strength was converting belief into measurable onchain signals. PaperProof
can convert knowledge trust into measurable signals through versions, comments,
and citations.

**PactDa**  
A smart-contract agreement platform with zkLogin onboarding, SUI escrow, and
multichain support. Its strength was turning agreements into enforceable
objects. PaperProof turns artifacts and comments into durable protocol objects.

**PredictPlay**  
A gamified entertainment prediction market using AMM pricing and fast onchain
settlement. Its strength was combining cultural topics with finance-like
mechanisms. PaperProof can borrow cultural accessibility for blog/forum
surfaces while staying protocol-centered.

### 2025 Infra and Tooling

**SuiSQL**  
A SQL-like library and toolset for decentralized databases on Sui and Walrus,
including indexes, joins, and filters. Its strength was making decentralized
data queryable. PaperProof's indexer should aim for the same: make artifact and
comment data easy to query.

**Sui Provenance Suite**  
A full-stack toolkit for verifiable code deployment and origin tracing. Its
strength was supply-chain provenance. PaperProof overlaps strongly here:
software release artifacts and version lineage can become a general provenance
layer.

**Suipulse**  
A high-performance data-streaming protocol on Sui with sub-second latency and
enterprise security. Its strength was speed and reliability for data feeds.
PaperProof's equivalent need is fast, reliable artifact discovery through an
indexer.

**Noodles.FI**  
A platform combining deep analytics and one-click strategies for discovering
and acting on Sui opportunities. Its strength was analysis plus execution.
PaperProof Copilot should similarly combine explanation plus safe next actions.

### 2025 Payments and Wallets

**PIVY**  
A self-custodial payment toolkit using stealth addresses and payment links to
protect user identity. Its strength was privacy through a simple payment UX.
PaperProof should keep privacy claims simple and specific for memory.

**Sui Multisig**  
A CLI-first multisig management tool with an optional lightweight UI. Its
strength was serving serious operators. PaperProof governance and operator
actions should be similarly operator-friendly, even if hidden from normal users.

**SeaWallet**  
A programmable smart-contract wallet on top of Slush, using layered access
control and inheritance for assets. Its strength was programmable asset safety.
PaperProof could later use policy objects for agent-limited actions or official
operator permissions.

**Coindrip**  
A programmable token-streaming protocol for linear, cliff-based, or custom
payouts. Its strength was turning distribution into a reusable primitive.
PaperProof can aim for artifact publishing/versioning as a reusable primitive.

### 2025 Programmable Storage

**SuiSign**  
A decentralized document-signing platform using Sui and Walrus for file upload,
signer definition, and verifiable onchain signatures. It is the closest
benchmark to PaperProof's document/artifact direction. PaperProof should learn
from its simple document workflow and make artifact verification equally clear.

**WalGraph**  
A decentralized graph database combining onchain storage, JSON-LD
serialization, and CRUD operations. Its strength was structured data over raw
storage. PaperProof should emphasize structure: artifact series, versions,
comments, prompt artifacts, and memory descriptors.

**SuiMail**  
A wallet-native decentralized email protocol with pay-to-send spam control.
Its strength was communication plus storage plus economic filtering. PaperProof
can borrow the idea of comments as structured communication around durable
artifacts.

**Walpress**  
A decentralized site builder for censorship-resistant websites on Walrus, with
SuiNS integration and a creator/template marketplace. Its strength was turning
Walrus into a usable publishing surface. PaperProof can borrow this by making
artifact publishing feel like a polished content workflow, not a storage demo.

### Additional Award Signals

Community Favorite and University Award winners matter because they show that
Sui Overflow also rewards public clarity, student creativity, and community
excitement. For PaperProof, the practical lesson is:

- publish short public updates from <https://x.com/LabsPaperproof>;
- prepare a simple demo video;
- make the website understandable without a live explanation;
- use concrete sample artifacts rather than abstract protocol placeholders.

## Cross-Year Winner Patterns

### Pattern 1: A Clear Product Loop Beats Abstract Protocol Depth

Winning projects usually had a simple loop:

- Upload and sign a document.
- Execute a swap.
- Build and deploy a model.
- Play a game.
- Create a site.
- Use a wallet.

PaperProof's loop should be:

1. Publish or open a verifiable artifact.
2. Inspect its version, Walrus commitment, and comments.
3. Ask Copilot to explain the artifact and protocol state.
4. Show that Copilot prompt and memory are themselves protocol-governed.

### Pattern 2: Sui Must Be Essential

The winning story is weak if Sui is only a payment rail. It is strong when Sui
objects, PTBs, Move ownership, governance, zkLogin, Seal, Walrus, or DeepBook
are structurally required.

PaperProof's Sui-native elements:

- Artifact series and version objects.
- Comments tree and interaction objects.
- Governance-controlled registries.
- Prompt registry and memory registry.
- PTB-based publishing, versioning, commenting, and registry operations.

### Pattern 3: Walrus Winners Add Semantics to Storage

SuiSign, WalGraph, SuiMail, and Walpress all made stored data part of a larger
workflow. PaperProof should do the same:

- Walrus stores content.
- Sui records identity, version lineage, and registry state.
- The app and SDK make the content inspectable and actionable.
- Copilot uses protocol-native prompts and private memory to interpret the
  artifact context.

### Pattern 4: AI Winners Are About Verifiable Data and Agent State

The 2025 AI winners leaned toward data, verification, and agent infrastructure.
This aligns well with PaperProof if the project emphasizes:

- protocol-native prompts;
- versioned AI memory descriptors;
- durable artifact context;
- agent memory backed by MemWal/Walrus;
- governance controls over official prompt and memory capabilities.

### Pattern 5: UX Must Hide Protocol Internals

Past winners often made hard primitives feel simple. PaperProof currently has
deep protocol machinery, but the demo should not expose internal IDs unless the
judge asks.

For the app:

- Hide descriptor artifact code and series ID from normal users.
- Auto-read active memory entry from chain by wallet address.
- Reduce signatures by merging compatible Move calls into one PTB.
- Show human-readable transaction previews.
- Keep developer details in an Advanced section.

## Lessons PaperProof Should Borrow From Past Winners

This section converts the benchmark patterns into concrete lessons for
PaperProof. The goal is not to imitate any single winner, but to borrow the
judging signals that repeatedly appeared across 2024 and 2025.

### 1. Borrow the "one obvious loop" discipline from consumer winners

Consumer and mobile winners such as stream.gift, Wave Wallet, PinataBot, and
PIVY were easy to understand because the user action was obvious. PaperProof
should make its first demo loop equally simple:

1. Open or publish a knowledge artifact.
2. Verify its version and Walrus-backed content.
3. Discuss it through comments.
4. Ask Copilot to explain the artifact and protocol state.
5. Show that Copilot's prompt and memory are also governed protocol objects.

Practical implication:

- The first screen should not require users to understand package IDs,
  descriptor IDs, registry IDs, or Move modules.
- The demo should start from a prepared artifact, not from an empty dashboard.
- The "why this matters" message should be visible before the user opens an
  Advanced panel.

### 2. Borrow the "Sui is structurally necessary" test from technical winners

Advanced Move, DeFi, zkLogin, randomness, and Infra winners generally made a
specific Sui primitive central to the product. PaperProof should pass the same
test:

> If Sui were removed, what would break?

Strong answers for PaperProof:

- artifact identity would lose object-level ownership and lineage;
- versions would become ordinary database rows instead of verifiable objects;
- comments and interaction objects would lose composability;
- prompt and memory registries would lose governance-aware availability;
- PTBs would no longer provide user-signable workflow composition.

Practical implication:

- The pitch should explicitly say "Sui object identity and PTBs are what make
  this more than a file hosting app."
- The demo should show at least one object explorer link or raw object view, but
  only after the user-facing loop is clear.
- Copilot should be positioned as a Sui-aware agent interface, not a generic
  chatbot bolted onto a website.

### 3. Borrow the "storage plus workflow" lesson from Programmable Storage

SuiSign, WalGraph, SuiMail, and Walpress did not win just because they used
Walrus. They wrapped storage in a workflow: signing, graph querying, messaging,
or site publishing.

PaperProof's equivalent workflow is:

- Walrus stores durable content.
- Sui records the artifact identity, version lineage, and official references.
- The app presents the artifact as a readable, discussable object.
- Copilot turns artifact state into agent-readable context.
- Governance controls official prompts and memory capability availability.

Practical implication:

- PaperProof should avoid saying "we store files on Walrus" as the main claim.
- The stronger claim is "we turn Walrus content into verifiable knowledge
  artifacts with versions, comments, governance, and agent context."
- A polished artifact detail page is more important than adding another raw
  upload option.

### 4. Borrow the "AI data, not chatbot" lesson from 2025 AI winners

Suithetic, OpenGraph, Hyvve, and RaidenX were AI-related, but their winning
signal was data infrastructure, verification, or agent utility. PaperProof
should avoid looking like a chat UI with a blockchain logo.

PaperProof's AI-native assets:

- native Copilot prompts as versioned PaperProof artifacts;
- wallet-linked MemWal memory;
- memory registry for official discovery and availability;
- durable artifact context for agent reasoning;
- governance controls that can approve, disable, or version official AI
  capabilities.

Practical implication:

- The demo should explicitly show a prompt loaded from a PaperProof artifact.
- "Update Memory" should feel like durable agent continuity, not a gimmick.
- The judge should leave with the phrase: "PaperProof makes AI context
  verifiable and portable."

### 5. Borrow the "privacy has boundaries" lesson from cryptography winners

Cryptography winners such as ZeroLeaks, Shroud, and Sui Shadow showed privacy
as a product boundary, not as a buzzword. PaperProof should be precise:

- public artifacts are meant to be verifiable and durable;
- private Copilot memory belongs in MemWal/Walrus and is not stored directly in
  PaperProof registry objects;
- the public registry should expose discovery and availability metadata, not the
  memory body;
- future Seal integration can strengthen private memory and selective access.

Practical implication:

- Add one sentence in the demo or README explaining what is public and what is
  private.
- Do not overclaim privacy until Seal or another privacy layer is implemented.
- Make "delete memory entry" clearly mean chain-level tombstone, not deletion of
  the underlying Walrus/MemWal data.

### 6. Borrow the "developer missing layer" framing from Infra winners

Infra winners such as SuiSQL, Sui Provenance Suite, SuiGPT, BitsLab IDE, and
Sui Simulator solved a missing layer for builders. PaperProof can present a
similar missing-layer story:

> Sui and Walrus have objects and storage. PaperProof adds artifact identity,
> version lineage, comments, governance, and agent-readable context.

Practical implication:

- Keep the SDK visible in the submission materials.
- Include a small code snippet showing how another app resolves an artifact,
  reads the latest version, or verifies an event.
- Mention the indexer as a path to production-grade browsing, but do not make it
  the main demo dependency unless it is stable.

### 7. Borrow the "signature minimization" lesson from wallet/payment winners

Wallet and payment winners made sensitive actions feel simple. PaperProof has
multiple Sui and Walrus actions, so signature count matters.

Recommended UX rule:

- Create Memory: one Sui signature when using the official descriptor.
- Delete Memory: one Sui signature.
- Update Memory: no Sui signature if it only writes MemWal private memory.
- Walrus descriptor updates: keep reserve/register/upload separate from
  certify, but merge compatible certify + PaperProof add-version + registry
  update calls into one PTB where possible.

Practical implication:

- Avoid asking users to sign three times without explaining why.
- Use PTBs to merge compatible Move calls.
- Show short action labels such as "Create memory entry" or "Publish version,"
  not raw function names.

### 8. Borrow the "public proof of life" lesson from social winners

Entertainment, culture, and consumer winners often had a public surface that
made the project feel alive. PaperProof already has an X account:
<https://x.com/LabsPaperproof>.

Practical implication:

- Post short clips of artifact publishing, Copilot prompt loading, and memory
  creation.
- Use one consistent tagline across X, README, demo video, and website.
- Pin a concise demo thread before submission.
- Use X as distribution, but keep the core value anchored in verifiable
  artifacts.

### 9. Borrow the "judge-safe fallback" lesson from complex demos

Projects that depend on live RPC, AI APIs, wallets, and storage can fail for
reasons outside the protocol. PaperProof should prepare a fallback.

Practical implication:

- Keep at least one pre-published artifact ready.
- Keep a known working AI provider configuration.
- Prepare screenshots or a short video for Copilot memory if MemWal or model
  endpoints are slow.
- Cache or pre-index enough data for the demo route to load quickly.
- Include explorer links for all critical mainnet objects.

### 10. Borrow the "do less, finish better" lesson from polished winners

Past winners often looked narrow but complete. PaperProof has enough features;
the next advantage comes from polish, not breadth.

Do next:

- one excellent artifact page;
- one excellent Copilot explanation flow;
- one clean memory create/update/delete flow;
- one concise "why Sui/Walrus" page;
- one short demo video;
- one judge-friendly README.

Do not prioritize next:

- adding more artifact types;
- exposing more governance internals;
- adding more memory configuration fields;
- expanding forum/blog before the artifact and Copilot demo are smooth.

## PaperProof Current Position

### What PaperProof Already Has

PaperProof has more protocol depth than many hackathon projects:

- Mainnet Sui contracts for artifact publishing, versioning, comments, and
  governance.
- TypeScript SDK for app and external integration.
- Static TypeScript/Vite app that reads chain state and Walrus data.
- Walrus content storage flow.
- Artifact types and version lifecycle.
- Native Copilot prompts stored as PaperProof generic_file artifacts.
- Copilot memory registry contract with governance-style controls.
- MemWal integration for private user memory.
- Indexer direction and multi-repository architecture.
- Public X account: <https://x.com/LabsPaperproof>

### Strongest Competitive Advantages

1. **Verifiable artifact identity**
   PaperProof can prove what an artifact is, which version is current, and where
   its content lives.

2. **Walrus is not decorative**
   Content storage is part of the artifact lifecycle rather than a file upload
   afterthought.

3. **AI prompt and memory governance**
   PaperProof can show that AI behavior itself can be protocol-managed through
   versioned prompt artifacts and memory capability registries.

4. **Developer ecosystem potential**
   The TS SDK, registries, and object model make PaperProof more than a single
   website.

5. **Mainnet credibility**
   The project is beyond a mock demo; contracts and app integration already
   exist.

### Main Risks

1. **Too much protocol, not enough immediate demo**
   Judges may miss the value if the first minute is about modules and IDs.

2. **UX complexity**
   Memory settings, descriptor objects, Walrus certify steps, and governance
   controls must be hidden or clearly staged.

3. **Weak consumer hook**
   Compared with wallets, games, document signing, or prediction markets,
   research/artifact provenance is more abstract.

4. **Track ambiguity**
   PaperProof can fit Walrus, Agentic Web, or Infra & DevX. It should choose one
   primary track and use the others as supporting evidence.

5. **Social proof gap**
   Past winners often looked active, polished, or publicly legible. PaperProof
   should use its X account and docs to make progress visible.

## Best Track Fit for PaperProof

### Primary Recommendation: Walrus Track

PaperProof fits the Walrus track best because it is about verifiable artifacts,
durable content, and agent-readable knowledge over time.

Why it fits:

- Artifacts are stored on Walrus and represented on Sui.
- Versions make data persistent and inspectable.
- Comments and governance add structure around stored content.
- Copilot memory can use MemWal/Walrus as persistent agent memory.
- The project can demonstrate artifact-driven workflows: reports, prompts,
  memory descriptors, comments, and agent context.

Winning angle:

> PaperProof turns Walrus blobs into verifiable, versioned, discussable, and
> agent-readable knowledge artifacts.

### Secondary Recommendation: Agentic Web

PaperProof can fit Agentic Web if the Copilot is framed as an agentic workflow,
not a chatbot.

Required emphasis:

- Copilot reads protocol-native prompts.
- Copilot uses wallet-linked private memory.
- Memory is registered and governed onchain.
- Copilot helps users understand PTBs and protocol state.
- The user remains in control before signing.

Potential weakness:

The local problem statement says Agentic Web rewards projects where Sui is a
meaningful part of the AI stack, not a payment rail. PaperProof can satisfy
this, but only if the demo clearly shows Sui objects and registries improving
AI safety/composability.

### Tertiary Recommendation: Infra & DevX

PaperProof also has an Infra story:

- versioned artifact protocol;
- SDK;
- indexer;
- governance-aware registries;
- protocol-native AI prompt and memory registries.

But Infra & DevX would require a strong developer-facing demo: install SDK,
publish artifact, resolve version, verify events, integrate Copilot context.

## Recommended Demo Narrative

### 30-Second Pitch

PaperProof is a verifiable knowledge protocol on Sui and Walrus. It lets users
publish versioned artifacts, discuss them, and give AI agents durable,
governed context through protocol-native prompts and wallet-linked memory.

### 3-Minute Demo

1. Open an artifact page.
2. Show artifact code, version history, Walrus-backed content, and comments.
3. Ask Copilot what the page means.
4. Show that Copilot uses a native prompt loaded from a PaperProof artifact.
5. Enable memory and create a memory entry with one wallet signature.
6. Update memory through MemWal.
7. Show governance/operator controls for prompt or memory availability.

### What Not To Lead With

- Contract package IDs.
- Raw object IDs.
- Descriptor artifact code.
- Memory registry internals.
- Full governance theory.
- Multi-repo architecture.

These can be shown later as proof of depth.

## Product Gaps to Close Before Submission

### Must Fix

- Make the demo path deterministic and short.
- Hide or auto-fill internal memory parameters.
- Ensure Copilot works with at least one reliable model endpoint.
- Ensure all visible buttons give feedback.
- Avoid requiring more signatures than necessary.
- Write a concise README for judges.
- Record a short demo video.

### Should Fix

- Polish Blog, Forum, and Docs enough to show the artifact model.
- Add a landing/overview page that explains PaperProof in plain language.
- Add a "why Sui/Walrus" section.
- Show public activity through <https://x.com/LabsPaperproof>.
- Prepare a fallback demo dataset in case external RPC/API services are slow.

### Nice To Have

- Seal-based privacy story for memory.
- Better PTB preview for Copilot-guided actions.
- Indexer-backed fast browsing.
- More automated memory entry discovery and update flows.

## Competitive Comparison: PaperProof vs Past Winners

| Dimension | Past Winner Strength | PaperProof Status | Action |
| --- | --- | --- | --- |
| Demo clarity | Many winners had simple loops | Medium | Compress demo to one artifact lifecycle |
| Sui-native depth | Strong projects used Move objects deeply | Strong | Show object flows visually |
| Walrus relevance | 2025 storage winners used Walrus structurally | Strong | Lead with verifiable artifacts |
| AI relevance | 2025 AI winners focused on data/verification | Strong but needs framing | Present Copilot as governed agent context |
| UX polish | Consumer winners hid complexity | Medium | Hide memory and descriptor internals |
| Social traction | Some winners had clear public-facing hooks | Early | Use X account and docs more actively |
| Developer story | Infra winners solved clear builder pain | Strong potential | Show SDK and integration path |

## Final Positioning Recommendation

PaperProof should enter as a Walrus-first project with an Agentic Web extension.

Recommended one-line positioning:

> PaperProof is a Sui and Walrus protocol for verifiable, versioned knowledge
> artifacts that AI agents can safely read, cite, and remember.

Why this is competitive:

- It aligns with Walrus as verifiable data infrastructure.
- It aligns with Agentic Web through durable memory and governed prompts.
- It has more real protocol depth than a generic AI wrapper.
- It can demonstrate mainnet contracts, SDK, app, Walrus storage, and Copilot.

Main thing to improve:

PaperProof must become easier to understand. The technical foundation is strong;
the hackathon risk is communication and demo smoothness.
