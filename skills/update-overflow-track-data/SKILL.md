---
name: update-overflow-track-data
description: Update private Sui Overflow 2026 DeepSurge track intelligence snapshots for PaperProof, including the Special - Walrus, DeFi & Payments, Special - DeepBook, and The Agentic Web files. Use when Codex must check for new DeepSurge submissions, refresh project About text/links/package IDs/deployment networks, or sync PaperProof's latest About entry for the four track intelligence files stored in the private paperproof-app repository.
---

# Update Overflow Track Data

## Purpose

Use this skill to update the private DeepSurge project-intelligence snapshots
for Sui Overflow 2026.

Important: these files are intentionally stored in the private repository:

```text
<PaperProofLabs>\paperproof-app\private\overflow2026
```

Do not recreate or commit these four intelligence files under the public
`paperproof-docs/overflow2026` directory.

## Files

The managed files are:

```text
Sui Overflow 2026 Special Walrus Project Intelligence.md
Sui Overflow 2026 DeFi Payments Project Intelligence.md
Sui Overflow 2026 Special DeepBook Project Intelligence.md
Sui Overflow 2026 The Agentic Web Project Intelligence.md
```

The DeepSurge hackathon ID is:

```text
b587dc0c-4cb8-4e63-ada5-519df38103bf
```

The four exact track names are:

```text
Special - Walrus
DeFi & Payments
Special - DeepBook
The Agentic Web
```

## Workflow

1. Check the current repo state before changing files:

```powershell
git -C <PaperProofLabs>\paperproof-app status --short
git -C <PaperProofLabs>\paperproof-docs status --short
```

2. Run a lightweight check first:

```powershell
cd <PaperProofLabs>
node .\paperproof-docs\skills\update-overflow-track-data\scripts\update-overflow-track-data.mjs --check-only
```

This compares DeepSurge API project IDs with the current private files and
prints newly observed projects without rewriting files.

3. If the user wants the files updated, run:

```powershell
cd <PaperProofLabs>
node .\paperproof-docs\skills\update-overflow-track-data\scripts\update-overflow-track-data.mjs --write
```

This fetches current public DeepSurge list data, refreshes detail pages with
timeouts, and rewrites the four private files as neutral content aggregation
snapshots. The generated files intentionally do not include Top 5, Top 10,
scores, or project rankings.

To refresh only one track, pass the exact track name:

```powershell
node .\paperproof-docs\skills\update-overflow-track-data\scripts\update-overflow-track-data.mjs --write --track "Special - Walrus"
```

4. Validate after writing:

```powershell
rg -n "Raw project records captured from DeepSurge API: 580|PaperProof Protocol|2026-" .\paperproof-app\private\overflow2026
git -C .\paperproof-app diff --check
git -C .\paperproof-app status --short
```

There should not be a repeated incorrect `580` count across all tracks. That
specific symptom means the API was queried incorrectly.

5. Commit only if the user asks. Use the existing PaperProof identity:

```powershell
git -C <PaperProofLabs>\paperproof-app config user.name
git -C <PaperProofLabs>\paperproof-app config user.email
```

Expected identity:

```text
PaperProof Labs
paperproof.labs@gmail.com
```

## Critical API Detail

Use the query parameter `tracks`, not `track`.

Correct:

```text
/api/projects?hackathonId=...&tracks=Special%20-%20Walrus&statuses=submitted&listOnProjectPage=true
```

Wrong:

```text
/api/projects?hackathonId=...&track=Special%20-%20Walrus
```

The wrong parameter can return all projects across all tracks and pollute every
file with the same project set.

## No Rankings

The four intelligence files are content aggregation snapshots only. Do not add
Top 5, Top 10, score tables, heuristic rankings, or judging predictions to these
files. If the user asks for ranking analysis, provide it in the conversation or
in a separate explicitly requested private analysis file, not in the four track
aggregation files.

## Safety

- Keep the intelligence files private in `paperproof-app/private/overflow2026`.
- Do not commit these files to public `paperproof-docs`.
- Do not include secrets or private keys in the files.
- Do not scrape authenticated private user data. Use the public DeepSurge API
  fields only.
- Use `--force-with-lease` only when the user explicitly asks for history
  rewriting.
