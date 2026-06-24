Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# PaperProof SuiNS Display Design

## Purpose

PaperProof currently displays many Sui addresses directly in the official app:

- connected wallet address;
- artifact owner and authors;
- comment authors;
- governance proposer and voter addresses;
- proposal-related recipient or authority addresses;
- any other identity field that today shows a raw `0x...` value.

For ordinary users, long addresses are hard to scan and easy to confuse. If a
SuiNS domain exists for an address, the official app should prefer the domain
name in the UI. Raw Sui addresses should remain the fallback when:

- no SuiNS name exists for the address;
- the SuiNS lookup fails;
- the lookup times out;
- the returned name is malformed or untrusted.

This document defines the display-only design. It does not change protocol
state, contract behavior, artifact schemas, version objects, comments, or
governance logic.

Current scope constraint:

- phase 1 must not add any server-side SuiNS resolver, cache API, indexer
  endpoint, database table, or backend dependency;
- phase 1 must remain a frontend-only display enhancement.
- phase 1 queries must be issued by the browser directly, not proxied through
  the PaperProof server.

## Product Requirement

Address rendering in the PaperProof official app should follow this order:

1. If the value is not a valid Sui address, render it as-is.
2. If it is a valid Sui address and a SuiNS primary name is resolved, display
   the SuiNS name.
3. If resolution returns no name, display the truncated Sui address.
4. If resolution fails or times out, also display the truncated Sui address.

The default visible state must always be the existing raw-address UI. SuiNS is
an optional progressive enhancement applied only after a successful lookup.

The underlying raw address must remain available for:

- copy actions;
- tooltips;
- links to chain explorers;
- protocol verification workflows;
- developer-facing diagnostics.

In short:

```text
display label = preferred SuiNS name, else short Sui address
copy value = canonical Sui address
```

## UX Rules

### Preferred Surfaces

Apply the behavior anywhere the app currently shows user or protocol addresses,
especially:

- artifact detail sidebar authors;
- artifact owner labels;
- comment author labels;
- likes and governance participant lists;
- connected wallet summary;
- proposal proposer / voter / recipient labels;
- Copilot-rendered identity metadata if it reuses frontend render helpers.

### Display Rules

- Show the SuiNS name exactly as resolved, preserving case if the naming system
  treats it as display-safe.
- Still expose the raw address on hover or copy affordances.
- Do not replace explorer target URLs with SuiNS names. Explorer links should
  continue to use canonical addresses.
- If a field shows multiple authors, resolve each address independently.
- Non-address author strings such as `PaperProof Labs` must remain unchanged and
  must not be sent through SuiNS resolution.
- If any uncertainty exists, prefer showing the original address rather than a
  guessed or partially resolved name.

### Truncation Rules

When a SuiNS name is resolved:

- show the domain name normally;
- if the name is extremely long, truncate visually with CSS ellipsis but keep
  the full name in tooltip text.

When no name is resolved:

- continue showing the compact address form already used by the app.

## Trust And Verification Principles

SuiNS is a convenience layer for presentation, not the trust root.

- The protocol identity remains the Sui address.
- The UI should never hide the underlying address from copy/inspection paths.
- SuiNS lookup results must not alter signing, publishing, governance, comment,
  or permission logic.
- Cache entries should be treated as advisory UI metadata, not authoritative
  ownership records.

The design goal is:

```text
friendlier display without changing protocol truth
```

## Resolution Strategy

Repository:

```text
paperproof-app
```

Suggested frontend module:

```text
src/services/suins.ts
```

Responsibilities:

- validate whether a string is a Sui address;
- resolve primary SuiNS name for an address;
- cache successful and negative lookups in memory;
- expose a small helper for UI renderers:

```ts
resolveDisplayIdentity(input: string): Promise<{
  rawAddress: string | null;
  displayLabel: string;
  suinsName?: string | null;
  resolved: boolean;
}>
```

### Preferred Query Model

Use a read-only SuiNS lookup path compatible with the official app's current
Sui read client. Do not add a backend dependency, indexer endpoint, or server
cache interface in phase 1.

Chosen direction:

- browser-side direct lookup;
- official Sui client reverse lookup;
- no PaperProof server forwarding;
- no third-party SuiNS relay service as the primary path.

Preferred order:

1. reuse an existing Sui JSON-RPC or SDK client already configured in
   `paperproof-app`;
2. query the SuiNS primary-name mapping for the address;
3. validate the returned name shape;
4. cache the result.

If the current PaperProof SDK already exposes a suitable helper, reuse it
instead of implementing raw RPC calls in the app.

If no stable SuiNS helper already exists in the current frontend stack, the
implementation should stop at raw-address display rather than introduce a risky
custom resolver path under deadline pressure.

### Official API Direction

Use the official Sui name-service reverse lookup path for:

```text
address -> primary SuiNS name
```

Implementation preference:

1. adopt the official Sui client reverse lookup capability already available to
   the frontend stack;
2. keep the integration isolated inside a small resolver service;
3. over time, prefer the official gRPC/Core API direction over deprecated
   JSON-RPC-only paths if both are available.

Short-term practical rule:

- if the current `paperproof-app` client stack can perform reverse lookup
  cleanly with the existing `@mysten/sui` integration, use that path first;
- do not add React-only hooks or dApp-kit-specific rendering dependencies just
  for SuiNS display.

## Caching Strategy

Use a two-level cache:

1. in-memory cache for the current tab/session;
2. optional short-lived `localStorage` cache for repeated app visits.

Suggested cache shape:

```json
{
  "address": "0x...",
  "name": "alice.sui",
  "resolvedAt": 1782300000000,
  "status": "hit"
}
```

For negative lookups:

```json
{
  "address": "0x...",
  "name": null,
  "resolvedAt": 1782300000000,
  "status": "miss"
}
```

Suggested TTLs:

- positive lookup: 24 hours;
- negative lookup: 1 hour;
- failed lookup: do not persist long-term, or keep for only a few minutes.

If implementation simplicity is more important than persistence, phase 1 may
use memory cache only and skip `localStorage` entirely. That is preferable to a
fragile persistent cache implementation.

This avoids spamming RPC requests on list-heavy screens such as comments,
explore, and governance pages.

## Failure Handling

SuiNS lookup must never block core UI rendering.

If resolution fails:

- render the compact raw address immediately;
- optionally retry in the background once;
- do not surface a user-facing error toast for ordinary failures.
- never leave the field blank;
- never replace an address with placeholder text such as `Loading...`,
  `Unknown`, or `Resolution failed`;
- never break copy, tooltip, explorer-link, or signing-related UI behavior.

Timeout target:

- prefer a short timeout, such as 1-2 seconds for initial background lookup;
- after timeout, keep the address display and stop waiting.

## Data Model Impact

No protocol storage changes are required.

No indexer schema changes are required for the first version.

This feature is a frontend display enhancement only. The current design
intentionally excludes any server-side batching or caching interface.

## Coupling Assessment

Low coupling in the first version.

Touches:

- `paperproof-app` rendering helpers and a new SuiNS resolver service.

Does not touch:

- Move contracts;
- artifact publication flows;
- add-version flows;
- comments protocol logic;
- likes, governance, or fee logic;
- Walrus upload/download logic;
- Docs, Blog, or Forum artifact formats.

Must not touch in phase 1:

- `paperproof-indexer-reference`;
- production deployment topology;
- API response schemas;
- server-side cache storage;
- reverse proxy configuration.

## Implementation Notes

### Likely Integration Points

The app already has helpers for compact address display and copyable values.
The SuiNS feature should wrap those helpers instead of creating a parallel
identity-rendering style.

Suggested pattern:

- keep one low-level helper that normalizes and truncates raw addresses;
- add one async identity resolver/cache service;
- add one small render adapter that decides:
  - resolved name for visible label;
  - raw address for copy and tooltip text.

The adapter should be additive and should reuse existing address display helpers
wherever possible. Do not refactor all identity rendering paths at once.

### Batch-Friendly Rendering

For list-heavy pages:

- render raw compact addresses first;
- enqueue background lookups;
- replace visible labels only after resolution returns.

This avoids delaying first paint and keeps the page stable under slow RPC
conditions.

If a list is especially dense, phase 1 may cap concurrent lookups to avoid UI
thrash and excess RPC fan-out.

### Non-Address Strings

Some PaperProof identity fields are intentionally human-readable strings rather
than Sui addresses. The resolver must first detect valid `0x...` Sui address
shape and skip all other values.

Examples that should bypass SuiNS lookup:

- `PaperProof Labs`
- paper titles or other metadata accidentally placed in author-like arrays
- governance labels that are not addresses

## Testing Guidance

Phase 1 tests should cover:

- valid address with resolved SuiNS name shows the domain label;
- valid address with no SuiNS name falls back to compact raw address;
- invalid input bypasses resolution and displays unchanged;
- lookup timeout falls back cleanly;
- RPC/network exception falls back to the original address;
- malformed SuiNS response falls back to the original address;
- unresolved items never block page render or route navigation;
- copy action still copies the canonical Sui address even when SuiNS is shown;
- explorer links still target the canonical address;
- negative cache prevents repeated no-result lookups during one session;
- list rendering does not block on slow resolution.

## Non-Goals

- No protocol-level storage of SuiNS names.
- No replacement of canonical addresses in signed or verified data.
- No mandatory server-side resolver in phase 1.
- No attempt to infer identity from ENS, SNS on other chains, or social handles.
