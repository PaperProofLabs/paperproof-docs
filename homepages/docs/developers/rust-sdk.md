# Rust SDK

Docs Path: `developers/rust-sdk`

Artifact Code: PaperProof-generic_file-001144-e74daa686e62
Series ID: 0xe74daa686e6209f2715f0a88492f6aa1f206d8406fcafca7594858e581c23b39
Comments Tree: locked

The Rust SDK is the infrastructure SDK for high-throughput and long-running
services.

## Published crate

Install the published crates.io release:

```toml
[dependencies]
paperproof-sdk-rs = "0.2.4"
```

| Field | Value |
|---|---|
| Registry | crates.io |
| Crate | `paperproof-sdk-rs` |
| Current published version | `0.2.4` |
| crates.io page | [crates.io/crates/paperproof-sdk-rs](https://crates.io/crates/paperproof-sdk-rs) |
| API documentation | [docs.rs/paperproof-sdk-rs/0.2.4](https://docs.rs/paperproof-sdk-rs/0.2.4) |
| Source repository | [PaperProofLabs/paperproof-sdk-rs](https://github.com/PaperProofLabs/paperproof-sdk-rs) |
| License | `Apache-2.0` |

Optional features include `sui-native`, `sqlite`, `postgres`, and `tracing`.
Pin a specific crate version for production indexers and review deployment
drift before upgrading a long-running service.

## Typical uses

- checkpoint ingestion;
- backfill and tail-mode indexers;
- persistent cursors;
- SQLite and Postgres sinks;
- idempotent event processing;
- metrics and tracing;
- backend APIs and durable data services.

## Why an indexer SDK matters

Raw events are not the final application view. A reliable indexer must apply
canonical filters, reject look-alike events, preserve package history, resume
after failure, and derive views such as recent artifacts, comment trees,
governance history, and deployment drift status.

Rust is the appropriate track when correctness and operational behavior matter
as much as simple API convenience.

## Suggested service architecture

A production indexer normally has four stages:

```text
checkpoint or event source
  -> canonical decoder
  -> idempotent reducer
  -> database and API views
```

The decoder should retain the raw transaction digest, event sequence, package
ID, parsed fields, validation result, and rejection reason. Reducers should be
idempotent so replay and recovery are routine operations rather than emergency
procedures.

## Persistence and recovery

A long-running Rust service should persist:

- checkpoint or event cursors;
- canonical series and version projections;
- official interaction bindings;
- governance configuration and proposal state;
- package history;
- rejected or incomplete records;
- deployment drift checks;
- service metrics.

Backfill and tail mode should use the same reducers. A restart must not create
duplicate rows or silently skip a partially processed page.

## API design

Serve derived views that match application questions:

- recent artifacts by type;
- artifact detail and complete version history;
- official comments and likes;
- proposal timelines and claim state;
- prompt route resolution;
- Agent Memory capability status;
- operational health and last processed cursor.

The indexer improves query ergonomics. It does not replace direct object
verification for high-value paths.
