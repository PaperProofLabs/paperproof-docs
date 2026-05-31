# Indexer Integration

Docs Path: `developers/indexer-integration`

Artifact Code: PaperProof-generic_file-001144-5d42a2d17e42
Series ID: 0x5d42a2d17e428fa6a910e976a8da4435299d1fb4a520a9a9c36d5ba17cfc5e78
Comments Tree: locked

Indexers turn canonical PaperProof events and object reads into queryable
application views.

## Canonical filtering

An indexer should validate:

- active package IDs;
- root and registry bindings;
- series ownership and artifact type;
- official comments tree ID;
- official likes book ID;
- governance config and vault relationships;
- prompt and memory registry bindings where applicable.

## Derived views

Useful views include:

- recent artifacts by type;
- artifact detail and version history;
- comment trees and like state;
- proposal lists and voting records;
- claimable funds;
- prompt-route resolution;
- official memory capability status;
- deployment drift status.

## Operational requirements

A production indexer should persist cursors, deduplicate events, record
rejections, expose metrics, and distinguish provider failure from empty state.

## Event families

Important publishing events cover root and registry creation, first
publication, version addition, series status changes, metadata updates, type
status changes, and protocol pause changes. Comments events cover comment
addition, tree and comment status, ownership transfer, likes, unlikes, and
migration. Governance events cover vault binding, authority changes, fees,
proposal lifecycle, votes, execution, expiry, and claims.

Do not trust event names alone. Validate package history and the relevant root,
registry, series, tree, likes book, vault, or config binding.

## Recommended reducer rules

1. Persist the raw event and cursor first.
2. Normalize IDs and event fields.
3. Validate package and canonical object relationships.
4. Store accepted and rejected outcomes separately.
5. Apply idempotent view updates.
6. Expose incomplete-provider state to callers.
7. Reconcile critical views with direct object reads.

## Historical packages

Package upgrades are normal protocol history. Preserve old package IDs so
historical events remain explainable. Mark which package is active for new
writes. Governance feeds need special care because proposal and vote history
can span package generations.

## Do not invent certainty

An indexer may be behind, rate-limited, or temporarily unable to load an object.
Expose freshness, last cursor, rejection counts, and degraded status. Returning
an empty list without context can turn a provider outage into a false protocol
claim.
