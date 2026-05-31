# Interface Policy

Docs Path: `safety-and-operations/interface-policy`

Artifact Code: PaperProof-generic_file-001144-925025e2f21a
Series ID: 0x925025e2f21a32d2b7374eb2a7f7aa6b02d6709afac3dc350c9c2f2ac923fb76
Comments Tree: locked

PaperProof Protocol and the official PaperProof interface are related but
distinct layers.

## Protocol facts

The protocol records Sui objects, events, relationships, and Walrus content
references. These facts may remain available through chain clients, storage
systems, third-party indexers, and independent applications.

## Interface choices

An official or third-party interface may:

- hide;
- delist;
- de-rank;
- label;
- refuse to preview;
- decline to index;
- warn about content.

Reasons may include abuse, spam, fraud risk, legal concerns, provider failure,
hash mismatch, stale manifests, or operational constraints.

## Non-display is not deletion

Interface-level non-display does not erase underlying Sui records, third-party
records, or decentralized-storage content. Likewise, display does not imply
endorsement.

## Multiple entry points

Independent frontends, wallets, dashboards, indexers, academic tools, agents,
and direct chain clients may apply their own policies while using the same
public protocol facts.

## Why this separation matters

PaperProof aims to preserve durable evidence without forcing every interface to
preview every byte. A decentralized record layer and a responsible presentation
layer solve different problems.

An official interface may make conservative display choices while still
exposing enough protocol metadata for independent verification. A third-party
interface may build a specialized academic explorer, software release
dashboard, public archive, or social product while clearly identifying its
unofficial status.

## Reasons to degrade or refuse display

Examples include:

- failed hash verification;
- stale or unverified deployment manifest;
- RPC, indexer, or gateway outage;
- malware or unsafe executable content;
- abuse, spam, fraud, or impersonation;
- privacy, copyright, trademark, or legal concern;
- unsupported content type;
- missing canonical object binding.

A failed provider response should be shown as a degraded state. It should not
be converted into an apparently verified empty result.
