# Governance

Docs Path: `governance-and-economics/governance`

Artifact Code: PaperProof-generic_file-001144-e7b6301a68d4
Series ID: 0xe7b6301a68d4357651d4d65e257a4e18d92b03bfddc9ee3cc38f60066a9d24ba
Comments Tree: locked

PaperProof governance supports signal proposals, executable proposals, voting,
finalization, execution where applicable, and claims for locked voting funds.

## Proposal lifecycle

1. A proposal is created.
2. Eligible participants vote with locked PPRF.
3. The proposal is finalized after the required conditions are met.
4. Executable proposals may update governed state.
5. Voters claim unlocked funds according to proposal state.

## Governed state

Governance paths may affect:

- fee configuration;
- artifact-type enablement;
- operator and authority transitions;
- pause state;
- upgrade authority;
- enabled governance actions;
- direct authority mode.

Prompt and memory registries use a lighter governance-bound operator model.
Official route updates and memory availability controls are operator actions
bound to the governance vault, without requiring a full token vote for each
small update.

## Governance is not automatic legitimacy

Vote results are protocol facts. They are not a guarantee of wisdom, fairness,
or social approval. Applications should show proposal payloads, vote totals,
locked funds, execution status, and claim state clearly.

## Passage and execution

Votes lock `PPRF` in the proposal. Each address votes once. The proposal
creation stake is recorded as a yes vote. The current passage rule requires
both relative and absolute support:

```text
yes_votes * 3 >= no_votes * 4
yes_votes * 10 > PPRF total_supply
```

Only one proposal may be active at a time. Proposal closure is permissionless:
any account can finalize after the voting window, resolve a determinable result
early, or expire a stale passed executable proposal after its execution window.
Locked tokens are reclaimed by address after closure.

Executable proposals can mutate governed state. Signal proposals record formal
community intent without directly changing contracts.

## Governance vault boundary

`GovernanceVault` is the canonical root authority boundary. It records the
active operator, fee recipient, upgrade authority, direct-authority mode, and
official governance configuration binding.

Some passed actions are applied entirely inside governance. Others, such as
artifact-type activation and fee changes, execute through official publishing
entrypoints that borrow a root-embedded executor capability. This keeps
dependencies cycle-free while ensuring proposals are consumed through the
official path.

```text
UpgradeCap makes code available.
Governance enables protocol capabilities.
```

## Lightweight registries

The native prompt and Agent Memory registries bind to the existing vault and
check the active operator for maintenance actions. They do not create a second
governance system. Routine route updates, provider policy, descriptor policy,
and memory availability controls do not require a token vote every time.
