# Manifests and Canonical State

Docs Path: `protocol/manifests-and-canonical-state`

Artifact Code: PaperProof-generic_file-001144-76f14765e0cb
Series ID: 0x76f14765e0cb77149f9ba1c60bf51236811be7f0007d6fef7bcccb7cca735302
Comments Tree: locked

PaperProof clients need a reliable way to discover the active deployment.

## Deployment manifest

The deployment manifest records network-specific package IDs, shared object
IDs, coin types, protocol version metadata, and package history.

Applications and indexers should use the manifest as a deployment binding, then
verify that the corresponding on-chain objects match the expected relationships.

The current core mainnet deployment includes:

| Item | Mainnet value |
|---|---|
| Protocol version | `publishing-v3-governance-v2-comments-v2` |
| PPRF package | `0x5d2ec9829a9e116de7c2008281a90b96690beb2252af120ad05a25fe13fae0da` |
| Publishing package | `0xc9a75e4514db2a37df6f95b4e2b329c065ac6089953bd2c1c0a0c389835bd3d8` |
| Comments package | `0xaef346fc40bf20af62f4bbbc1608ba2272e80e4ba3d716634026baa589e9aeba` |
| Governance package | `0xc1ced3b8ae5281eeeb8cdb5527978e294c54f14a7fd8d65e7e9502d4ffffb87e` |
| Root object | `0x7dc6c78b276825499a2204b060394e80b81196eb1f77d2036b503a2cca15dd78` |
| Governance vault | `0x0df35aa53ef37f8ca8f6a6280d743effa6e0bfc613c5c6c0a78318ad4a38f875` |

Use SDK deployment configuration or an official manifest instead of copying
these IDs into scattered UI code.

## Canonical events

Events are evidence, not conclusions. A canonical event must come from the
active package and match official root, registry, vault, series, comments tree,
likes book, prompt registry, or memory registry relationships as appropriate.

## Empty state is not failed state

Applications must distinguish:

- no canonical records found;
- provider failure;
- provider page limit reached;
- drift check failure;
- old-package events;
- partial object-read failure.

Showing "no comments" or "no votes" when the provider failed is an integration
bug.

## Trust levels

| Level | Meaning |
|---|---|
| Raw | Provider output was parsed |
| Canonical | Package and expected deployment bindings were validated |
| Verified | Referenced objects were read and relationships checked |

Canonical feeds are appropriate for ordinary display. Verified pages are
appropriate for statistics, governance history, reward calculations, and
airdrop snapshots.

## Package history and capability registries

Upgrades can introduce new package IDs while historical events remain valid for
their time. Indexers should preserve package history without treating old
packages as current write authority.

Copilot adds two lightweight registries bound to the official governance vault:

| Registry | Mainnet shared object |
|---|---|
| Native prompts | `0x14ec45eb83bb1b0eb22c7e885c7c71ea05b1e22dd05e3e1107dcef528600b0da` |
| Agent Memory | `0x9a5beeb6610b33c06771c4152c039314784437e802e200afd2ce80fb88bdf9e2` |

Routine registry updates use bounded active-operator controls instead of a
full PPRF vote for every small mutation.
