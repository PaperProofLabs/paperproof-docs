# Native Prompts

Docs Path: `copilot/native-prompts`

Artifact Code: PaperProof-generic_file-001144-663a7675df4f
Series ID: 0x663a7675df4fd8f282c55db142fd9b9c41a7744f0ba38e73a8828009679fc5ea
Comments Tree: locked

Official Copilot prompts are protocol-native content. They are not only strings
embedded in the static website bundle.

## Prompt artifacts

Prompt packages are published as PaperProof `generic_file` artifacts backed by
Walrus content. This gives each prompt:

- an artifact series;
- version history;
- content commitments;
- Walrus references;
- an auditable update path.

## Prompt registry

The prompt registry maps an application route to a prompt artifact series and a
version policy.

Examples:

- `copilot/global`
- `copilot/memory`

A route may:

- follow the latest version of the series;
- pin a specific version.

## Why this matters

Official prompts become traceable, versioned, auditable, and replaceable.
Applications can update prompt behavior without treating one static build as
the only source of truth.

Prompt registration is controlled through the governance-bound active operator.
It is intentionally lightweight and does not require a full governance vote for
each prompt revision.

## Mainnet deployment

| Item | Mainnet value |
|---|---|
| Move package name | `paperproof_prompt_registry` |
| Prompt registry package | `0x10b9c6e90a896dc3244d047e32724d80de0dc697b5ea12c5fdd8925131ed4c59` |
| Prompt registry object | `0x14ec45eb83bb1b0eb22c7e885c7c71ea05b1e22dd05e3e1107dcef528600b0da` |
| Global prompt series | `0x13c99b4811d9b89fd0decd8e9c713bafd639e6af3401a18043aed7e0270044fb` |
| Memory descriptor series | `0xd378b519436dcfe34b36f716b528b0b12350d08911ee294cd0248f1cd3dada9b` |

The current official routes are `copilot/global` and `copilot/memory`.

## Mainnet transaction trail

| Action | Transaction digest |
|---|---|
| Publish prompt registry package | `5ET2F9jMnw8xBB3hCfa1wGyEj1x5CHYi1QhfaTZLbW8j` |
| Create `PromptRegistry` | `J4fzBiF9ZFpg9QW7MeSDHekcPVj2K8R3Sfw36fN7EY7e` |
| Publish global prompt artifact | `54JGtVwL5cVK7UeJw3TM9LXzGAjzWcVeih5eNTjLNJ7e` |
| Register `paperproof-app/copilot/global` | `AdHgZjYc1S8yts7EixqV8ouaMhpfd7dYiyKWpYhCURM7` |
| Publish memory descriptor artifact | `6DurwqWwQFUf5wAhzQgEU7NBurrTmJLFiY81akyQFpGd` |
| Register `paperproof-app/copilot/memory` | `AGKpoCpWDqoRj1mPQCyFda3KJwrPTmMmEiUg6xEprUtK` |
| Add memory descriptor version 2 | `GdcdC8Mjs3qEpbHX4GLZn7KNZk21LFmi2uah8y7gjtjD` |
| Re-register memory descriptor latest policy | `7Cg2YHJFovcCszS9NB73YNezgmUgCdmuctWFMRXVxSDr` |

The current memory descriptor version is:

```text
0x252f472c3bacb18927dc06cc366a909096be9dcfceb8cf41308238041e96c1c2
```

## Version model

Prompt packages use:

```text
application/vnd.paperproof.prompt+json
```

To update a prompt:

1. Encode and validate a prompt JSON package.
2. Store it on Walrus.
3. Publish a new `generic_file` version on the existing series.
4. Keep latest-version policy for normal rollout.
5. Pin a version only for controlled rollout or rollback.

Official prompts are traceable, versionable, auditable, and replaceable.

## Governance relationship and fallback

The registry binds to the existing official `GovernanceVault`. Route writes
check the vault's active operator. Arbitrary addresses cannot change official
bindings, but ordinary maintenance does not require a PPRF vote for every
revision.

The static app resolves the registered version, downloads the Walrus package,
validates its schema, and injects it before a bundled fallback prompt. If the
remote path fails, the fallback keeps Copilot available.
