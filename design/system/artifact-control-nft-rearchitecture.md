Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# Artifact Control NFT Rearchitecture

This note proposes a controller-NFT redesign for PaperProof artifacts. The goal
is to make artifact control transferable through a dedicated NFT, so the right
to publish new versions, manage comment-tree policy, and perform other
privileged operations can move with a standard on-chain asset.

This is a design document only. It does not change protocol behavior by itself.

## 1. Problem Statement

Today, artifact control is modeled with direct owner fields:

- `ArtifactSeries.owner` gates series writes;
- `CommentsTree.owner` gates tree moderation;
- `publishing::transfer_artifact_owner` synchronizes both fields together.

That works, but it keeps control tied to a mutable address field instead of a
portable asset. The desired model is:

- each controlled artifact series has one transferable controller NFT;
- holding that NFT grants control of the series;
- transferring the NFT transfers control;
- version history stays immutable;
- content licenses remain separate from control rights.

## 2. Goals

- Make artifact control transferable as a first-class on-chain asset.
- Preserve immutable version history.
- Keep content license and control authority separate.
- Support ordinary Sui NFT transfer flows.
- Let SDKs and apps resolve control from chain state.
- Keep backwards compatibility during migration.

## 3. Non-Goals

- Do not change the meaning of published versions.
- Do not rewrite past version history on transfer.
- Do not force a marketplace module into the core protocol.
- Do not make the official website the source of authority.
- Do not merge copyright/license ownership with operational control.

## 4. Upgrade Constraint

This redesign must be implementable by upgrading the existing contract package
set, not by abandoning the current deployed package line.

That means:

- preserve the current `publishing`, `comments`, and `governance` package
  boundaries;
- add new objects, entrypoints, and read helpers through package upgrade;
- keep legacy fields and helpers available during migration;
- avoid any design that requires a separate parallel protocol deployment just
  to keep the old one working;
- keep the old package IDs valid as the historical base until the migration is
  complete.

In practice, the controller NFT should be introduced as an upgrade path inside
the current protocol family, not as a replacement protocol.

### 4.1 Compatibility Strategy

The first implementation should be additive, not disruptive:

- keep existing publish, add-version, transfer, and comment flows working for
  legacy series;
- introduce controller-aware reads and writes alongside the legacy path;
- make controller mode opt-in per series;
- preserve old package IDs and object IDs as historical references;
- treat owner fields as mirrors until a series is explicitly promoted.
- do not require a first-phase reshape of `ArtifactSeries` or `CommentsTree`
  layouts;
- do not wire the controller NFT into comments-tree creation or likes-book
  creation logic.

Recommended cutover order:

1. ship controller objects and reads first;
2. keep legacy behavior unchanged for existing series;
3. enable controller mode only for new or explicitly migrated series;
4. remove legacy write dependence only after rollout verification.

## 5. Current Baseline

The current `publishing` module already exposes the control surface that the NFT
model must replace.

### 5.1 Publishing

`ArtifactSeries` currently stores:

- `artifact_type`
- `artifact_code`
- `owner`
- `current_version`
- `current_version_id`
- `version_ids`
- `metadata_extensions`
- `comments_tree_id`
- `likes_book_id`
- `status`
- `ui_status`

Series writes currently check `series.owner` directly. In particular:

- first publish creates the series and sets `owner`;
- `add_*_version` requires `tx_context::sender(ctx) == series.owner`;
- `update_series_metadata_extensions` requires `tx_context::sender(ctx) == series.owner`;
- `transfer_artifact_owner` checks series ownership and updates the linked
  comments tree owner in the same transaction.

### 5.2 Comments

`CommentsTree` already has its own owner and transfer helper:

- `comments::owner(tree)` returns the moderation owner;
- `comments::transfer_tree_owner(tree, new_owner, ctx)` updates tree ownership;
- tree moderation logic uses the tree owner for privileged actions.

So the current system already has two coupled authority locations. The NFT
design should replace the direct owner as the source of truth, while keeping the
comments-tree mirror during migration.

## 6. Contract Design

### 6.1 New Objects

Recommended new on-chain objects:

- `ControllerNFT`
- `ArtifactControlRecord`

Optional future extension:

- `ArtifactControlPolicy`

Suggested fields:

```move
public struct ControllerNFT has key {
    id: UID,
    version: u64,
    series_id: ID,
    artifact_type: u8,
    control_record_id: ID,
    issued_at_ms: u64,
    last_transferred_at_ms: u64,
}

public struct ArtifactControlRecord has key {
    id: UID,
    version: u64,
    series_id: ID,
    controller_nft_id: ID,
    current_controller: address,
    legacy_series_owner: address,
    comments_tree_id: ID,
    authority_mode: u8,
    transfer_locked: bool,
    created_at_ms: u64,
    updated_at_ms: u64,
}
```

The controller NFT is the canonical control credential. The control record is
the binding object that makes reads and indexing easier.

Important distinction:

- `ControllerNFT` is the authorization source;
- `ArtifactControlRecord` is a binding and mirror object;
- `current_controller` in the record is advisory and may lag until the next
  sync or indexer refresh;
- privileged contract calls should verify the controller NFT itself, not the
  mirrored controller address.

`authority_mode` should support:

- `0 = legacy_owner_only`
- `1 = dual_mode`
- `2 = controller_primary`
- `3 = controller_only`

Recommended default:

- existing series start in `legacy_owner_only` or `dual_mode`;
- new migrated series move to `controller_primary`;
- `controller_only` is reserved for the final cutover.

### 6.2 Series Creation

When a new artifact series is created:

1. Mint a controller NFT.
2. Create a control record bound to the new series.
3. Store the initial controller and comments-tree ID.
4. Return the NFT to the creator wallet.

### 6.3 Privileged Operations

Operations that should require controller authority:

- publish first version;
- add version;
- update series metadata;
- change series-level moderation state;
- controller-bound comments-tree operations;
- future series-local governance actions.

Global protocol actions should remain unchanged:

- pause/unpause;
- type enablement and activation;
- fee policy;
- governance execution;
- root-level upgrades.

Recommended authorization rule:

- legacy mode checks `series.owner`;
- controller mode checks the passed `ControllerNFT` object and its series
  binding;
- dual mode accepts either path during rollout;
- the control record alone must never be treated as enough to authorize writes.

### 6.4 Transfer Semantics

Primary transfer path:

- transfer the `ControllerNFT` as an ordinary owned Sui object;
- the new holder becomes controller immediately;
- the next privileged write resolves authority from the controller binding;
- no special canonical `change owner` path is needed for market transfer.

Compatibility transfer path:

- keep a helper that syncs legacy owner mirrors for migration;
- that helper may update `series.owner` and `comments_tree.owner`;
- that helper is compatibility only, not the canonical market path.

The two paths must not conflict:

- if a series is still legacy-owned, the legacy helper remains active;
- if a series is controller-primary, the controller NFT is the write gate and
  the legacy helper only updates mirrors.

Because standard Sui NFT transfer is an ordinary object transfer, the
controller holder change is observed from the NFT object ownership, not from a
special on-chain callback.

### 6.5 Comments Tree Implication

This is the key design point.

Standard NFT transfer does not call contract code, so the comments tree cannot be
automatically rewritten at the exact transfer moment. Therefore:

- `CommentsTree.owner` becomes a compatibility mirror and display field;
- moderation and privileged tree actions must verify the controller binding at
  call time;
- the mirror can be synchronized by migration helpers, but it must not be the
  ultimate authority source.

### 6.6 Recovery and Safety

Losing the NFT means losing control by default.

Possible future extensions:

- optional recovery policy;
- multisig controller NFT;
- time-locked transfer;
- controller lock for dispute handling.

Those are out of scope for v1.

### 6.7 Migration Strategy

Recommended phases:

1. keep existing owner-based writes working;
2. add controller objects, reads, and indexer tables without changing old
   series behavior;
3. mint controller NFTs for new series or migrated series;
4. run in dual mode for a rollout window;
5. switch selected series to controller-primary mode;
6. freeze legacy owner fields as compatibility snapshots only after smoke tests
   pass.

For existing series, mint the controller NFT to the current series owner and
keep the legacy owner and comments-tree owner as mirrors until the series is
explicitly promoted.

### 6.8 Backward-Compatible Fields And Helpers

The upgrade should keep these fields readable during the migration window:

- `ArtifactSeries.owner`
- `CommentsTree.owner`
- `ArtifactSeries.comments_tree_id`
- `ArtifactSeries.likes_book_id`
- `ArtifactSeries.version_ids`

The upgrade should also keep these operational helpers available:

- `transfer_artifact_owner`
- `transfer_tree_owner`
- `getSeriesDetails`
- `getSeriesView`
- `getCommentsTreeView`

These remain important because they let old clients continue to function while
new controller-aware clients are being rolled out.

Legacy helpers should remain supported API during the migration window, not
dead code.

### 6.9 Upgrade Safety Checks

Every package upgrade that introduces controller NFTs should verify:

- the package IDs remain the same deployment family;
- existing publish/add-version entrypoints still succeed for legacy series;
- comments trees remain bound to their series;
- indexer reads can still reconstruct series ownership for pre-migration data;
- the new NFT path does not require a new root or a parallel protocol package
  set.
- legacy clients can continue to operate old series without NFT-aware wallet
  changes;
- controller transfer does not silently alter legacy moderation semantics until
  the series is promoted.
- no existing `ArtifactSeries` fields are deleted or repurposed in the first
  controller-enabled upgrade;
- no existing `CommentsTree` fields are deleted or repurposed in the first
  controller-enabled upgrade;
- the comments-tree / likes-book creation flow remains identical for
  non-migrated series.

## 7. SDK Design

### 7.1 New Read Types

SDKs should expose:

- `ControllerNFTView`
- `ArtifactControlView`
- `series.controllerNftId`
- `series.controllerOwner`
- `series.controllerMode`
- `series.controllerHistory`

The SDK should treat controller fields as optional during migration, so old
clients can keep reading the legacy series shape.

### 7.2 New Read Helpers

Recommended helpers:

- `getArtifactControl(seriesId)`
- `getControllerNft(nftId)`
- `getControllerBySeries(seriesId)`
- `getControllerHistory(seriesId)`
- `canControlSeries(seriesId, walletAddress)`

Recommended implementation rule:

- resolve current controller from the live controller NFT object when possible;
- use the control record as a fallback mirror and display aid;
- do not infer write authorization from the control record alone.

### 7.3 Write Helpers

Write builders should support explicit controller proof inputs:

- `controllerNftId`
- `controllerProof`
- `controllerOwner`

The SDK should still keep the wallet UX simple:

- auto-select when exactly one matching controller NFT exists;
- require user choice when multiple candidates exist;
- explain what transfer or wallet connection is needed when none exist.

### 7.4 Compatibility Helpers

Keep `transferArtifactOwner` as a migration helper, but document it as legacy.
New helpers should distinguish:

- controller transfer;
- legacy mirror sync;
- comments-tree moderation under controller authority.

## 8. Indexer Design

### 8.1 Ingested Events

The indexer should track:

- controller NFT mint events;
- controller NFT transfer events;
- control record creation;
- control record mirror updates;
- controller-bound privileged actions;
- legacy owner-mirror sync events.

### 8.2 Derived Tables

Suggested tables:

| Table | Purpose |
|---|---|
| `artifact_controller_nft` | current controller NFT and latest holder |
| `artifact_control_record` | canonical series-to-controller binding |
| `artifact_controller_history` | transfer and sync history |
| `artifact_series_permission_snapshot` | derived permission snapshot |
| `artifact_controller_mirror` | legacy owner/tree-owner mirrors |

### 8.3 Query API

The indexer should expose:

- current controller for a series;
- current controller NFT for a series;
- current series controlled by a wallet;
- controller history by series;
- controller history by NFT;
- whether a legacy mirror is stale.

The indexer should also be able to reconstruct current controller state from:

- the live `ControllerNFT` object owner;
- the control record mirror;
- legacy `ArtifactSeries.owner` and `CommentsTree.owner` fields for pre-migration
  series.

### 8.4 Drift Handling

If chain and indexer disagree, the chain remains authoritative.
The indexer should mark the binding stale and keep the last observed mirror for
debugging.

## 9. App Design

### 9.1 Detail Pages

Artifact detail pages should show:

- controller NFT ID;
- current controller wallet;
- legacy owner mirror, if present;
- transfer history;
- privileged actions available to the current wallet.

### 9.2 Publish And Add-Version

The publish and add-version flows should:

- resolve the controller NFT from the connected wallet;
- refuse write actions if the wallet does not control the NFT;
- explain whether the user needs another wallet or a transfer first;
- keep the existing content-hash and Walrus flow unchanged.

For legacy series, the old publish and add-version paths should remain usable
until the series is explicitly migrated.

For controller series, the app should pass the controller NFT into the
transaction so the contract can verify authority directly.

### 9.3 Transfer UI

Add a control panel for:

- transfer controller NFT;
- display current holder;
- show pending transfer status;
- optionally run a legacy mirror sync for old series;
- warn that transfer changes operational control, not license terms.

The UI should surface whether a follow-up mirror-sync transaction is still
needed after an NFT transfer.

### 9.4 Marketability

The app can later expose:

- list controller NFT for sale;
- accept NFT transfer from another wallet;
- surface marketplace links.

Marketplace support should stay optional UI on top of the protocol.

## 10. Module-Level Impact

### 10.1 `publishing`

`publishing` should add controller-specific series state and switch write guards
from `series.owner` to controller authority.

Recommended new or updated functions:

- `mint_controller_nft_for_series`
- `get_series_controller`
- `assert_series_controller`
- `sync_legacy_owner_mirror`
- `transfer_controller_compat`

The new controller-aware entrypoints should be additive:

- they must not remove legacy entrypoints in the first upgrade;
- they must not require a new package family;
- they must keep existing artifact creation and version history behavior
  unchanged for legacy series.

### 10.2 `comments`

`comments` should stop depending on `CommentsTree.owner` as the only authority
source once the NFT model is enabled.

Recommended rule:

- tree owner remains a compatibility mirror;
- controller-aware moderation verifies the series controller binding;
- tree transfer helpers remain for legacy migration and manual sync.

Tree comments and likes behavior should remain unchanged for non-migrated
series. The controller redesign is about authority routing, not interaction
semantics.

### 10.3 `sdk-ts`

SDK changes should mirror the module split:

- read controller binding first;
- fall back to legacy owner only for old series;
- keep wallet-transfer UX explicit;
- avoid dependence on the official website or a private backend.

## 11. Migration Plan

### Phase 1

- add controller NFT objects for new artifact series;
- keep legacy owner fields for compatibility;
- update SDK reads to prefer controller NFT fields.

### Phase 2

- mint controller NFTs for existing series;
- backfill indexer history;
- show controller NFT in app detail pages.

### Phase 3

- make NFT authority the primary write gate;
- keep legacy owner checks as fallback only.

### Phase 4

- remove direct-owner authority from new writes;
- leave legacy fields read-only if needed for history.

### Rollback Rule

If a rollout step causes regressions in old publish, version, or comments
flows, keep the series in legacy or dual mode and do not advance it.

### No-Breaking-Layout Rule

The first controller-enabled package upgrade must be layout-safe for existing
objects:

- add new objects instead of reshaping live core objects;
- preserve existing read helpers and event shapes;
- use migration hooks for any later state rewrite;
- avoid introducing a hard dependency that would strand old objects.

### Backfill Rule

If a migrated series later needs a stale mirror repaired, rebuild the mirror
from the live controller NFT owner and the current chain object state instead of
from app-local cache.

## 12. Open Questions

- Should a series ever support multiple controllers?
- Should controller loss be recoverable through governance?
- Should marketplace transfer policy be protocol-level or app-level only?
- Should control NFT metadata include royalties or only operational rights?
- Should control transfer be blocked while a series is locked?

## 13. Regression Checklist

Before cutover, verify:

- existing publish flows still create the same `ArtifactSeries`,
  `CommentsTree`, and `LikesBook` objects for legacy series;
- add-version still appends to `version_ids` without changing the comments-tree
  binding;
- `transfer_artifact_owner` still works for series that have not migrated;
- `transfer_tree_owner` still works for comments-tree-only maintenance;
- `getSeriesDetails`, `getSeriesView`, and `getCommentsTreeView` still return
  usable data for old and new series;
- `likes_book_id` remains unchanged across version additions and controller
  changes;
- controller reads reflect the live NFT holder, not only the control record
  mirror;
- indexers can still resolve old series from existing events;
- no pre-migration client needs the NFT to keep reading or operating.

## 14. Summary

This design makes artifact control a transferable digital asset while keeping
PaperProof discipline intact:

- versions stay immutable;
- licenses stay separate;
- control moves with the NFT;
- SDKs and apps can reason about authority explicitly;
- indexers can surface current holder and history;
- marketplaces can emerge without being required by the protocol;
- current `owner` and `comments_tree.owner` semantics can stay as compatibility
  mirrors during migration;
- the migration is designed to run in parallel with the legacy path until the
  rollout is proven safe.
