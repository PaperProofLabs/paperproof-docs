Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# Artifact Control NFT Rearchitecture

This note proposes a controller-NFT redesign for PaperProof artifacts. The goal
is to make artifact control transferable through a dedicated NFT, so the right
to publish new versions, manage comment-tree policy, and perform other
privileged operations can move with a standard on-chain asset.

This document now serves two roles:

- it remains the protocol-level design reference for the controller-NFT model;
- it also records the implemented contract surface and the post-upgrade
  downstream adaptation target so other repos do not keep working from an
  outdated proposal.

Unless noted otherwise, the contract-layer controller-NFT rollout described in
this document refers to the mainnet upgrade completed on 2026-07-18 for:

- `shared/controller`
- `comments`
- `publishing`

Downstream SDK, indexer, and app sections in this document should still be read
as the architectural reference and verification target for the rest of the
stack, even though the contract package upgrade itself is no longer pending.

## 0. Current Implementation and Mainnet Rollout Snapshot

### 0.1 Mainnet-upgraded package set

Controller-NFT support is now live in the canonical PaperProof mainnet package
family:

- `paperproof_shared_controller`:
  `0xe68fef47337eb2ee970431fae9519c4b2bb9f4505a3d14b6b91fdfc6aae3b75c`
- `paperproof_comments` latest package:
  `0x4962dda7d3033a6dd23724721ee38ca16720e8949b94d39826d24eb09f39e0a6`
- `paperproof_publishing` latest package:
  `0xfd9ea70eef5220dbba93ae2bf7cd077d4ddebe03d585ebc7ad536ed3ba500660`

Upgrade transaction digests:

- shared/controller publish:
  `HuBa1wZGEcYJdJFonwycVQH7FdXvcAzu5LcmNCmv8keV`
- comments upgrade:
  `3bCSTrXW8vS7rB5uXKeEe4nt8W8PwNmPunu2K2ehuCmZ`
- publishing upgrade:
  `HPTSjkGuM2JsfCXrLaao9srpAN3V65NZuMkQUagttTbQ`

Operator record:

- rollout date: `2026-07-18`
- deployer address:
  `0x4ee4f1d5fda8efc8f29f7051dff8807c8c9e4fdeadbe519fdf831aa3647235e9`
- canonical deployment record:
  `paperproof-contracts-NFT/docs/Mainnet-Deployment-Record-2026-05-06.md`

### 0.2 Contract-layer status

Current contract-layer status on the `paperproof-contracts-NFT` `nft` branch
and the matching mainnet-upgraded package line:

- additive package changes are already in place in:
  - `shared/controller`
  - `publishing`
  - `comments`
- `ControllerNFT` is already implemented and now carries marketplace-facing
  identity fields in addition to protocol binding fields:
  - `series_id`
  - `artifact_code`
  - `artifact_type_name`
  - `control_right`
  - `authority_mode_name`
  - `image_url`
  - `artifact_type`
  - `control_record_id`
  - `issued_at_ms`
- `ArtifactControlRecord` is already implemented as the shared control-binding
  object with mirror fields for:
  - current controller
  - legacy series owner
  - legacy comments owner
  - authority mode
  - transfer lock state
- controller dynamic-field state is already implemented on both
  `ArtifactSeries` and `CommentsTree` through:
  - `SeriesControlState`
  - `TreeControlState`
- new controller-aware read helpers already exist, including:
  - `is_series_control_enabled`
  - `is_tree_control_enabled`
  - `series_authority_mode`
  - `tree_authority_mode`
  - `series_control_record_id`
  - `series_controller_nft_id`
  - `tree_control_record_id`
  - `tree_controller_nft_id`
  - `controller_nft_artifact_code`
  - `controller_nft_artifact_type_name`
  - `controller_nft_control_right`
  - `controller_nft_authority_mode_name`
  - `controller_nft_image_url`
- new-series publish flow already enables control at publish time and mints a
  controller NFT in `dual_mode`
- reserved-preprint finalize flow already mints controller state for the final
  series instead of remaining legacy-only
- existing-series promotion is already implemented through:
  - `promote_existing_series_to_dual_mode`
  - `promote_existing_series_to_controller_primary`
  - `promote_existing_series_to_controller_only`
  - `sync_existing_series_control_mirrors`
  - `repair_existing_series_control_mirrors`
- controller-aware owner transfer compatibility is already implemented through
  `transfer_artifact_owner_with_controller(...)`
- comments-tree moderation has already been refactored to respect controller
  authority for migrated series while preserving comment-author self-service
  semantics
- the series-description / version-change-note split is already implemented in
  contract state, but the current implementation uses reserved metadata keys
  rather than brand-new top-level fields:
  - `series_description`
  - `version_change_note`
- marketplace-facing support is already implemented inside
  `shared/controller::controller_marketplace`, which creates and shares:
  - `Display<ControllerNFT>`
  - `TransferPolicy<ControllerNFT>`
- the current marketplace display fields are:
  - `name`
  - `description`
  - `image_url`
  - `image`
  - `artifact_code`
  - `series_id`
  - `artifact_type`
  - `control_right`
  - `authority_mode`
  - `controller_nft_id`

Important boundary:

- the contract-layer package upgrade is complete on mainnet;
- downstream SDK, indexer, and app work still determines how completely the
  rest of the PaperProof stack exposes controller-NFT behavior to users and
  operators.

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
- Distinguish stable artifact-series description from per-version change notes.
- Support ordinary Sui NFT transfer flows.
- Let SDKs and apps resolve control from chain state.
- Keep backwards compatibility during migration.

## 3. Non-Goals

- Do not change the meaning of published versions.
- Do not rewrite past version history on transfer.
- Do not make marketplace listing or the official website a prerequisite for
  controller authority.
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

### 4.2 Package Participation And Upgrade Scope

This redesign is centered on the current deployed protocol family. The first
controller-NFT rollout should not introduce a separate parallel package family
for artifact control.

Recommended package scope:

- `publishing` is the primary contract-upgrade surface and should own the new
  controller objects, series binding logic, migration helpers, and
  controller-aware write guards;
- `comments` should be upgraded so comments-tree moderation can verify
  controller authority instead of depending only on `CommentsTree.owner`;
- `governance` and `governance_voting` should remain in the same deployment
  family and may need additive support for migration orchestration, repair, or
  future recovery policy, but they are not the first authority-routing surface;
- `memory_registry` and `prompt_registry` do not need to be first-wave
  controller-NFT upgrade targets unless later requirements explicitly connect
  them to artifact controller authority.

Recommended first-wave rule:

- upgrade `publishing` and `comments` as the required authority-path packages;
- keep `governance` package continuity intact, even if its first controller
  changes are limited to migration support or future-proofing;
- do not split controller authority into a brand-new standalone package unless a
  later design revision proves that necessary.

Object additions are expected. New package-family additions are not the default
design assumption.

### 4.3 Current-System Invariants That Must Not Break

The current PaperProof protocol and official application already depend on a
small set of stable artifact-series anchors. The controller-NFT redesign must
preserve these invariants during the migration window:

- `ArtifactSeries.current_version_id` remains the canonical pointer to the
  latest version;
- `ArtifactSeries.version_ids` remains the canonical ordered version history;
- `ArtifactSeries.comments_tree_id` remains the canonical series-to-comments
  binding;
- `ArtifactSeries.likes_book_id` remains the canonical series-to-likes binding;
- `ArtifactSeries.ui_status` and `ArtifactSeries.status` continue to drive
  visibility and lifecycle semantics independently of controller transfer;
- existing publish and add-version flows must not create replacement comments
  trees or replacement likes books for already initialized series;
- the current `artifact_code -> series_id` identity model must remain intact;
- version-level authorship provenance must remain intact across owner transfer,
  mirror sync, controller promotion, and controller NFT transfer.

In practical terms, controller migration is an authority-routing refactor, not
an artifact-identity refactor. A successful migration must leave the current
version pointer, version history, comments tree, likes book, artifact code, and
status semantics stable.

It must also leave publication provenance stable:

- the current controller is not the same thing as the original publisher;
- the current controller is not the same thing as all historical version
  authors;
- controller transfer changes future control authority, not past authorship.

It should also improve metadata clarity without breaking existing meaning:

- artifact-series description and version change note should become distinct
  protocol concepts;
- existing type-specific version content fields must keep their current meaning
  and must not be reinterpreted retroactively as series-level description.

### 4.4 Adjacent Features That Are Not About NFTs But Could Be Broken

The controller-NFT redesign is primarily an authority refactor. However, the
current PaperProof system has several adjacent features that do not conceptually
depend on NFTs but are tightly coupled to existing artifact, version, owner,
and comments-tree state.

These features should be treated as non-regression boundaries during the
controller rollout:

- artifact visibility and lifecycle state (`status`, `ui_status`, hidden /
  active / paused semantics);
- official-content routing for Docs / Blog / Forum manifests and cached server
  rendering;
- owner-based artifact discovery, search, and portfolio-style listing;
- preprint reservation and finalize-reserved-preprint flow;
- Walrus blob references, blob-object IDs, and retention / extension workflows;
- comments and likes bindings, including tree-status and likes-book continuity;
- canonical event verification and event-to-object trust checks;
- official-content manifests and deep links that depend on `artifact_code`,
  `series_id`, `current_version_id`, `comments_tree_id`, or `likes_book_id`.

Recommended rule:

- no implementation step should treat these adjacent features as collateral
  damage that can be "fixed later";
- each should have an explicit migration or compatibility story before the
  first controller-enabled mainnet rollout.

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

Current implemented fields:

```move
public struct ControllerNFT has key, store {
    id: UID,
    version: u64,
    series_id: ID,
    artifact_code: String,
    artifact_type_name: String,
    control_right: String,
    authority_mode_name: String,
    image_url: String,
    artifact_type: u8,
    control_record_id: ID,
    issued_at_ms: u64,
}

public struct ArtifactControlRecord has key {
    id: UID,
    version: u64,
    series_id: ID,
    comments_tree_id: ID,
    artifact_type: u8,
    controller_nft_id: ID,
    current_controller_mirror: address,
    legacy_series_owner_mirror: address,
    legacy_comments_owner_mirror: address,
    authority_mode: u8,
    transfer_locked: bool,
    created_at_ms: u64,
    updated_at_ms: u64,
}
```

The controller NFT is the canonical control credential. The control record is
the binding object that makes reads and indexing easier.

Current implementation note:

- the first local implementation does not track `last_transferred_at_ms` on the
  NFT object itself;
- transfer observability is expected to come from Sui object ownership changes,
  controller-aware privileged writes, and downstream indexer reconstruction;
- `ArtifactControlRecord.current_controller_mirror` is intentionally a mirror
  and must not be treated as stronger than the actual NFT owner.

Current metadata-split implementation choice:

- the controller-enabled local contract implementation uses a normalized
  metadata-key approach rather than introducing a brand-new top-level series
  field in `ArtifactSeries`;
- series description currently lives under the reserved
  `series_description` metadata key;
- per-version change note currently lives under the reserved
  `version_change_note` metadata key in version metadata.

### 6.1.1 Controller NFT Display Metadata

The controller NFT should also expose wallet-friendly display metadata so a
holder, buyer, marketplace, wallet, or explorer can quickly understand which
artifact the NFT controls.

Recommended rule:

- protocol identifiers are the primary identity surface;
- display metadata is a convenience layer for discovery and UX;
- official website URLs must not become the authority source for control;
- links, if included, should be treated as optional convenience routes only.

Current implementation already stores the NFT-facing identity fields directly on
the `ControllerNFT` object and exposes them through helper functions. The
current marketplace display configuration in
`shared/controller::controller_marketplace` uses the following fields:

| Field | Level | Recommended value | Notes |
|---|---|---|---|
| `name` | current display field | `PaperProof Controller NFT: {artifact_code}` | This is the string currently written into `Display<ControllerNFT>`. |
| `description` | current display field | `Transferable control rights for PaperProof artifact series {artifact_code}.` | Current concise marketplace description. |
| `image_url` | current display field | PPRF image URL reused in v1 | Currently points to the shared PPRF visual asset. |
| `image` | current display field | same as `image_url` | Included for marketplace compatibility. |
| `artifact_code` | current display field | canonical artifact code | Main reverse-lookup anchor. |
| `series_id` | current display field | canonical series object ID | Strongest on-chain reverse-lookup anchor. |
| `artifact_type` | current display field | built-in artifact type name | Comes from `artifact_type_name`. |
| `control_right` | current display field | `artifact_controller` | Makes the asset class explicit. |
| `authority_mode` | current display field | `legacy_owner_only`, `dual_mode`, `controller_primary`, or `controller_only` | Mirrors current controller mode name. |
| `controller_nft_id` | current display field | `{id}` | Helpful for wallets, explorers, and off-chain joins. |

Recommended interpretation:

- `series_id`, `artifact_code`, and `artifact_type` should be enough to
  identify the controlled artifact even if no website is available;
- `link` and `project_url` should improve usability, not define truth;
- the NFT should remain understandable in wallets and marketplaces that only
  render display metadata and do not understand PaperProof-specific protocol
  reads.

Important current implementation note:

- the helper `controller_nft_name(...)` currently returns a slightly different
  label shape, `PaperProof Artifact Controller: <artifact_code>`;
- downstream SDK, indexer, and app code should treat the marketplace
  `Display<ControllerNFT>` metadata as the wallet-facing display surface and not
  assume that every human-readable label is sourced from the same helper.

Intentionally not included in the current v1 implementation:

- an official website URL as the only lookup coordinate;
- website-only labels that cannot be verified from chain state;
- metadata that implies content copyright, royalty ownership, or exclusive IP
  ownership unless the protocol later adds those rights explicitly.

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
- update artifact-series description;
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

Authorship provenance rule:

- controller authority determines who may perform a new privileged write;
- the author or publisher recorded for a version remains the signer who
  actually submitted that version transaction under the applicable authority
  rules;
- controller transfer must never rewrite past version authorship fields or past
  publish / add-version event authors.

Description and change-note rule:

- artifact-series description belongs to the series-level state and may stay the
  same across many versions;
- version change note belongs to the specific publish or add-version action and
  should be recorded on every version;
- updating artifact-series description must not rewrite historical version
  change notes;
- adding a version with a new change note does not require changing the
  artifact-series description.

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

Publishing-specific migration note:

- the current protocol already uses version-guarded shared objects, but
  `publishing` does not yet expose the same mature `migrate_*` object-family
  hooks that already exist in `comments` and `governance`;
- the controller-NFT rollout should therefore include explicit publishing-side
  migration entrypoints for any state that must be normalized or promoted;
- those migration entrypoints should cover at least root/registry compatibility
  checks, per-series controller promotion, and any future typed-record or
  control-record repair path.

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

Metadata-clarity compatibility rule:

- old version records that only contain type-specific `description`, `summary`,
  `abstract_text`, or `changelog` fields should remain readable without
  reinterpretation;
- new controller-enabled clients may surface a distinct artifact-series
  description and a distinct version change note, but must not corrupt legacy
  readings for already published versions.

The migration should also preserve current event usability:

- existing `ArtifactPublishedEvent` and `ArtifactVersionAddedEvent` consumers
  should continue to receive the same artifact identity, version, comments-tree,
  and likes-book bindings;
- existing owner-transfer and tree-owner-transfer events should remain
  meaningful as legacy mirror events during rollout;
- controller-specific events should be additive rather than silently replacing
  legacy event surfaces in the first upgrade.

The migration should also preserve current authorship evidence:

- version records must continue to preserve their original `header.author`
  values;
- publish and add-version events must remain usable as historical authorship
  evidence;
- no controller-specific migration helper may rewrite historical version author
  fields just because control authority changed later.

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
- official indexer normalization that currently keys on `owner`,
  `comments_tree_id`, `likes_book_id`, and latest-version pointers continues to
  produce stable artifact rows during the migration window;
- current app routes that load artifacts by `series_id`, `artifact_code`,
  `comments_tree_id`, or `current_version_id` continue to resolve successfully;
- ownership transfer does not accidentally change artifact status or UI status;
- controller promotion does not require rebuilding official docs/blog/forum
  manifests just to preserve existing artifact links.
- ownership transfer, controller promotion, and controller NFT transfer do not
  rewrite historical version authorship or initial-publish provenance.
- series-description updates and version-change-note updates do not overwrite
  one another or collapse into a single ambiguous field.

## 7. SDK Design

### 7.1 New Read Types

SDKs should expose:

- `ControllerNFTView`
- `ArtifactControlView`
- `series.controllerNftId`
- `series.controllerOwner`
- `series.controllerMode`
- `series.controllerHistory`
- `series.description`

SDKs should also keep provenance and control distinct in their view model:

- original publish author or initial version author;
- per-version author history;
- current legacy owner mirror, where applicable;
- current controller holder and controller mode.

SDKs should also keep series metadata and version metadata distinct:

- artifact-series description;
- per-version change note;
- existing type-specific version content fields such as summary, abstract,
  dataset description, generic-file description, or software changelog.

The SDK should treat controller fields as optional during migration, so old
clients can keep reading the legacy series shape.

### 7.2 New Read Helpers

Recommended helpers:

- `getArtifactControl(seriesId)`
- `getControllerNft(nftId)`
- `getControllerBySeries(seriesId)`
- `getControllerHistory(seriesId)`
- `canControlSeries(seriesId, walletAddress)`
- `getSeriesDescription(seriesId)`

Current contract-side helpers that downstream SDKs should wire first:

- `is_series_control_enabled(...)`
- `is_tree_control_enabled(...)`
- `series_authority_mode(...)`
- `tree_authority_mode(...)`
- `series_control_record_id(...)`
- `series_controller_nft_id(...)`
- `tree_control_record_id(...)`
- `tree_controller_nft_id(...)`
- `controller_nft_series_id(...)`
- `controller_nft_artifact_code(...)`
- `controller_nft_artifact_type_name(...)`
- `controller_nft_control_right(...)`
- `controller_nft_authority_mode_name(...)`
- `controller_nft_image_url(...)`
- `control_record_current_controller_mirror(...)`
- `control_record_legacy_series_owner_mirror(...)`
- `control_record_legacy_comments_owner_mirror(...)`
- `control_record_authority_mode(...)`
- `control_record_transfer_locked(...)`

Recommended implementation rule:

- resolve current controller from the live controller NFT object when possible;
- use the control record as a fallback mirror and display aid;
- do not infer write authorization from the control record alone.

Description/change-note read rule:

- SDK reads should expose a stable artifact-series description separately from
  the latest version's change note;
- SDK reads should expose per-version change notes in version-history views;
- clients should not have to guess whether a text field is a series description
  or a version delta note.

### 7.3 Write Helpers

Write builders should support explicit controller proof inputs:

- `controllerNftId`
- `controllerProof`
- `controllerOwner`
- `seriesDescription`
- `changeNote`

The SDK should still keep the wallet UX simple:

- auto-select when exactly one matching controller NFT exists;
- require user choice when multiple candidates exist;
- explain what transfer or wallet connection is needed when none exist.

Recommended write rule:

- every publish or add-version flow should include a required version change
  note;
- the artifact-series description may be supplied or updated when desired, but
  it is not required to change on every new version;
- SDK helpers should make the distinction explicit so operators do not reuse one
  field for both meanings by accident.

### 7.4 Known-Series Auto Resolution

For most privileged operations, the target artifact series is already known.
Examples include:

- add-version for a specific series;
- update series metadata for a specific series;
- controller-aware comments-tree moderation for a specific series;
- permission checks launched from an artifact detail page.

Recommended SDK rule:

- when a call already specifies the target `seriesId` or a resolved
  `artifactCode`, the SDK should resolve the bound controller NFT
  automatically;
- if the series has exactly one bound controller NFT and the connected wallet
  controls it, no manual controller selection should be required;
- manual selection is mainly for asset-centric workflows where the user starts
  from a wallet inventory or controller-NFT list rather than from a known
  artifact series;
- if the wallet does not hold the resolved controller NFT, the SDK should
  report that the wallet lacks control of the target series instead of asking
  the user to choose from unrelated NFTs.

This keeps the main PaperProof interaction model artifact-centric rather than
NFT-centric.

### 7.5 Compatibility Helpers

Keep `transferArtifactOwner` as a migration helper, but document it as legacy.
New helpers should distinguish:

- controller transfer;
- legacy mirror sync;
- comments-tree moderation under controller authority.

Compatibility rule for downstream consumers:

- old SDK consumers may still read `owner` as a display or filter field;
- during migration, the SDK should therefore keep exposing a stable
  owner-shaped field even when controller authority is primary;
- if controller ownership and legacy owner mirror diverge temporarily, the SDK
  should expose both values explicitly instead of silently overwriting one with
  the other.

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

### 8.5 Current Indexer Compatibility Requirements

The current indexer and public APIs already materialize artifact rows around
fields such as:

- `owner`
- `latest_version_id`
- `comments_tree_id`
- `likes_book_id`
- `artifact_code`
- `series_id`
- `status`

The controller-NFT redesign must therefore preserve a stable normalized-row
story during rollout.

Recommended rule:

- do not remove or null out the current normalized `owner` field in the first
  migration;
- treat that field as a compatibility and search surface while controller-aware
  fields are added alongside it;
- add controller-specific normalized fields and APIs instead of forcing all
  clients to reinterpret `owner` immediately;
- keep `artifacts_by_owner` and owner-based search semantics meaningful for
  legacy and non-promoted series during the migration window.
- keep version-level authorship history independently queryable from current
  controller or current owner mirror data.
- keep artifact-series description and version change notes independently
  queryable in normalized outputs.

Current `paperproof-indexer-reference` gap that must be addressed:

- the current reference schema still centers `domain_artifacts` around:
  - `owner`
  - `latest_version_id`
  - `comments_tree_id`
  - `likes_book_id`
- the current REST API still exposes owner-centric routes such as:
  - `GET /v1/search/artifacts?...&owner=...`
  - `GET /v1/my/{address}/artifacts`
- no controller-specific normalized tables, reverse-lookup endpoints, or
  authority-mode projections exist yet.

### 8.6 Official Content And Manifest Compatibility

The current PaperProof system uses official manifests and indexer-backed cached
rendering for Docs, Blog, and Forum surfaces. These features are not about NFT
authority, but they depend on stable artifact identity and latest-version
resolution.

Recommended rule:

- controller rollout must not require changing manifest schema merely to keep
  existing official content readable;
- official content lookup must continue to work from `series_id`,
  `current_version_id`, `comments_tree_id`, and `likes_book_id`;
- controller-specific metadata should be additive and must not displace the
  fields that current official-content rendering already depends on;
- if official-content APIs later add controller fields, those must be optional
  enrichment rather than hard requirements for rendering.

## 9. App Design

### 9.1 Detail Pages

Artifact detail pages should show:

- controller NFT ID;
- current controller wallet;
- legacy owner mirror, if present;
- artifact-series description;
- original publisher and historical version authorship, where available;
- transfer history;
- privileged actions available to the current wallet.

### 9.2 Publish And Add-Version

The publish and add-version flows should:

- resolve the controller NFT from the connected wallet;
- refuse write actions if the wallet does not control the NFT;
- explain whether the user needs another wallet or a transfer first;
- require a version change note for the version being published;
- keep the existing content-hash and Walrus flow unchanged.

For legacy series, the old publish and add-version paths should remain usable
until the series is explicitly migrated.

For controller series, the app should pass the controller NFT into the
transaction so the contract can verify authority directly.

Recommended UX distinction:

- artifact detail pages should present artifact-series description as a stable
  summary of the series;
- version-history and version-detail views should present change note as the
  explanation of what changed in that specific version;
- if a user publishes a new version without changing the series description, the
  UI should preserve the previous series description unchanged.

### 9.2.1 Low-Friction Non-Market UX

The protocol may use controller NFTs as the authority source without forcing
ordinary publishers to think in NFT-first terms.

Recommended app rule:

- a user who is not trading, listing, or transferring control should usually be
  able to publish and manage an artifact through the same high-level flows used
  today;
- the app and SDK should resolve the relevant controller NFT in the background
  whenever the target artifact series is already known;
- the UI should surface controller-specific explanations only when needed, such
  as wrong-wallet cases, missing control, ambiguous inventory, or explicit
  transfer workflows.

This means non-market users should experience the controller NFT mostly as an
internal authorization object handled by the SDK and wallet integration, not as
an extra manual workflow on every publish or add-version action.

### 9.3 Transfer UI

Add a control panel for:

- transfer controller NFT;
- display current holder;
- show pending transfer status;
- optionally run a legacy mirror sync for old series;
- warn that transfer changes operational control, not license terms.

The UI should surface whether a follow-up mirror-sync transaction is still
needed after an NFT transfer.

### 9.3.1 Comments Moderation Semantics

The current comments system does not give the tree owner unlimited power over
every possible state transition in the abstract. It has specific existing
semantics:

- tree owner can change tree status;
- tree owner can moderate comment status;
- comment authors can still delete their own comments under the current rules.

The controller redesign must preserve those semantics for migrated series.

Recommended rule:

- controller-aware moderation must preserve the current distinction between
  series-level controller authority and comment-author self-service actions;
- moving tree-owner authority to controller-aware verification must not remove a
  comment author's ability to delete their own comment where the current
  protocol allows it;
- controller promotion must not widen comment-moderation power in unintended
  ways.

Controller-bound comments authority should therefore be split explicitly:

| Action | Current authority | Post-controller target authority | Notes |
|---|---|---|---|
| Change comments-tree status | `CommentsTree.owner` | controller NFT authority | This is part of the artifact-level control surface and should move with the controller NFT. |
| Moderate comment status as tree owner | `CommentsTree.owner` | controller NFT authority | Controller-aware moderation should replace tree-owner-only checks for migrated series. |
| Transfer tree-owner mirror | `CommentsTree.owner` | compatibility sync helper under controller authority | After migration, this becomes a mirror-maintenance path, not the source of truth. |
| Delete or otherwise manage one's own comment under current protocol rules | comment author | comment author | Author self-service rights should remain unchanged unless the protocol explicitly changes them later. |
| Read comment tree / reply / like flows for ordinary users | open protocol interaction subject to current tree state | unchanged | The controller redesign must not turn ordinary discussion flows into NFT-gated flows. |

Recommended implementation rule:

- privileges that today exist because a user is the tree owner should migrate
  to controller-NFT-backed authority;
- privileges that today exist because a user is the comment author should stay
  author-scoped;
- no migrated series should end up in a state where the controller can add
  versions but cannot manage the official comments tree for that series.

### 9.4 Wallet And Marketplace Discovery

The controller NFT should be easy to understand outside the official app.

Recommended UX rule:

- a wallet or marketplace viewer should be able to infer the controlled
  artifact from the NFT display alone;
- clicking deeper should resolve to a richer artifact view through any capable
  frontend or indexer;
- the official website may provide one such route, but it must not be the only
  intelligible path.

Recommended reverse-lookup surfaces:

- `ControllerNFT.series_id`
- `ControllerNFT.control_record_id`
- display traits containing `artifact_code`, `series_id`, and `artifact_type`
- indexer APIs that support `controller_nft_id -> series -> artifact`

### 9.5 Marketability

The app can later expose:

- list controller NFT for sale;
- accept NFT transfer from another wallet;
- surface marketplace links.

Marketplace support should stay optional UI on top of the protocol.

### 9.6 Adjacent UX That Must Stay Stable

The following user-visible behaviors should remain stable through the
controller-NFT rollout even though they are not themselves NFT features:

- artifact visibility handling, including hidden artifacts and public filtering;
- docs/blog/forum rendering and official manifest navigation;
- owner-scoped artifact views and owner-based search filters;
- preprint reservation flow and reservation-object handling in the app;
- Walrus upload, readback, and retention-extension workflows;
- comment tree rendering, like/unlike, and per-comment moderation flows;
- current version resolution in artifact detail, docs, blog, and forum routes.

Recommended app rule:

- controller-specific UI should be introduced without destabilizing these
  existing experiences;
- if a surface currently works for a legacy series, enabling controller support
  should not force that surface to be rewritten from scratch.

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
- `update_series_description`

The new controller-aware entrypoints should be additive:

- they must not remove legacy entrypoints in the first upgrade;
- they must not require a new package family;
- they must keep existing artifact creation and version history behavior
  unchanged for legacy series.
- they must preserve `current_version_id`, `version_ids`, `comments_tree_id`,
  `likes_book_id`, `status`, and `ui_status` semantics for all existing series.

Publishing should also introduce a cleaner metadata split:

- artifact series gains a stable series-level description field or equivalent
  controller-aware storage path;
- each version gains a required version change note field or equivalent common
  header extension;
- existing type-specific text fields keep their current version-content
  semantics and are not silently repurposed.

Publishing should also emit additive controller-specific events, for example:

- controller NFT minted for series;
- controller record created;
- authority mode changed;
- legacy mirrors synchronized.

These events should supplement existing publish/version/owner-transfer events,
not replace the current artifact lifecycle event surface in the first rollout.

Recommended additive metadata events:

- artifact-series description updated;
- version published with explicit change note.

Publishing must also preserve unrelated but adjacent flows:

- preprint reservation object flow and finalize-reserved-preprint lifecycle;
- status / ui-status management;
- artifact-code identity and series-address stamping assumptions;
- official event fields used by current SDK, app, and indexer pipelines.

Publishing must also preserve the current provenance split:

- `ArtifactSeries.owner` or its controller-aware successor describes current
  control authority;
- version-record `header.author` continues to describe who published that
  version;
- the initial publish provenance of version 1 remains historical evidence and
  must not be rewritten by later control changes.

### 10.2 `comments`

`comments` should stop depending on `CommentsTree.owner` as the only authority
source once the NFT model is enabled.

Recommended rule:

- tree owner remains a compatibility mirror;
- controller-aware moderation verifies the series controller binding;
- tree transfer helpers remain for legacy migration and manual sync.
- controller-aware moderation wrappers must preserve current author-vs-tree-owner
  permission behavior for comment-status updates.

Tree comments and likes behavior should remain unchanged for non-migrated
series. The controller redesign is about authority routing, not interaction
semantics.

### 10.3 `paperproof-sdk-ts`

Current state:

- `src/types/protocol.ts` still models `ArtifactSeriesView` and
  `CommentsTreeView` around `owner` and does not expose controller-NFT-native
  fields;
- `src/utils/views.ts` parses legacy owner-based series and comments-tree
  shapes but does not decode controller objects or controller state;
- `src/builders/publishing.ts` and `src/builders/comments.ts` still target
  legacy-only write surfaces such as:
  - `transfer_artifact_owner`
  - `transfer_tree_owner`
  - add-version calls without controller proof objects
- current docs, examples, abort explainers, watchers, and tests still use
  "owner" and "tree owner" as the primary mental model.

Required adaptation:

- add controller-aware protocol types:
  - `ControllerNFTView`
  - `ArtifactControlRecordView`
  - controller-aware series and comments authority snapshots
- extend read parsers to decode:
  - controller object fields
  - dynamic-field control state
  - reserved `series_description`
  - reserved `version_change_note`
- add controller-aware transaction builders for:
  - add-version
  - series-description updates
  - controller-aware comments moderation
  - mirror sync / repair
  - controller-aware owner transfer compatibility
- preserve legacy builders during migration, but mark them as legacy or
  compatibility-oriented
- update abort explainers so "not owner" and "not tree owner" diagnostics can
  distinguish:
  - legacy series failure
  - wrong-wallet controller failure
  - stale mirror mismatch
  - missing controller NFT proof
- update examples and tests so "current owner" no longer implicitly means
  canonical controller.

### 10.4 `paperproof-sdk-py`

Current state:

- `paperproof/views.py` mirrors the TypeScript owner-centric series and
  comments-tree view model;
- `paperproof/builders/publishing.py` and `paperproof/builders/comments.py`
  still only expose legacy write paths;
- `paperproof/abort_explainer.py` still frames authorization around series
  owner and comments-tree owner only;
- service and query layers do not yet expose controller-aware read models.

Required adaptation:

- mirror the TypeScript controller-aware type additions in Python dataclasses /
  models;
- add read helpers for control record and controller NFT lookup;
- add controller-aware builders and service wrappers;
- separate stable series description from version change note in query outputs;
- preserve compatibility for existing Python automation that still works with
  legacy series.

### 10.5 `paperproof-sdk-rs`

Current state:

- Rust builders still expose legacy-only ownership transactions such as
  `transfer_artifact_owner` and `transfer_tree_owner`;
- current view parsing and examples remain owner-centric;
- read and write examples still assume the signer who controls the artifact is
  the same actor reflected by legacy owner fields.

Required adaptation:

- add Rust-side controller and control-record views;
- add transaction-plan builders for controller-aware entrypoints;
- surface migration-mode reads explicitly so CLI and automation code can route
  writes correctly;
- keep owner compatibility fields but expose them as mirrors rather than the
  only truth source.

### 10.6 `paperproof-indexer-reference`

Current state:

- the reference schema has no controller-specific tables;
- `domain_artifacts.owner` is still the only normalized "current controller-ish"
  field;
- owner-based search and "my artifacts" routes are still built on
  `owner = current holder` assumptions;
- version rows do not yet separately project:
  - stable series description
  - per-version change note
  - current authority mode
  - controller NFT binding

Required adaptation:

- add normalized controller tables, for example:
  - `artifact_controller_nfts`
  - `artifact_control_records`
  - `artifact_controller_history`
  - `artifact_permission_snapshots`
- add a controller-aware projection to `domain_artifacts`, for example:
  - `controller_nft_id`
  - `controller_holder`
  - `authority_mode`
  - `owner_mirror`
  - `comments_owner_mirror`
- preserve the existing `owner` column during migration, but redefine it in
  docs as a compatibility mirror or legacy-search field rather than guaranteed
  canonical authority
- index reserved metadata keys as first-class normalized outputs:
  - `series_description`
  - `version_change_note`
- add reverse lookup:
  - `controller_nft_id -> series_id -> artifact`
- add APIs for wallet inventory and marketplace support:
  - controller NFTs held by address
  - artifacts controlled by address
  - controller history by series
  - stale mirror detection

### 10.7 `paperproof-app`

Current state:

- the app imports the current SDK surface and therefore inherits its
  owner-centric assumptions;
- artifact detail, edit, moderation, and wallet UX do not yet surface:
  - controller NFT
  - controller holder
  - authority mode
  - owner-mirror drift
- publish, add-version, and comments moderation flows do not yet pass
  controller proof objects;
- no controller-market-specific discovery or reverse lookup UI exists.

Required adaptation:

- update artifact-detail pages to separate:
  - original author / publisher
  - historical version authors
  - current controller holder
  - legacy owner mirrors
- route privileged UI actions according to authority mode:
  - legacy-only
  - dual
  - controller-primary
  - controller-only
- make controller handling mostly invisible for ordinary publishers when the
  target series is already known
- add explicit wrong-wallet and missing-controller guidance when a connected
  wallet does not control the relevant NFT
- expose controller-aware transfer, mirror-sync, and repair workflows in admin
  or power-user surfaces
- support controller-NFT reverse lookup from marketplace-oriented entry points
  if the user arrives from the NFT side rather than the artifact side.

### 10.8 Cross-Repo Release Order

Recommended downstream adaptation order after contract work:

1. `paperproof-sdk-ts`
2. `paperproof-sdk-py`
3. `paperproof-sdk-rs`
4. `paperproof-indexer-reference`
5. `paperproof-app`

Reason:

- the SDKs need the final contract surface first;
- the indexer should normalize the new controller state before the app depends
  on it;
- the app should be the last layer to flip from legacy-owner assumptions to a
  controller-aware product experience.

### 10.9 Post-Upgrade Downstream Integration Checklist

The mainnet contract upgrade completed on 2026-07-18. Downstream validation
should still be run as one coordinated pass rather than as isolated repo-level
smoke tests, and this section remains the reference checklist for that work.

The checklist below is intended to verify the combined behavior of:

- upgraded on-chain packages
- `paperproof-sdk-py`
- `paperproof-sdk-rs`
- `paperproof-sdk-ts`
- `paperproof-indexer-reference`
- `paperproof-app`

Principle:

- treat the contract package upgrade as necessary but not sufficient
- only mark the rollout healthy when SDK reads, SDK writes, indexer
  normalization, and app rendering all agree on the same authority story

#### 10.9.1 Upgrade prerequisites

Before validating downstream repos, confirm:

- the upgraded package family is the intended mainnet deployment family
- any active governance proposal that would interfere with the package upgrade
  has been resolved or deliberately handled
- deployment records are updated with the new package IDs and object IDs
- controller-aware publish and comments entrypoints are reachable on mainnet
- a known legacy artifact series is available for migration rehearsal
- a known new-series publish path is available for fresh controller-enabled
  publish rehearsal

#### 10.9.2 Test fixture set

Use a small but explicit fixture set instead of ad hoc spot checks:

1. one unmigrated legacy series
2. one legacy series promoted only to `dual_mode`
3. one legacy or fresh series promoted to `controller_primary`
4. one controller-managed series whose controller NFT has been transferred to a
   different wallet
5. one series with multiple historical versions published before the metadata
   split
6. one series with at least one new post-upgrade version carrying an explicit
   `version_change_note`

Recommended artifact mix:

- one long-form content artifact such as `preprint` or `technical_report`
- one blog-like Markdown artifact
- one file-centric artifact such as `dataset`, `software_release`, or
  `generic_file`

#### 10.9.3 Contract-to-SDK read parity

For each fixture series, verify all SDKs agree on:

- `series_id`
- `artifact_code`
- latest `current_version_id`
- `comments_tree_id`
- `likes_book_id`
- artifact status / UI status
- `series_description`
- `series_control_enabled`
- `series_authority_mode`
- `series_authority_mode_name`
- `series_control_record_id`
- `series_controller_nft_id`

Also verify:

- `getSeriesView` / equivalent returns legacy-compatible data for unmigrated
  series
- controller-aware reads do not incorrectly mark an unmigrated series as
  controller-managed
- a transferred controller NFT is reflected as live control authority even if
  any mirror address has not yet been resynchronized
- per-version reads expose `version_change_note` separately from
  type-specific version content fields

#### 10.9.4 SDK write-path verification

For `paperproof-sdk-ts`, `paperproof-sdk-py`, and `paperproof-sdk-rs`, verify:

- legacy add-version still succeeds for an unmigrated series
- controller-aware add-version succeeds for a controller-managed series when the
  correct controller NFT is supplied
- controller-aware add-version fails cleanly, with an explicit error, when:
  - the controller NFT is missing
  - the wrong wallet controls the target series
  - the wrong controller NFT is supplied
  - `version_change_note` is omitted
- legacy compatibility owner transfer still works for unmigrated series
- controller-aware owner transfer compatibility call works for migrated series
- controller-aware comments-tree moderation calls succeed for migrated series
- comment-author self-service flows still work where the protocol already
  allows them

Verification rule:

- no SDK should need to guess authority from legacy owner mirrors alone once a
  series is controller-managed
- no SDK should panic or silently fall back to legacy mode when the controller
  path is required

#### 10.9.5 Metadata split verification

Verify end-to-end distinction between:

- stable artifact-series description
- per-version change note

Required checks:

- updating or preserving `series_description` does not overwrite
  `version_change_note`
- publishing a new version with a new `version_change_note` does not overwrite
  the stable series description
- legacy versions remain readable even if they have no first-class
  `version_change_note`
- new versions after the upgrade always surface a version-specific note in SDK,
  indexer, and app outputs

#### 10.9.6 Indexer normalization verification

After processing upgraded events and refreshed object reads, verify
`paperproof-indexer-reference` can:

- ingest controller-aware additive events without rejecting canonical publish
  and version events
- normalize `series_description`
- normalize `version_change_note`
- normalize `series_control_enabled`
- normalize `series_authority_mode`
- normalize `series_authority_mode_name`
- normalize `series_control_record_id`
- normalize `series_controller_nft_id`
- keep `owner` understandable as a compatibility mirror during the migration
  window

Also verify:

- a transferred controller NFT eventually appears as the effective controller
  state in indexer-backed responses
- old series remain discoverable by existing artifact code and series ID routes
- hidden filtering, artifact status, published date, updated date, and latest
  version resolution remain correct
- no indexer projection regresses official Docs / Blog / Forum manifest-backed
  content lookup

#### 10.9.7 App functional verification

Validate `paperproof-app` against both direct chain reads and indexer-assisted
surfaces.

Artifact detail:

- page still loads for unmigrated legacy series
- page still loads for controller-managed series
- current controller, original publisher, historical authors, and legacy owner
  mirror are not visually conflated
- series description remains stable when the newest version note changes
- version history shows version-specific notes for post-upgrade versions

Add Version:

- unmigrated series continues to use legacy flow
- controller-managed series automatically routes to the controller-aware write
  path
- missing controller authority is explained before signing
- missing `version_change_note` is blocked before signing when controller mode
  requires it

Comments and moderation:

- normal readers can still reply and like under current tree rules
- comment authors can still perform their existing self-service actions
- controller-aware moderation actions are shown only when appropriate
- migrated series does not lose comments-tree control after controller transfer

Discovery and list pages:

- Explore and type pages still show the correct latest title, dates, and
  version counts
- hidden artifacts stay hidden from public listing
- owner-scoped or wallet-scoped views remain understandable during the
  migration window

Official content:

- official Docs, Blog, and Forum routes still resolve the correct current
  artifact versions
- official content rendering does not require controller-only fields in order
  to render legacy official artifacts

#### 10.9.8 Migration-safe behavior checks

For at least one promoted legacy series, explicitly verify:

- `current_version_id` is unchanged unless a real new version was published
- `version_ids` history is preserved
- `comments_tree_id` is preserved
- `likes_book_id` is preserved
- artifact code is preserved
- artifact status and UI status are preserved
- original version-1 publish provenance is preserved
- historical `header.author` values are preserved
- no new comments tree or likes book was created by migration or transfer alone

#### 10.9.9 Operational rollout gates

Do not treat the downstream rollout as complete until all of the following are
true:

- SDK reads and writes have passed against real upgraded mainnet objects
- indexer has fully refreshed fixture-series state after the upgrade
- app has been validated on:
  - one unmigrated series
  - one dual-mode series
  - one controller-primary series
  - one transferred-controller series
- no known surface still assumes `owner` is always the canonical current
  controller
- no official content route has regressed
- deployment records and operator docs have been updated to the post-upgrade
  package line

#### 10.9.10 Failure triage order

If a post-upgrade issue appears, debug in this order:

1. contract entrypoint or control-state bug
2. SDK read-model or builder mismatch
3. indexer normalization or stale hydration bug
4. app routing or UI-state bug

Reason:

- the app should not be forced to paper over incorrect contract or SDK
  semantics
- the indexer should not become the hidden source of truth for authority logic
- authority must be correct at the protocol and SDK layers before the UI is
  trusted

## 11. Migration Plan

### Phase 1

- add controller NFT objects for new artifact series;
- keep legacy owner fields for compatibility;
- update SDK reads to prefer controller NFT fields.
- introduce the series-description / version-change-note split for
  controller-enabled flows.

Status note:

- the contract-layer work in this phase is complete on mainnet;
- downstream read/write adoption across SDKs, indexer, and app should still be
  verified against the checklist in section 10.9.

### Phase 2

- mint controller NFTs for existing series;
- backfill indexer history;
- show controller NFT in app detail pages.

Status note:

- this phase is no longer purely hypothetical because the contract layer now
  supports existing-series promotion and controller-aware reads on mainnet;
- series-by-series migration, indexer refresh, and app presentation still need
  to be treated as operational rollout work rather than assumed complete by the
  contract upgrade alone.

Existing-series migration rule:

- an already published artifact series should not need to be republished;
- the migration path should mint the controller NFT to the current series owner;
- the existing `ArtifactSeries.owner` and `CommentsTree.owner` values should
  remain as compatibility mirrors until the series is explicitly promoted;
- legacy clients should keep working against non-promoted series during the
  migration window.
- promotion of an existing series must not change its `current_version_id`,
  `version_ids`, `comments_tree_id`, `likes_book_id`, `status`, `ui_status`, or
  official content routing.
- promotion of an existing series must not rewrite version-1 publisher
  provenance or any historical version author fields.
- existing versions that were published before the split may continue using
  legacy text semantics, but newly published versions after the upgrade should
  always carry an explicit version change note.
- promotion must not invalidate owner-based discovery, official manifest
  entries, preprint reservation assumptions, or Walrus retention workflows for
  already published content.

### Phase 3

- make NFT authority the primary write gate;
- keep legacy owner checks as fallback only.

Status note:

- the contract layer now provides the controller-aware write path needed for
  this phase;
- final cutover decisions should still be made conservatively, based on
  downstream verification and migration health.

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
- current app pages that show owner, authors, comments-tree links, likes-book
  links, version history, visibility state, and official manifest-backed docs /
  blogs / forums continue to render usable data;
- owner-based search, explorer views, and owner-scoped artifact listings remain
  understandable throughout the migration window;
- comment authors can still perform the self-service actions they are allowed to
  perform today after a series enters controller mode;
- controller transfer followed by add-version does not create a new comments
  tree, new likes book, or new artifact code;
- controller promotion does not break existing artifact deep links keyed by
  `artifact_code`, `series_id`, or `current_version_id`.
- the displayed current controller can differ from the original publisher
  without causing provenance ambiguity in app, SDK, or indexer output;
- historical version author fields remain unchanged after owner transfer,
  controller promotion, and controller NFT transfer.
- artifact detail pages can show a stable series description even when the
  newest version change note is different;
- version-history views always show a version-specific change note for versions
  published after the controller-enabled metadata split;
- legacy versions remain readable without falsely pretending they already had a
  first-class series-description / version-change-note separation on chain.
- hidden / active artifact filtering, status banners, and public visibility
  behavior remain unchanged unless explicitly modified by a separate feature;
- Docs / Blog / Forum manifests and official rendered-content endpoints still
  resolve the same artifact entries and latest versions;
- preprint reservation, finalize-reserved-preprint, and reservation-object
  display continue to work;
- Walrus blob references, blob-object IDs, and retention-extension workflows
  remain valid for both legacy and controller-enabled series;
- owner-based search and owner-scoped artifact listings remain operational
  during the migration window;
- canonical event verification still succeeds for publish/version flows after
  controller-specific additive events are introduced.

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
