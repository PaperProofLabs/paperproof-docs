# Agent Memory

Docs Path: `copilot/agent-memory`

Artifact Code: PaperProof-generic_file-001144-4d82d243557a
Series ID: 0x4d82d243557a13b20cb6b2fbac0aa59000694cf4b5d67e9104081ce20aabdda0
Comments Tree: locked

Agent Memory is an optional Copilot capability for wallet-linked preferences
and task context across sessions.

The official app currently presents four memory actions:

| Action | Meaning |
|---|---|
| `Enable` / `Disable` | Locally allow or pause memory use in Copilot answers |
| `Create` / `Delete` | Register or tombstone the official on-chain memory capability entry |
| `Update` | Save the latest relevant memory through MemWal |
| `Access` / `Revoke` | Authorize or remove this browser's local memory access |

## Typical flow

1. Connect your Sui wallet.
2. Open Copilot settings.
3. Select `Access` to authorize this browser.
4. Select `Create` to register the official memory capability.
5. Select `Enable` to let Copilot recall memory when answering.
6. Ask Copilot to remember a preference, or select `Update`.

## One active entry per wallet and app

The official registry supports at most one active memory entry per wallet and
app ID. A deleted entry no longer blocks a new registration.

## What delete means

`Delete` tombstones the PaperProof registry entry and releases the active-entry
mapping. It does not delete external MemWal or Walrus data.

## What each button changes

| Control | State layer | Result |
|---|---|---|
| `Enable` / `Disable` | Local browser | Allow or pause recall in Copilot answers |
| `Create` / `Delete` | Sui registry | Register or tombstone the official capability entry |
| `Update` | MemWal and Walrus | Save selected durable memory content |
| `Access` / `Revoke` | Browser and MemWal authorization | Authorize or remove this browser's delegate access |

Entering Copilot should refresh chain and local state so labels match reality.
An existing active entry should show `Delete`, not `Create`. Authorized local
access should show `Revoke`, not `Access`.

## Registry object model

Each registration creates a separate shared `MemoryEntry`. The registry also
maintains an active-entry index enforcing at most one live entry per wallet and
app ID. Separate entry objects avoid routing every user's updates through one
large shared mutable table.

| Field | Official default |
|---|---|
| `app_id` | `paperproof-app` |
| `memory_id` | `copilot/profile` |
| provider | `memwal` |
| namespace root | `paperproof/copilot` |

Ordinary users do not need to enter those values. The app derives them from
wallet state, native prompt configuration, MemWal, and chain registry state.

## Official usability checks

Official Copilot should use an entry only when it belongs to the configured
registry and connected owner, operator-managed `available` is true,
`owner_deleted` is false, `owner_enabled` is true, the provider policy is
enabled, and the schema version is accepted.

The current mainnet registry enables `memwal` schema version `1`. The deployed
version 2 registry makes newly created entries available by default. The active
operator can still disable an entry.

## Mainnet registry deployment

| Field | Mainnet value |
|---|---|
| Move package name | `paperproof_memory_registry` |
| Current package ID | `0xbe9527ee927c4a6dcb91d5503758cd731d311813cd70d93914f2bf58a36db3d1` |
| Original package ID for current registry line | `0x816684a152fdee1e7f15f65d18873ed7ee48540e8bd4205b3197a5ec0feda2c6` |
| Shared `MemoryRegistry` object | `0x9a5beeb6610b33c06771c4152c039314784437e802e200afd2ce80fb88bdf9e2` |
| Upgrade capability | `0xaab4745558cbde7703ea682eea3ceeb4d26d4e25749eb74c3cb6c94adcf74a0c` |
| Current registry package generation | `v2` |

The official current registry line was initialized and upgraded through:

| Action | Transaction digest |
|---|---|
| Publish package | `C8pHX6fa4kN58XAo7Fnox59RpSKuuVqHRW9PvoEkfAa5` |
| Create `MemoryRegistry` | `GF9iaJatdhXP56KUuGNHeH19dBeTTy22vrBYSChMTjcE` |
| Enable MemWal provider policy | `H3WKZz3fuG6PfkZE8XGe1yoBgmoEw3sHSfwp1JSDivwy` |
| Upgrade registry package to v2 | `ApesDHyse7VDWsEzxTFrWQyetygk9sJ9PmMs46ekL6UC` |

An earlier pre-release registry was superseded after the active-entry index was
added. Applications and SDKs should use the current object above.

## Static deployment boundary

Creating and deleting the chain entry do not require an app backend. Saving and
recalling the private body require a reachable MemWal relayer. Local demos can
use the Vite `/memwal-relayer` proxy. Static production requires a
CORS-compatible relayer.

If that relayer fails, ordinary Copilot, wallet signing, native prompts,
memory registration, and access transactions should continue working. Only
recall and saving should degrade with a clear error.

## Lifecycle example

Consider a wallet using PaperProof Copilot on a new laptop:

1. The app refreshes the configured registry and looks for the wallet's active
   `paperproof-app` entry.
2. If an entry already exists, the app shows `Delete`; otherwise it shows
   `Create`.
3. The user selects `Access`. The browser creates or reuses the wallet-linked
   MemWal account, generates local delegate material, registers access, and
   stores the private delegate locally.
4. The user selects `Create` only when no active entry exists. The chain entry
   points to the MemWal account and the official descriptor prompt series.
5. The user selects `Enable`. This changes local recall behavior only.
6. A direct memory request such as "please remember that I prefer concise
   answers" is saved through MemWal when the official usability checks pass.
7. The user can `Revoke` the laptop's local access while keeping the registry
   entry, or `Delete` the registry entry while leaving external stored bytes
   untouched.

On another computer, the same wallet can authorize again. The user should not
need to copy a delegate key or manually enter registry object IDs.

## Governance relationship

The memory registry mirrors the native prompt registry's lightweight
governance relationship. It binds to the official `GovernanceVault`.
Operator-managed calls validate the current vault, registry root, and active
operator. This allows official provider policy and per-entry availability
management without a heavyweight proposal for every user memory action.

Users still control their own creation, enablement, and deletion paths within
the registry rules.
