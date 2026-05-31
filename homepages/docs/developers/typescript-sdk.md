# TypeScript SDK

Docs Path: `developers/typescript-sdk`

Artifact Code: PaperProof-generic_file-001144-d882c0e7e316
Series ID: 0xd882c0e7e316727eb62b1f642b19ac1aabbc17cfe31765f24c0e02da20038cd1
Comments Tree: locked

The TypeScript SDK is the primary integration layer for browser applications
and Node.js tools.

Install the published package:

```bash
npm install @paperproof/sdk-ts @mysten/sui
```

## Published package

| Field | Value |
|---|---|
| Registry | npm |
| Package | `@paperproof/sdk-ts` |
| Current published version | `0.2.6` |
| npm page | [npmjs.com/package/@paperproof/sdk-ts](https://www.npmjs.com/package/@paperproof/sdk-ts) |
| Source repository | [PaperProofLabs/paperproof-sdk-ts](https://github.com/PaperProofLabs/paperproof-sdk-ts) |
| License | `Apache-2.0` |
| Sui peer dependency | `@mysten/sui ^2.16.0` |

The official static app uses this published SDK as its PaperProof protocol
integration layer. For reproducible application builds, pin an exact SDK
version and update deliberately after reviewing deployment drift and release
notes.

Create an SDK instance:

```ts
import { createPaperProofSDK } from '@paperproof/sdk-ts';

const paperproof = createPaperProofSDK({
  network: 'mainnet',
});
```

## Main responsibilities

The SDK provides:

- deployment-aware configuration;
- transaction builders;
- typed reads and queries;
- event parsing and canonical filtering;
- deployment verification;
- watch APIs;
- Walrus content helpers;
- prompt-registry builders and prompt-package helpers;
- memory-registry builders for Copilot integrations.

The SDK builds transactions. It does not own private keys and does not replace
wallet review.

## API layers

| Layer | Purpose |
|---|---|
| Providers | Normalize Sui gRPC and legacy JSON-RPC transport differences |
| Read clients | Read typed object views and dynamic fields |
| Query clients | Query canonical or verified event pages |
| Transaction builders | Build unsigned wallet-signable PTBs |
| Services | Execute, retry, dry-run, dev-inspect, and normalize responses |
| Utilities | Validate inputs, select coins, verify Walrus bytes, explain errors |

`createPaperProofSDK()` returns the common layers together. Advanced
integrations can instantiate provider, read, query, builder, and service
classes separately.

## Deployment adapters

Package IDs can change during upgrades. The SDK uses explicit deployment
configuration so applications can add or select adapters without scattering
hardcoded IDs through UI code.

The recommended Sui transport is gRPC. A compatibility JSON-RPC provider
remains available while the ecosystem transitions. Application code should
depend on the SDK provider interfaces rather than a transport-specific response
shape.

## Supported workflows

The SDK covers:

- artifact publishing and typed version additions;
- series metadata updates and owner transfer;
- comments, likes, and unlikes;
- governance proposal creation, voting, resolution, execution, and claims;
- operator and managed-upgrade operations;
- canonical event filtering and verified queries;
- deployment drift checks;
- coin selection and structured error reporting;
- Walrus read, write, retry, and content verification helpers;
- native prompt package encoding and route registration;
- Agent Memory registry entry creation and tombstoning.

Builder inputs are validated before transaction construction. The chain remains
authoritative, but early validation catches whitespace-only text, oversized
fields, duplicate metadata keys, invalid status values, and malformed
governance payloads before users sign.

## Native prompt helpers

Prompt packages are ordinary PaperProof `generic_file` artifacts with content
type:

```text
application/vnd.paperproof.prompt+json
```

Use the SDK helpers to validate, encode, decode, and convert packages into
generic-file publication inputs. After publication, bind an app route to the
prompt series with `paperproof.txb.prompts.registerPrompt(...)`. Set
`useLatest: true` for ordinary updates or pin a version for controlled rollout
and rollback.

## Agent Memory registry builders

The memory registry builder creates a governed discovery entry. It does not
store private memory bodies. A registration records app ID, memory ID,
provider, MemWal account ID, descriptor artifact references, namespace root,
schema version, and latest-or-pinned descriptor policy. Each wallet can have at
most one active entry for the same app. `deleteOwnEntry(...)` tombstones an
entry and frees that slot without deleting external blobs.

## Read trust deliberately

Raw provider output is not enough for every use case. Prefer canonical queries
for ordinary feeds and verified queries for statistics, governance timelines,
rewards, and airdrop snapshots. Treat incomplete pages as unknown data, not as
empty data.

For Walrus-backed content, read the version header, retrieve the blob, and
verify its hash. The SDK exposes helpers for this path so each application does
not need to reimplement it.

## Production habits

- Verify deployment bindings at startup.
- Check for deployment manifest drift.
- Rebuild transactions between retries when shared object versions may change.
- Extract created object IDs from canonical events.
- Surface structured insufficient-balance and Move-abort diagnostics.
- Keep private keys outside browser application code.

## Transaction composition

Use Sui Programmable Transaction Blocks where compatible calls belong to one
wallet-approved action. For example, an application may compose protocol calls
that share the same chain-side stage. Do not force unrelated Walrus stages into
one imagined atomic transaction: storage reservation, upload, certification,
and chain registration may have distinct boundaries.

When retrying a write that touches shared objects, rebuild the transaction.
Reusing bytes built against stale shared-object versions can turn a transient
failure into a repeated one.

## Structured errors

The SDK exposes typed errors for invalid addresses, object IDs, wallet state,
insufficient balances, transaction building, event parsing, and execution.
Known Move aborts can be translated into protocol-oriented explanations.

A frontend should surface:

- what action failed;
- whether the failure happened before signing or after execution;
- the transaction digest when available;
- required and available balance for top-up errors;
- whether retry is reasonable;
- whether an optional dependency can degrade independently.

This is especially important for static applications. A failed MemWal relayer
request should not be presented as a failed chain registry transaction, and a
failed preview download should not hide the artifact series.
