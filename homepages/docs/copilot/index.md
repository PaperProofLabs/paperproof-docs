# Copilot

Docs Path: `copilot`

Artifact Code: PaperProof-generic_file-001144-529cf9197eb9
Series ID: 0x529cf9197eb99b25e7d238d9ba555bc80c9f22b26e7f05f123b153613cda45cf
Comments Tree: locked

PaperProof Copilot is a browser-side protocol guide. It helps users understand
artifact state, publication forms, wallet balances, governance proposals,
locked funds, comments, safety boundaries, and the meaning of the current page.
PaperProof Copilot is model-provider neutral: the protocol supplies governed
prompts, page context, artifact state, and optional MemWal memory, while users
bring their own preferred AI provider and API key.

Copilot is not an autonomous wallet:

- it does not sign transactions;
- it does not hold private keys;
- it does not approve wallet prompts;
- it does not replace user review.

PaperProof adds two protocol-native capabilities around Copilot:

1. Official prompts are published as versioned PaperProof artifacts.
2. Optional Agent Memory uses wallet-linked MemWal storage with an on-chain
   PaperProof memory capability registry.

These are protocol extensions, not hidden application settings. Native prompts
reuse ordinary PaperProof artifact versioning. Agent Memory keeps private
memory bodies outside public Move objects while registering governed discovery
metadata on chain.

## Human-approved assistance

Copilot may explain an artifact, summarize a workflow, help interpret a
proposal, or remember a user preference when Agent Memory is enabled. The final
authorization boundary remains the wallet.

The model API, native prompt read path, wallet, Sui RPC, Walrus reads, and
optional MemWal relayer can fail independently. Ordinary protocol browsing
should not collapse because an optional AI or memory dependency fails.

## In this section

- [Native Prompts](./native-prompts.md)
- [Agent Memory](./agent-memory.md)
- [Memory Privacy and Access](./memory-privacy-and-access.md)
