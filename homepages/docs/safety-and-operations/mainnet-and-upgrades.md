# Mainnet and Upgrades

Docs Path: `safety-and-operations/mainnet-and-upgrades`

Artifact Code: PaperProof-generic_file-001144-dec207341218
Series ID: 0xdec207341218c3d9ae0565d0bdf24b59e5b9d490311780100ee4789274334d11
Comments Tree: locked

PaperProof has mainnet deployments for its protocol modules and official
capability registries. During the early protocol phase, upgrades and deployment
changes remain possible.

## Why manifests matter

Package IDs may change during upgrades. Applications should load the active
deployment manifest and verify object relationships rather than scattering
hardcoded IDs through UI code.

## Compatibility boundary

If only package bindings change and entry signatures remain compatible, a
manifest update may be sufficient for many clients.

If entry signatures, object layouts, event schemas, or semantic rules change,
SDKs and indexers may require new releases.

## Historical events

Indexers should preserve package history so they can explain historical events
without mixing them into current canonical state.

## Operational caution

Pre-launch mainnet setup and smoke-test transactions may exist before formal
public operations begin. Users should rely on current official deployment
references and release notes.

## Current core deployment

The core deployment manifest records:

| Item | Mainnet value |
|---|---|
| Deployment name | `paperproof-mainnet-2026-05-13` |
| Protocol version | `publishing-v3-governance-v2-comments-v2` |
| Root object | `0x7dc6c78b276825499a2204b060394e80b81196eb1f77d2036b503a2cca15dd78` |
| Type registry | `0x966ffa24d0a96b34267b62c628f39c830afc9de25438b6502835fa8a3815d6b5` |
| Fee manager | `0x7bb8360ea1fa50f923628c929b8726b00eb8968c6a678acde71f97ae146e9249` |
| Governance vault | `0x0df35aa53ef37f8ca8f6a6280d743effa6e0bfc613c5c6c0a78318ad4a38f875` |

The mainnet RPC endpoint recorded by the deployment manifest is:

```text
https://fullnode.mainnet.sui.io:443
```

## Deployed Move package catalog

The following table lists the current official Sui mainnet packages. Package
names come from the Move package metadata. A package ID is both a deployed
address and part of the Move type or call path.

| Capability | Move package name | Current mainnet package ID | Notes |
|---|---|---|---|
| PPRF token | `pprf` | `0x5d2ec9829a9e116de7c2008281a90b96690beb2252af120ad05a25fe13fae0da` | Fixed-supply token package, version `1` |
| Governance | `paperproof_governance` | `0xc1ced3b8ae5281eeeb8cdb5527978e294c54f14a7fd8d65e7e9502d4ffffb87e` | Current v2 call package |
| Comments and likes | `paperproof_comments` | `0xaef346fc40bf20af62f4bbbc1608ba2272e80e4ba3d716634026baa589e9aeba` | Official interaction package |
| Artifact publishing | `paperproof_publishing` | `0xc9a75e4514db2a37df6f95b4e2b329c065ac6089953bd2c1c0a0c389835bd3d8` | Current reserved-preprint publishing package |
| Native Copilot prompts | `paperproof_prompt_registry` | `0x10b9c6e90a896dc3244d047e32724d80de0dc697b5ea12c5fdd8925131ed4c59` | Lightweight governed route registry |
| Copilot Agent Memory | `paperproof_memory_registry` | `0xbe9527ee927c4a6dcb91d5503758cd731d311813cd70d93914f2bf58a36db3d1` | Current v2 capability registry package |

The PPRF coin type is:

```text
0x5d2ec9829a9e116de7c2008281a90b96690beb2252af120ad05a25fe13fae0da::pprf::PPRF
```

## Canonical shared objects

| Object | Object ID | Purpose |
|---|---|---|
| `PaperProofRoot` | `0x7dc6c78b276825499a2204b060394e80b81196eb1f77d2036b503a2cca15dd78` | Canonical protocol entry point |
| `TypeRegistry` | `0x966ffa24d0a96b34267b62c628f39c830afc9de25438b6502835fa8a3815d6b5` | Artifact-type activation and index bindings |
| `FeeManager` | `0x7bb8360ea1fa50f923628c929b8726b00eb8968c6a678acde71f97ae146e9249` | Canonical fee configuration |
| `GovernanceVault` | `0x0df35aa53ef37f8ca8f6a6280d743effa6e0bfc613c5c6c0a78318ad4a38f875` | Canonical authority boundary |
| `GovernanceConfig` | `0x7ed018db6b2cd7c32692a1c33543fb90d9c36add1226f93cbeb2a8fb10955dfa` | Voting configuration and proposal mapping |
| `PromptRegistry` | `0x14ec45eb83bb1b0eb22c7e885c7c71ea05b1e22dd05e3e1107dcef528600b0da` | Official Copilot prompt route bindings |
| `MemoryRegistry` | `0x9a5beeb6610b33c06771c4152c039314784437e802e200afd2ce80fb88bdf9e2` | Official Agent Memory discovery and policy |
| Sui `Clock` | `0x6` | Chain-provided timestamp source |

The root embeds the comments tree factory capability and governance action
executor capability. These embedded values constrain official creation and
execution paths without exposing extra shared factory objects.

## Artifact type indexes

The initialized type registry records one `TypeIndex` marker for each built-in
artifact family:

| Artifact type | TypeIndex object ID |
|---|---|
| `preprint` | `0xcbc3da7cf963765028ee0aec969338b81dbd3fb43b30b768f20e97b1921aea7e` |
| `blog_post` | `0x3dc638b61be5cca767712825f3580c54df57ef68f5b1c34d1d01c535a63f8a40` |
| `technical_report` | `0x283d86e93cb24d69bdfd803b3db24aa23257943acb79b9980b5dfcf68c54c593` |
| `dataset` | `0x83e6c80c35e6a47e6ba48399025f447c0cda44f4bd5106266f2e750c4d60a4d2` |
| `software_release` | `0x8d7f183623a68f6651d92c8207e69df3859aaf3523bc324c7bc8fc6056dbaaee` |
| `generic_file` | `0xbea92cca6ab20d7a0bea6a69868eb346ff5383197aae11d4d3e45220570a1d15` |

`TypeRegistry` is the source of truth for enablement. `TypeIndex` is not a
global sequential artifact-code allocator.

## Capability registry initialization

The native prompt registry is initialized with official PaperProof artifact
series:

| Route | Artifact series | Current policy |
|---|---|---|
| `copilot/global` | `0x13c99b4811d9b89fd0decd8e9c713bafd639e6af3401a18043aed7e0270044fb` | Follow latest |
| `copilot/memory` | `0xd378b519436dcfe34b36f716b528b0b12350d08911ee294cd0248f1cd3dada9b` | Follow latest |

The Agent Memory registry is initialized with:

```text
provider = memwal
enabled = true
min_schema_version = 1
max_schema_version = 1
```

Both registries bind to the official `GovernanceVault`. They use
governance-bound active-operator checks for routine maintenance.

## Recorded upgrade history

The publishing package was upgraded on 2026-05-13 to add reserved preprint
codes and disable direct first-publication for preprints. The Agent Memory
registry was upgraded in place to version 2 on 2026-05-30 before public release.
That upgrade changed newly created memory entries to available by default while
preserving operator availability control.

## Key deployment transactions

| Action | Transaction digest |
|---|---|
| Publish governance package | `Cu2svZHd8vURahtpfJ7a7AxWEyXTmcnxkLn9VzJz3mQp` |
| Publish comments package | `F4ytUL3rytWuf75ALU8gEfAcfFmXzn3G3cdAWEXZJGBU` |
| Publish publishing package and initialize root | `GSgK9mHjsWdwmVTfDfdWLwrVeBHXKn43HTa92D42tDNR` |
| Create and bind `GovernanceConfig` | `DXoa8uRy7vEu1dTJzzgVNYLc8WKLN5ksADjVSPidtBaV` |
| Upgrade governance to v2 | `8TpVmJuCMYwpesBdQmazK4fgfcweihL6vcRZumcjX8Cv` |
| Migrate governance v2 action table | `9PxfYxXzNkwHqpAgPAkDrhr8pr6DweZZUSpnLRSNiBU6` |
| Upgrade publishing reserved-preprint flow | `FiavutiZGoDXWab4LRbHidVDcPb6piYq3mMvN212XMbX` |
| Publish prompt registry package | `5ET2F9jMnw8xBB3hCfa1wGyEj1x5CHYi1QhfaTZLbW8j` |
| Create `PromptRegistry` | `J4fzBiF9ZFpg9QW7MeSDHekcPVj2K8R3Sfw36fN7EY7e` |
| Publish current memory registry line | `C8pHX6fa4kN58XAo7Fnox59RpSKuuVqHRW9PvoEkfAa5` |
| Create `MemoryRegistry` | `GF9iaJatdhXP56KUuGNHeH19dBeTTy22vrBYSChMTjcE` |
| Enable MemWal provider policy | `H3WKZz3fuG6PfkZE8XGe1yoBgmoEw3sHSfwp1JSDivwy` |
| Upgrade Agent Memory registry to v2 | `ApesDHyse7VDWsEzxTFrWQyetygk9sJ9PmMs46ekL6UC` |

## Upgrade discipline

Long-lived shared objects carry versions and critical entrypoints guard
supported versions. Upgrade preparation favors stable core layouts, explicit
migration hooks, deployment manifest updates, SDK release updates, and indexer
compatibility review.

Sui package upgrades still depend on real `UpgradeCap` custody. Protocol
governance, recorded upgrade authority, operational custody, object migrations,
SDK adapters, and manifest routing must remain aligned.

## Formal verification baseline

PaperProof completed a dedicated Sui Prover baseline for the core project-side
logic in publishing, comments, governance, and governance voting. The complete
evidence workspace lives on the `formal-verification-merge` branch at commit:

```text
67ae94f8836060f499186600255e9a010b602b2c
```

The production branch intentionally excludes prover-only workspace files.
Formal verification is a strong engineering input, but its claim is bounded:
it covers specified and modeled properties, not every possible bug or external
integration failure.

## Package history

The core manifest preserves historical package IDs:

| Family | Historical and current packages |
|---|---|
| Publishing | `0xe67a6956f37c3182354189d9b77ca14058694aad82522da0c6cb91cfddee4782` -> `0xc9a75e4514db2a37df6f95b4e2b329c065ac6089953bd2c1c0a0c389835bd3d8` |
| Governance | `0x75923624e354789e995537e88afaab698bd405a61f91926e3f8837fb7cc6b5cf` -> `0xc1ced3b8ae5281eeeb8cdb5527978e294c54f14a7fd8d65e7e9502d4ffffb87e` |
| Comments | `0xaef346fc40bf20af62f4bbbc1608ba2272e80e4ba3d716634026baa589e9aeba` |

Historical package retention matters for explorers and indexers. An old event
can be a legitimate part of protocol history without being an authorized
source for current writes.

## Memory registry replacement and v2 upgrade

Agent Memory has a more specific pre-release history. An earlier registry
deployment was superseded when the finalized model added an active-entry index
for one-active-memory-per-wallet-and-app discovery. The official app and SDK
use the current shared registry object only.

The current registry package was then upgraded in place to:

```text
0xbe9527ee927c4a6dcb91d5503758cd731d311813cd70d93914f2bf58a36db3d1
```

The shared registry object remained:

```text
0x9a5beeb6610b33c06771c4152c039314784437e802e200afd2ce80fb88bdf9e2
```

This is a useful example of why package IDs, shared object IDs, semantic
version notes, and SDK defaults should be tracked together.
