# Developers

Docs Path: `developers`

Artifact Code: PaperProof-generic_file-001144-e42b8ce6677c
Series ID: 0xe42b8ce6677ca8a96d8834d016e6f4cd0a2cc48047ac2522cb506c3c0fd789f0
Comments Tree: locked

PaperProof is designed to be used beyond the official website. SDKs, manifests,
events, and object bindings make it possible to build independent frontends,
wallet integrations, scripts, notebooks, indexers, analytics tools, and agents.

The three SDK tracks serve different audiences:

| SDK | Primary role |
|---|---|
| TypeScript | Browser apps, Node.js tools, wallet workflows, and SDK-first integration |
| Python | Scripts, notebooks, analytics, exports, and operational tasks |
| Rust | High-throughput indexers, checkpoint ingestion, sinks, and backend services |

The TypeScript SDK is the most complete browser and application integration
surface. Python is the natural track for research, automation, and exports.
Rust is the natural track for long-running infrastructure. All three should
share the same protocol discipline: explicit deployment configuration,
canonical filtering, honest incomplete states, and content verification where
the result matters.

## Integration posture

PaperProof is designed for independent entry points. A developer should be able
to build a specialized frontend, explorer, agent tool, or analytics service
without copying the official website. The stable public interfaces are:

- deployed Sui packages and shared objects;
- contract getters and events;
- Walrus content references;
- deployment manifests and package history;
- published SDKs;
- protocol documentation.

Use the SDK matching your environment, but keep the chain and verified content
relationships as the source of truth.

## In this section

- [TypeScript SDK](./typescript-sdk.md)
- [Python SDK](./python-sdk.md)
- [Rust SDK](./rust-sdk.md)
- [Static Frontend Integration](./static-frontend-integration.md)
- [Indexer Integration](./indexer-integration.md)
