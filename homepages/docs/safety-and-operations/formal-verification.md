# Formal Verification

Docs Path: `safety-and-operations/formal-verification`

Artifact Code: PaperProof-generic_file-001144-5a086befae7d
Series ID: 0x5a086befae7df77e18d222ce127f03ddf3d3813da6ecc4ab018a3158eab396a9
Comments Tree: locked

PaperProof completed a dedicated Sui Prover formal-verification baseline for
the core project-side Move contract logic. The purpose of this work is to make
important protocol invariants more explicit, test those invariants with formal
methods, preserve reproducible evidence, and distinguish verified claims from
claims that remain outside the current model.

Formal verification complements unit tests, integration tests, deployment
checks, mainnet smoke tests, SDK validation, and operational review. It does not
replace them.

## Verified core modules

The completed baseline covers four core modules:

| Module | Role | Reported verification posture |
|---|---|---|
| `publishing.move` | Artifact series, typed versions, publication rules, metadata, and official interaction bindings | Project-side logic effectively cleared under the validated workaround mode |
| `comments.move` | Official comments trees, comment state, replies, likes books, and interaction constraints | `100%` tracked coverage, complete in default prover mode |
| `governance.move` | Vault authority, operator boundaries, fee management, and upgrade-related controls | Project-side logic effectively cleared under the validated workaround mode |
| `governance_voting.move` | Proposal creation, locked-token voting, finalization, execution, expiry, and claims | `100%` tracked coverage, complete in default prover mode |

The baseline is intentionally focused on the core protocol-side logic that
defines durable artifact identity, official interaction state, and governance
authority. It is not a claim that every application, SDK adapter, browser
provider, storage endpoint, or future extension has been formally verified.

## Evidence branch

The complete prover workspace is kept on a dedicated evidence branch rather
than mixed into the production branch:

| Field | Value |
|---|---|
| Repository | [PaperProofLabs/paperproof-contracts](https://github.com/PaperProofLabs/paperproof-contracts) |
| Evidence branch | `formal-verification-merge` |
| Consolidated evidence commit | `67ae94f8836060f499186600255e9a010b602b2c` |
| Final report on evidence branch | `docs/Formal-Verification-Final-Report.md` |
| Final coverage summary on evidence branch | `docs/formal-verification/final-coverage-summary.md` |

The production `main` branch intentionally keeps only the deployable contract
packages, normal tests, deployment records, and a short verification summary.
The evidence branch preserves specification packages, prover-only files,
runner scripts, investigation history, and final reports without changing the
ordinary build, deployment, or test workflow.

## Why a separate evidence branch is useful

Formal-method work often introduces files that are valuable for audit but not
required for a production deployment:

- specification packages;
- prover runner scripts;
- workaround configurations;
- coverage summaries;
- investigation notes;
- environment-specific guidance;
- evidence logs.

Keeping this material on a stable evidence branch gives reviewers a durable
audit trail while keeping the production branch small and operational. It also
avoids accidentally making prover-only configuration part of the normal
contract release path.

## What was checked

The formal-verification program was designed around protocol invariants rather
than around superficial line execution alone. The verified baseline addresses
the project-side logic behind areas such as:

- official object binding and registry alignment;
- artifact-series identity and typed-version relationships;
- comments-tree and likes-book state rules;
- governance-vault authority boundaries;
- proposal and governance-config object binding;
- locked PPRF vote accounting;
- voting lifecycle constraints;
- execution and claim state transitions;
- rejection of invalid state combinations where modeled.

This work is especially relevant for PaperProof because the protocol relies on
several classes of long-lived shared objects. A frontend or indexer should not
trust an object merely because it has a familiar Move shape. The protocol and
its clients must preserve canonical root, registry, vault, series, comments,
likes, and governance relationships.

## Sui Prover limitations encountered

Two modules required a validated workaround mode for portions of their
analysis:

- `publishing.move`
- `governance.move`

The remaining non-default residuals were classified as upstream Sui Prover or
framework-modeling limitations, particularly around transfer-heavy paths and
`two_step_transfer::unwrap(...)` handling. The completed investigation did not
identify a confirmed and reproducible PaperProof contract-logic
counterexample within the modeled coverage.

This wording is deliberate. A tooling limitation and a protocol bug are not
the same thing. Conversely, a successful proof run should not be expanded into
a promise about properties that were never specified.

## Relationship to deployed mainnet packages

The verification evidence concerns the core contract families represented by
the deployed mainnet protocol:

| Capability | Current mainnet package ID |
|---|---|
| Governance | `0xc1ced3b8ae5281eeeb8cdb5527978e294c54f14a7fd8d65e7e9502d4ffffb87e` |
| Comments and likes | `0xaef346fc40bf20af62f4bbbc1608ba2272e80e4ba3d716634026baa589e9aeba` |
| Artifact publishing | `0xc9a75e4514db2a37df6f95b4e2b329c065ac6089953bd2c1c0a0c389835bd3d8` |

The dedicated Copilot prompt registry and Agent Memory registry are lightweight
protocol extensions deployed separately. Their ordinary Move tests,
integration checks, mainnet initialization, and application integration are
documented in [Native Prompts](../copilot/native-prompts.md) and
[Agent Memory](../copilot/agent-memory.md). They should not be silently
described as part of the completed four-module formal-verification baseline.

## What formal verification does not prove

The completed baseline should not be interpreted as proof that:

- every possible bug has been eliminated;
- every desired property was specified;
- every external dependency is reliable;
- Walrus gateways always return available content;
- browser CORS policies are correctly configured;
- wallet users will review transactions correctly;
- SDK adapters can never contain integration mistakes;
- indexers will always filter events correctly;
- future upgrades automatically inherit the same proof posture;
- third-party applications are safe or endorsed.

Formal verification proves specified properties inside a model and tool
boundary. Security still requires layered engineering.

## Layered assurance posture

PaperProof combines multiple forms of evidence:

| Assurance layer | Purpose |
|---|---|
| Move unit tests | Exercise expected behavior and rejection paths |
| Sui Prover baseline | Check modeled invariants in core project-side logic |
| Deployment manifests | Record official packages and shared objects |
| Binding verification | Confirm root, registry, vault, config, tree, and likes relationships |
| Mainnet smoke tests | Exercise real deployed reads and guarded workflows |
| SDK validation | Catch malformed inputs and deployment drift earlier |
| Canonical event filtering | Reject look-alike events and non-official objects |
| Interface degraded states | Avoid presenting provider failure as verified absence |

No single layer is sufficient alone. The combination is the protocol's
engineering posture.

## Upgrade rule

Formal verification must be revisited when a future upgrade changes relevant
logic. A package ID update, object migration, new governance action, altered
permission check, or new state transition may require updated specifications,
new proof runs, and refreshed evidence.

The operational rule is:

```text
Do not treat a previous verification baseline as a blanket proof for changed
contract logic.
```

## Summary

PaperProof has completed a serious Sui Prover baseline for the four core
project-side Move modules. The evidence is preserved on a dedicated remote
branch with an exact consolidated commit. The production branch remains clean,
while reviewers can inspect the full audit trail.

The correct conclusion is strong but bounded:

```text
Within the specified and modeled core-contract coverage, the completed
formal-verification work found no confirmed and reproducible PaperProof
contract-logic counterexample.
```
