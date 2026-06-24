# Sui Overflow Historical Winner Dataset, 2024-2025

This dataset structures historical Sui Overflow winner information for 2024 and 2025 into machine-readable files for hackathon analysis, ecosystem research, and historical comparison.

## Contents

- `winners.csv`: flat table of winner records.
- `winners.json`: structured winner records with short descriptive notes.
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

The dataset is derived from publicly announced Sui Overflow winner information together with locally normalized research notes used to structure the records into CSV and JSON files. It should be treated as a community research dataset rather than an official Sui Foundation export.

## Notes

- The `record_source` field indicates whether a record came from a summary table or from detailed profile order.
- The `profile_note` field is a short descriptive summary for the project and is not an official winner attribute.
- `sui_ecosystem_primitives` is a lightweight keyword-derived classification to help compare projects by themes such as Sui, Walrus, AI, wallet, and ZK.

## License

Prepared for research and ecosystem analysis. Use with attribution to the cited public Sui Foundation sources.
