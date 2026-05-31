# Quick Start

Docs Path: `getting-started/quick-start`

Artifact Code: PaperProof-generic_file-001144-886373561299
Series ID: 0x886373561299545caf6b3726f65ce690506b7bff8370b43530cd3934e7515b66
Comments Tree: locked

The official PaperProof application is designed to make protocol exploration
possible without requiring users to read Move source code or object IDs first.

## Explore an artifact

1. Open Explore.
2. Select an artifact type or recent artifact.
3. Open the artifact detail view.
4. Review its artifact code, current version, version history, owner, status,
   content references, comments, and likes.
5. Use the Walrus content action to retrieve the linked content when available.

## Publish an artifact

1. Connect a compatible Sui wallet.
2. Open Publish.
3. Choose the artifact type.
4. Provide the required metadata and content.
5. Review the wallet transaction carefully before signing.

Publication stores large content through the Walrus flow and records compact
artifact state on Sui. Storage and chain operations may occur in stages.

## Use PaperProof Copilot

1. Open PaperProof Copilot.
2. Configure a supported model provider and API key.
3. Ask Copilot to explain the current page, artifact, or governance state.
4. Keep wallet review as the final authorization boundary.

Agent Memory is optional. It can be enabled later if you want wallet-linked
preferences or task context to persist across sessions.

## Add a new version

For a continuing work, append a version to the existing series instead of
publishing an unrelated series. This preserves the artifact code, comments,
likes, and revision lineage. Versions are immutable after publication; a
correction becomes a new record rather than a silent overwrite.

Preprints use a special reserve-and-finalize workflow. Reserve the code first,
stamp it into the PDF, upload the final stamped file to Walrus, and then
finalize the reservation. Other built-in artifact types use direct first
publication.

## Assets and review

| Asset | Typical purpose |
|---|---|
| `SUI` | Network gas |
| `WAL` | Walrus or MemWal storage operations |
| `PPRF` | Protocol fees, likes, and governance participation where applicable |

Always inspect the wallet transaction before signing. The official static app
builds transactions in the browser and delegates signing to your wallet. It
must never request a mnemonic phrase, private key, or raw signing secret.

## Optional Agent Memory flow

1. Open Copilot settings and select `Access` for the current browser.
2. Select `Create` if the connected wallet has no active memory entry.
3. Select `Enable` to allow local recall.
4. Ask Copilot to remember a durable preference or select `Update`.
5. Use `Disable` to pause local recall, `Revoke` to remove browser access, or
   `Delete` to tombstone the chain registry entry.

Deleting the chain entry does not delete external MemWal or Walrus data. It
releases the active slot so the same wallet can create a replacement entry.

## Read degraded states honestly

If a provider fails, the website should show an error or degraded state. It
should not display failed reads as empty protocol state.

This distinction is important for explorers and indexers too. A failed RPC
request, unavailable gateway, or rejected non-canonical event is an incomplete
read, not proof that no artifact exists.
