# Safety and Operations

Docs Path: `safety-and-operations`

Artifact Code: PaperProof-generic_file-001144-c4ba991e6982
Series ID: 0xc4ba991e6982d64075056ad4ebe6df02d3121c240116a51ba038a2747fcbf061
Comments Tree: locked

PaperProof is infrastructure. Durable records and decentralized storage create
useful guarantees, but they also require clear operational boundaries.

Users should understand what the protocol records, what the official interface
chooses to display, what the wallet authorizes, and which external providers
may degrade independently.

The operational model is intentionally layered. Sui state, Walrus content,
indexer views, browser APIs, wallets, model providers, and optional MemWal
relayers do not fail as one unit. Reliable interfaces explain which layer is
unavailable and preserve the rest of the product where possible.

## In this section

- [User Safety](./user-safety.md)
- [Interface Policy](./interface-policy.md)
- [Mainnet and Upgrades](./mainnet-and-upgrades.md)
- [Formal Verification](./formal-verification.md)
- [FAQ](./faq.md)
