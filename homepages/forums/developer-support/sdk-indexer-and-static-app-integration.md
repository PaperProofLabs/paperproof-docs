# SDK, Indexer, and Static App Integration

Author: PaperProof Labs  
Category: Developer Support  

This starter topic is for developers integrating PaperProof into applications,
scripts, wallets, dashboards, indexers, and agent systems.

PaperProof currently provides TypeScript, Rust, and Python SDK surfaces, plus a
reference Rust indexer. The official web app is a TypeScript application built
with Vite and compiled into static assets, while still reading Sui, Walrus, and
other browser-compatible APIs at runtime.

The intended integration model is layered:

- use Sui objects and events for canonical protocol state;
- use Walrus for content bytes;
- use SDKs to build transactions and parse reads;
- use the reference indexer when fast lists, analytics, or durable cursors are
  needed;
- use manifests for official navigation and curation, not as the source of
  truth for artifact content.

Useful questions for this board include:

- Which SDK examples are missing?
- Which app flows need clearer transaction previews?
- Should an integration use direct browser reads, a backend proxy, or an
  indexer API?
- How should applications handle Walrus download errors or expired references?
- Which events should indexers prioritize for Blog, Forum, Docs, and Copilot
  features?

Please include package versions, network, wallet, transaction digest, object
IDs, and browser console errors when reporting issues.
