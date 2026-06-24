---
name: extend-walrus-retention
description: Inspect Walrus storage windows for PaperProof-backed artifact versions and extend short-lived latest versions to a target epoch window, including batch PTB-based extension and sequential fallback. Use when Codex must check which blob objects or artifact latest versions have retention below a target such as 10 epochs, read current Walrus start/end epochs, or execute reusable retention-extension operations with signer-controlled mainnet accounts.
---

# Extend Walrus Retention

Use this skill when the task is about Walrus retention windows and extension
operations, not about a specific website page or one fixed artifact list.

This skill answers three questions:

1. which latest versions or blob objects still have too-short Walrus retention;
2. what their current `start_epoch -> end_epoch` window is;
3. how to extend them efficiently, preferably in batch.

## Core Script

Use the bundled script in `paperproof-skill`:

```powershell
cd <PaperProofLabs workspace>\paperproof-skill
node .\scripts\extend-walrus-retention.mjs --help
```

The script supports:

- `--explore-types=...` to scan current active artifacts from the indexer API;
- `--series-json=...` to scan an explicit JSON list of series;
- dry-run inspection;
- real extension with `--run`;
- `--mode=batch` for PTB-style grouped extension by signer;
- automatic sequential fallback if a batch transaction fails.

## Inputs

### Explore-driven scan

Use this when the task says "check current active artifacts in category X/Y/Z":

```powershell
node .\scripts\extend-walrus-retention.mjs --explore-types=1,2,3,4,5
```

Artifact type numbers:

- `1` preprints
- `2` blog posts
- `3` technical reports
- `4` datasets
- `5` software releases
- `6` generic files

### Explicit series list

Use this when the task already knows exactly which artifacts or series to inspect.
Provide a JSON array like:

```json
[
  {
    "artifactCode": "PaperProof-preprint-001162-064b3cf9a09c",
    "seriesId": "0x064b3cf9a09c61e5a1fdef46ac6fa59f631d871b9769e5f0a0d4736387b29eec",
    "title": "Yellow Paper"
  }
]
```

Then run:

```powershell
node .\scripts\extend-walrus-retention.mjs --series-json=.\artifacts\series.json
```

## How To Read Current Retention

Dry run prints, for each inspected latest version:

- artifact code
- latest version number
- `window=start_epoch->end_epoch`
- total epoch span
- whether extension is needed
- how many epochs must be added to reach the target

Example:

```text
- PaperProof-preprint-001162-064b3cf9a09c | v4 | window=33->34 (1 epochs) | action=plan | add=9 | targetEnd=43
```

This means the latest version currently spans only one epoch and needs nine
more to reach a total window of ten.

## How To Extend

### Dry run first

Always inspect before mutating:

```powershell
node .\scripts\extend-walrus-retention.mjs --explore-types=1,2,3,4,5
```

### Real extension

Use signer env rather than passing keys directly:

```powershell
node .\scripts\extend-walrus-retention.mjs --run --signer-env=..\paperproof-contracts\jstest\.env --explore-types=1,2,3,4,5
```

Default target window is `10 epochs`. Override only if the task explicitly
needs another target:

```powershell
node .\scripts\extend-walrus-retention.mjs --run --signer-env=..\paperproof-contracts\jstest\.env --explore-types=1,5 --targetEpochs=12
```

## Batch PTB Mode

Default execution mode is batch:

```powershell
node .\scripts\extend-walrus-retention.mjs --run --signer-env=..\paperproof-contracts\jstest\.env --explore-types=1,2,3 --mode=batch --batch-size=8
```

Behavior:

- group candidate blobs by signer account;
- build PTB batches with multiple Walrus `extend_blob` actions;
- submit grouped transactions;
- if a batch fails, fall back to sequential extension for the affected signer group.

Use `--mode=sequential` only when debugging or when the task explicitly wants
one-by-one extension.

## Validation

After real extension, re-run the same command without `--run` and confirm:

- `planned=0`
- every inspected item shows `action=skip`
- every target item now has a window like `33->43 (10 epochs)` or another
  target-sized span

## Signer Rule

The script chooses the signer by matching the artifact author/owner against the
addresses in the signer env. If nothing matches, it falls back to the first
configured account. For production work, keep the signer env accurate and
verify ownership assumptions before running against third-party artifacts.
