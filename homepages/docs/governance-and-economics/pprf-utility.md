# PPRF Utility

Docs Path: `governance-and-economics/pprf-utility`

Artifact Code: PaperProof-generic_file-001144-f59f80fd0346
Series ID: 0xf59f80fd0346e155c3e2bcf7150bcf83221ffc949d2fa1d643e96705ce6746b2
Comments Tree: locked

PPRF is the PaperProof governance and participation asset.

## Mainnet token identity

PPRF is deployed on Sui mainnet as a fixed-supply currency.

| Field | Mainnet value |
|---|---|
| Token name | `PPRF Token` |
| Symbol | `PPRF` |
| Move package name | `pprf` |
| Move module | `pprf` |
| Mainnet package ID | `0x5d2ec9829a9e116de7c2008281a90b96690beb2252af120ad05a25fe13fae0da` |
| Coin type | `0x5d2ec9829a9e116de7c2008281a90b96690beb2252af120ad05a25fe13fae0da::pprf::PPRF` |
| Package version | `1` |
| Decimals | `9` |
| Whole-token supply | `10,000,000,000 PPRF` |
| Base-unit supply | `10,000,000,000,000,000,000` |
| Currency object | `0x3f105caf943b3b4a7c837553ec5b4782340ce1b99b99c2b0a57aeea2b1039e59` |
| Upgrade capability | `0xf8b768b6ed2c953a6afd716ddbe5a8b3b2710d4f14610381dd2d4474ede6526b` |

The token contract mints the complete supply once during initialization and
converts the treasury capability into fixed-supply state. No surviving object
can mint additional PPRF. A separate metadata capability may update the display
icon URL, but it cannot alter supply, decimals, symbol, or name.

The governance configuration captures the same hard-capped supply in base
units as its voting denominator:

```text
10,000,000,000,000,000,000
```

## Current protocol roles

PPRF currently supports:

- governance voting with locked funds;
- proposal participation;
- proof-of-holding signals for likes.

## Interpretation boundary

A PPRF vote is a governance action. A PPRF-backed like is a participation
signal. Neither proves that an artifact is accurate, lawful, safe, original, or
valuable.

## No market promise

PaperProof does not guarantee:

- token price;
- liquidity;
- exchange listing;
- yield;
- redemption;
- repurchase;
- future incentives;
- investment return.

Protocol participation should be evaluated independently from token speculation.

## Governance participation

PPRF voting is lock-based. Tokens committed to a vote are held for the proposal
lifecycle and reclaimed by address after closure. This makes voting an explicit
protocol action rather than a cost-free survey click.

Governance covers decisions such as fee configuration, artifact-type
activation, authority transitions, action availability, and direct-authority
sunset. Applications should show proposal payload and lifecycle, not only a
headline vote count.

The current governance proposal-creation threshold is:

```text
10,000,000,000,000,000 base units = 10,000,000 PPRF
```

Proposal passage requires both relative support and absolute supply support.
This makes the fixed total supply part of the governance security model.

## Lightweight social signaling

A like requires a PPRF holding proof. This gives likes a participant-signal
meaning that differs from an unrestricted social click. It may support
curation, participant discovery, or third-party analytics.

The current comments contract requires a proof coin containing at least:

```text
1 PPRF
```

The coin is evidence of holding for the action. A like is not a burn, payment,
or voting lock.

The boundary remains important: a PPRF-backed signal is not peer review, legal
clearance, security certification, investment advice, or Labs endorsement.

## Future utility discipline

Possible future grants, bounties, curation experiments, or ecosystem incentives
should be documented separately, avoid guaranteed-return language, and reward
useful work rather than low-quality volume.

## Current boundaries

PPRF is not currently the protocol fee token. Publishing and comment fees are
configured in SUI. PPRF does not currently carry treasury cash-flow rights,
guaranteed distributions, redemption rights, yield, or a promise of market
liquidity. Its implemented utility is strongest in governance control,
proposal access, and lightweight participation signaling.
