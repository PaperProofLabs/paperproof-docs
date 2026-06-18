# Sui Overflow Historical Winner Dataset, 2024-2025

This dataset structures historical Sui Overflow winner information from the PaperProof benchmark document into machine-readable files for hackathon analysis, ecosystem research, and PaperProof positioning work.

## Contents

- `winners.csv`: flat table of winner records.
- `winners.json`: full structured winner records, including profile notes and PaperProof relevance.
- `track_summary.csv`: per-year and per-track summary table.
- `track_summary.json`: structured track summaries.
- `dataset_overview.json`: dataset-level metadata.
- `schema.json`: JSON schema for winner records.
- `sources.json`: public and local source references.

## Coverage

- Years: 2024, 2025.
- Records: 68 primary winner records.
- Tracks: 17 year-track groups.

## Source Basis

The dataset is derived from `paperproof-docs/overflow2026/Sui Overflow Winner Benchmarks and PaperProof Positioning.md`, which cites official Sui Foundation winner announcements and local Sui Overflow 2026 track notes. The source document is a curated analytical benchmark, so this dataset should be treated as a structured research dataset rather than an official Sui Foundation export.

## Notes

- The `record_source` field indicates whether a record came from a summary table or from detailed profile order.
- `paperproof_relevance` captures comparative lessons from the source document and is analytical rather than an official winner attribute.
- `sui_ecosystem_primitives` is a lightweight keyword-derived classification to help compare projects by Sui, Walrus, AI, wallet, ZK, and related ecosystem signals.

## License

Prepared by PaperProof Labs for research and ecosystem analysis. Use with attribution to PaperProof Labs and the cited public Sui Foundation sources.
