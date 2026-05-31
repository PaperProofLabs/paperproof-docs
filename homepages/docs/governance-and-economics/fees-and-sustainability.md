# Fees and Sustainability

Docs Path: `governance-and-economics/fees-and-sustainability`

Artifact Code: PaperProof-generic_file-001144-c03facf29081
Series ID: 0xc03facf2908192e7c8d1f9dfb65f34cca15ac423d0e05fb609f2cd045bdb617e
Comments Tree: locked

PaperProof fees are primarily resource and spam boundaries.

## Cost layers

Users may encounter:

- Sui gas for object-state transactions;
- Walrus storage costs for large content;
- PPRF-based participation requirements where applicable;
- external provider costs for optional model or memory services.

## Protocol fees

Publishing, adding versions, and comments may use governance-aware fee levels.
Fees may be low or zero during some phases, but bounded metadata, status checks,
and canonical object relationships remain important anti-abuse controls.

## Sustainable growth

Long-term maintenance may require grants, bounties, documentation work,
indexers, storage-maintenance tooling, and community applications. Incentives
should reward useful ecosystem work rather than encourage low-quality
publish-to-earn behavior.

## Fee manager

`FeeManager` is the canonical fee configuration object bound to the official
root. It records:

```text
fee_key -> fee_level
```

Publishing uses artifact type IDs as fee keys. Comments use a reserved comments
fee key. A missing explicit fee level is treated as free.

The configured levels are `FREE`, `MICRO`, `LOW`, `STANDARD`, `HIGH`, and
`PREMIUM`. Contracts reject foreign vault or fee-manager objects, so callers
cannot bypass official fee policy with look-alike shared objects.

## Fee recipient and treasury path

The governance vault records the fee-recipient address. Successful nonzero fee
collection routes SUI immediately to that address and emits an auditable event.
The current contracts do not accumulate funds in a dedicated treasury object.

A future treasury can remain a separate module:

1. Designate a treasury-controlled recipient.
2. Use governance to update the fee recipient.
3. Add custody, budgeting, and disbursement flows only when needed.

Keeping fee configuration separate from a future treasury avoids premature
complexity.

## Sustainable product design

Interfaces should show meaningful costs before signing and avoid hiding storage
stages. Protocol sustainability should come from useful publication, tooling,
applications, and ecosystem services, not from encouraging spam.
