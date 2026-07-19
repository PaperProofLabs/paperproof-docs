Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# Artifact Control NFT Rollout History

This document records the historical rollout and migration story for the
controller-NFT upgrade.

It is intentionally separate from the current normative design in:

- `artifact-control-nft-rearchitecture.md`

Use this file when you need:

- mainnet rollout dates and package IDs;
- upgrade transaction digests;
- migration-window assumptions;
- promotion / mirror-repair background;
- historical rollout gates and regression checks.

## 1. Mainnet Rollout Snapshot

Controller-NFT support was rolled out on mainnet on 2026-07-18 through the
PaperProof package line:

- `paperproof_shared_controller`:
  `0xe68fef47337eb2ee970431fae9519c4b2bb9f4505a3d14b6b91fdfc6aae3b75c`
- `paperproof_comments`:
  `0x4962dda7d3033a6dd23724721ee38ca16720e8949b94d39826d24eb09f39e0a6`
- `paperproof_publishing`:
  `0xfd9ea70eef5220dbba93ae2bf7cd077d4ddebe03d585ebc7ad536ed3ba500660`

Upgrade transaction digests:

- shared/controller publish:
  `HuBa1wZGEcYJdJFonwycVQH7FdXvcAzu5LcmNCmv8keV`
- comments upgrade:
  `3bCSTrXW8vS7rB5uXKeEe4nt8W8PwNmPunu2K2ehuCmZ`
- publishing upgrade:
  `HPTSjkGuM2JsfCXrLaao9srpAN3V65NZuMkQUagttTbQ`

Deployer address:

- `0x4ee4f1d5fda8efc8f29f7051dff8807c8c9e4fdeadbe519fdf831aa3647235e9`

## 2. Historical Migration Model

The original rollout design preserved multiple authority modes during the
transition window:

- `legacy_owner_only`
- `dual_mode`
- `controller_primary`
- `controller_only`

That historical structure existed to let already-published series move into the
controller model without republishing or losing continuity.

The historical promotion path for an old series was:

1. identify a legacy series;
2. mint and bind controller state;
3. optionally promote to `dual_mode`;
4. optionally promote to `controller_primary`;
5. finally promote to `controller_only`;
6. repair or sync compatibility mirrors if controller ownership moved.

This is now historical rollout logic, not the intended normal public product
surface.

## 3. Historical Promotion and Mirror Helpers

During rollout, contracts and ops tooling retained helper flows such as:

- `promote_existing_series_to_dual_mode`
- `promote_existing_series_to_controller_primary`
- `promote_existing_series_to_controller_only`
- `sync_existing_series_control_mirrors`
- `repair_existing_series_control_mirrors`
- compatibility owner-transfer helpers tied to controller state

These remain relevant for:

- mainnet history;
- auditability;
- operational recovery;
- historical deployment records.

They are not intended as ordinary end-user concepts anymore.

## 4. Migration-Window Compatibility Assumptions

During the rollout window, the design intentionally assumed:

- legacy owner fields might remain readable;
- compatibility mirror fields might diverge temporarily after controller
  transfer;
- downstream reads might need to tolerate partially promoted series;
- public surfaces might need both controller state and legacy mirrors in order
  to stay backward-compatible.

That migration-window framing should no longer dominate current product design,
but it remains important when reading old scripts, old reports, or old
deployment artifacts.

## 5. Historical Downstream Rollout Gates

The original rollout gated downstream completion on checks such as:

- contract-to-SDK read parity;
- controller-aware SDK write verification;
- metadata split verification;
- indexer normalization verification;
- app functional verification;
- migration-safe behavior checks;
- operational rollout gates and failure triage order.

Those checks were appropriate while the stack was moving from mixed authority
assumptions toward controller-NFT authority.

## 6. Mainnet Existing-Series Promotion Record

Mainnet legacy-series promotion and controller-only convergence were recorded in
the contracts worktree artifacts and deployment docs, including:

- `paperproof-contracts-NFT/artifacts/mainnet-legacy-series-controller-promotion-full-2026-07-19.json`
- `paperproof-contracts-NFT/docs/Mainnet-Deployment-Record-2026-05-06.md`
- `paperproof-contracts-NFT/docs/Deployment-and-Upgrade-Runbook.md`

Those files should be treated as the canonical audit trail for how the upgrade
was actually executed.

## 7. What Still Belongs in Historical / Ops Surfaces

The following topics belong in historical or official-ops materials rather than
the normal product design:

- promotion sequencing for already-published legacy series;
- repair/sync procedures for legacy owner mirrors;
- migration-window rollback logic;
- rollout gate checklists tied to mixed-mode deployments;
- explanation of when dual-mode or controller-primary were used operationally.

## 8. Present-Day Interpretation

As of the current controller-NFT line:

- this rollout history remains important for audit and operations;
- compatibility hooks may still exist in contracts and official ops tooling;
- normal SDK, app, indexer, and community-skill design should not be driven by
  migration-window complexity.

The current rule of thumb is:

- read this file to understand how the upgrade happened;
- read `artifact-control-nft-rearchitecture.md` to understand how the system
  should behave now.
