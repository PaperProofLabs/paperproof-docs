Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# Artifact Control NFT Rearchitecture

This document is the current normative design for PaperProof artifact control
after the controller-NFT upgrade line.

It describes:

- the live authority model the protocol should now follow;
- the contract, SDK, indexer, app, and skill expectations that should remain
  true going forward;
- the public product posture that should hide historical migration complexity
  from ordinary users.

Historical rollout, migration-window, and mainnet execution notes have been
split out into:

- `artifact-control-nft-rollout-history.md`

## 1. Current Status

Controller-NFT support is already live on the canonical PaperProof mainnet
package line. The current upgraded package set is:

- `paperproof_shared_controller`:
  `0xe68fef47337eb2ee970431fae9519c4b2bb9f4505a3d14b6b91fdfc6aae3b75c`
- `paperproof_comments`:
  `0x4962dda7d3033a6dd23724721ee38ca16720e8949b94d39826d24eb09f39e0a6`
- `paperproof_publishing`:
  `0xfd9ea70eef5220dbba93ae2bf7cd077d4ddebe03d585ebc7ad536ed3ba500660`

Public-product direction is now:

- new series should be created only in `controller_only` mode;
- normal SDK, app, and community skill surfaces should present a single
  controller-bound write model;
- historical migration helpers may remain in contracts and official ops
  tooling, but not in ordinary user-facing flows.

## 1.1 Downstream steady-state snapshot

As of the current post-upgrade line, the intended cross-repo steady state is:

- the published SDK line is `0.3.0` for TypeScript, Python, and Rust;
- downstream app, indexer, and skill integrations are expected to consume the
  published controller-aware SDK line rather than local pre-release wiring;
- existing mainnet legacy series have already been promoted onto the
  controller-NFT authority line and should now be treated as historical rollout
  completions, not ongoing normal-user migration cases;
- public product behavior should hide legacy and dual-mode concepts from normal
  publishing and moderation flows;
- official deployment, verification, and recovery scripts may still retain
  rollout-era helpers, but those belong to ops surfaces only.

## 1.2 Design interpretation rule

When there is tension between:

- old rollout notes;
- compatibility internals left in contracts;
- current SDK/app/indexer/community-skill behavior;

the intended interpretation is:

- historical notes explain how the upgrade happened;
- compatibility internals explain why recovery remains possible;
- the steady-state user and developer mental model is controller-only.

## 2. Problem the Design Solves

PaperProof artifacts need transferable operational control without rewriting
artifact identity, version lineage, authorship evidence, comments continuity,
or license meaning.

The controller-NFT model solves that by making control a dedicated on-chain
asset:

- one artifact series is bound to one controller NFT;
- holding that NFT grants privileged control of the series;
- transferring that NFT transfers control;
- content licenses remain independent from control rights;
- immutable versions remain immutable.

## 3. Normative Goals

- Artifact control is transferable as a first-class on-chain asset.
- Version history remains append-only and immutable.
- Historical publishers and version authors remain preserved.
- Stable artifact description is distinct from per-version change notes.
- Comments-tree control follows the artifact controller relationship.
- Standard Sui NFT infrastructure can discover and trade controller NFTs.
- Ordinary users do not need to understand NFT internals in order to publish,
  add versions, read artifacts, or moderate comments on artifacts they control.

## 4. Non-Goals

- Do not rewrite historical versions during controller transfer.
- Do not merge copyright or licensing semantics into controller ownership.
- Do not make the official website the source of artifact authority.
- Do not require marketplace listing in order for control transfer to work.
- Do not republish or recreate artifact series merely to enable NFT-backed
  control.

## 5. Core Authority Model

### 5.1 Source of truth

For controller-managed series, the source of truth for privileged authority is:

- the `ArtifactControlRecord`;
- the controller NFT currently bound to that record;
- the current owner of that controller NFT.

Legacy owner mirror fields may still exist in contract state for compatibility
or historical search, but they are not the intended authority source for normal
future flows.

### 5.2 Public operating mode

Public future behavior should assume:

- `controller_only` is the only normal mode for newly created series;
- publish, add-version, series update, owner transfer, and comments-tree
  control should all resolve through controller binding;
- downstream product surfaces should not advertise `legacy_owner_only`,
  `dual_mode`, or migration workflows as ordinary choices.

### 5.3 Transfer semantics

Controller transfer changes current operational control only.

It must not change:

- `artifact_code`
- `series_id`
- `comments_tree_id`
- `likes_book_id`
- historical version objects
- historical publish provenance
- historical per-version authorship

### 5.4 Comments semantics

For controller-managed series:

- privileged comments-tree control follows controller authority;
- tree moderation must remain series-bound, not frontend-bound;
- comment-author self-service semantics remain intact;
- controller ownership must not erase the distinction between comment authors
  and tree-level moderators.

## 6. Contract Design

### 6.1 Required live objects

The live contract model centers on:

- `ControllerNFT`
- `ArtifactControlRecord`
- controller dynamic-field state on `ArtifactSeries`
- controller dynamic-field state on `CommentsTree`

The control record is the shared binding object that links:

- the series;
- the comments tree;
- the controller NFT;
- the current authority mode;
- compatibility owner mirrors when present;
- transfer-lock state.

### 6.2 Controller NFT display and marketplace fields

The controller NFT should continue exposing marketplace-friendly fields that
let third-party infrastructure identify the underlying artifact without custom
PaperProof parsing.

Recommended active display field set:

| Field | Purpose |
|---|---|
| `name` | Human-readable NFT title tied to the artifact title/code. |
| `description` | Short explanation that this NFT controls a PaperProof artifact series. |
| `image_url` | Stable controller-NFT image URL. |
| `image` | Compatibility alias for wallets/markets that prefer `image`. |
| `artifact_code` | Reverse lookup into the PaperProof artifact identity. |
| `series_id` | Reverse lookup into the canonical series object. |
| `artifact_type` | Wallet/market display and filtering. |
| `control_right` | Explains what authority the NFT grants. |
| `authority_mode` | Current effective authority mode label. |
| `controller_nft_id` | Explicit NFT object identifier for wallet surfaces. |

### 6.3 Description and version-change split

The protocol should preserve two distinct meanings:

- `seriesDescription`: long-lived description of what the artifact series is;
- `versionChangeNote`: version-specific explanation of what changed.

Rules:

- add-version should always carry a version change note in controller-bound
  flows;
- updating a description should not be treated as equivalent to publishing a
  new version;
- downstream surfaces should not collapse the two fields into one label.

### 6.4 Invariants that must not break

The controller-NFT model must preserve:

- stable series identity;
- stable comments tree identity;
- stable likes-book identity;
- preprint reservation/finalization continuity;
- current hidden/paused/status semantics unless explicitly changed;
- current version lineage ordering;
- historical author and publisher evidence.

## 7. SDK Design

### 7.1 Public API posture

The three SDKs should expose one normal public write surface:

- standard publish builders;
- standard add-version builders;
- standard comments-tree moderation builders;
- standard owner-transfer helpers;
- standard read helpers that return controller fields where relevant.

They should not expose normal-user public APIs centered on:

- `*_with_controller` naming;
- legacy-only privileged write variants;
- dual-mode selection as a user choice;
- promotion, mirror-repair, or migration orchestration helpers.

Those historical helpers may still exist in contract or ops tooling, but they
should not shape the ordinary SDK mental model.

### 7.2 Required read model

SDK read surfaces should expose, where relevant:

- `seriesControlEnabled`
- `seriesAuthorityMode`
- `seriesAuthorityModeName`
- `seriesControlRecordId`
- `seriesControllerNftId`
- `treeControlEnabled`
- `treeAuthorityMode`
- `treeAuthorityModeName`
- `treeControlRecordId`
- `treeControllerNftId`
- `seriesDescription`
- `versionChangeNote`

### 7.3 UX rule

SDK consumers should be able to use normal method names while the SDK resolves
the controller-bound path under the hood.

In other words:

- controller logic should be explicit in protocol state;
- controller logic should be low-friction in normal developer experience.

## 8. Indexer Design

The public indexer API should expose the current controller-aware artifact
shape, not rollout-era repair state.

Public artifact rows may include:

- `owner`
- `seriesControlEnabled`
- `seriesAuthorityMode`
- `seriesAuthorityModeName`
- `seriesControlRecordId`
- `seriesControllerNftId`
- `controllerHolder`
- `controllerTransferLocked`
- `seriesDescription`
- `latestVersionChangeNote`

But the public normalized API should not reintroduce rollout-specific fields
such as:

- legacy owner mirror fields as first-class API contract;
- mirror stale flags as ordinary user data;
- repair workflow state as normal browse data.

Reverse lookup should remain easy from either:

- artifact code / series id -> controller NFT;
- controller NFT id -> artifact series.

## 9. App Design

### 9.1 Product posture

The app should behave as if PaperProof simply has a single modern control model.

Ordinary users should see:

- publish;
- add version;
- update description;
- moderate comments;
- transfer control.

They should not need to choose among:

- legacy owner path;
- dual mode;
- controller-primary transition;
- migration or mirror repair.

### 9.2 Artifact detail expectations

Artifact pages should present:

- original publishing and authorship evidence;
- current controller-linked ownership state;
- stable description;
- version history with version-specific change notes.

They should not visually imply that controller transfer rewrites:

- original publisher;
- historical version authors;
- historical dates.

### 9.3 Comments control

Comments moderation UI should route through the current controller binding when
the series is controller-managed, while preserving author self-delete behavior.

## 10. Skill and Script Design

### 10.1 Community skill

The community skill should present controller-only normal flows:

- publish;
- add version;
- query;
- verify;
- comments control;
- ownership transfer.

It should explain controller requirements when needed, but should not ask
ordinary users to reason about migration modes.

### 10.2 Docs repo publication scripts

Official docs/blog/forum publication scripts should assume that newly published
or updated official series are controller-only.

Their normal invariants should be:

- published official series must resolve as `controller_only`;
- add-version writes must use controller-bound inputs;
- scripts should fail fast if a target official series is not in the expected
  controller-only state.

### 10.3 Official ops tooling

Official-only ops tooling may continue to retain:

- migration helpers;
- promotion scripts;
- mirror sync / repair flows;
- rollout verification scripts.

Those are operational surfaces, not ordinary protocol-product surfaces.

## 11. Cross-Repo Steady-State Requirements

After the controller-NFT upgrade line, the intended steady state is:

- contracts preserve compatibility internals where required;
- SDKs expose unified public APIs;
- indexer exposes controller-aware public reads;
- app hides migration complexity;
- community skill follows controller-only normal paths;
- official ops skill retains historical recovery and rollout tools.

## 12. Verification Checklist

The stack should continue to satisfy all of the following:

- publishing a new artifact gives the publisher the controller NFT;
- transferring the controller NFT transfers effective add-version and
  comments-tree control;
- old artifact identity and historical versions remain unchanged;
- controller-managed artifacts remain discoverable from both artifact identity
  and NFT identity;
- description and version change note remain distinct across contracts, SDKs,
  indexer, and app;
- normal users do not encounter legacy/dual migration decisions in ordinary
  flows.

## 13. References

- Historical rollout and migration record:
  `artifact-control-nft-rollout-history.md`
- Contract implementation roadmap:
  `paperproof-contracts-NFT/docs/Artifact-Control-NFT-Contract-Roadmap.md`
- Local upgrade preparation and rehearsal:
  `paperproof-contracts-NFT/docs/Artifact-Control-NFT-Local-Upgrade-Prep.md`
