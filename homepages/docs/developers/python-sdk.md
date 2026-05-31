# Python SDK

Docs Path: `developers/python-sdk`

Artifact Code: PaperProof-generic_file-001144-6f950074c78b
Series ID: 0x6f950074c78b7019dad1d36d9a30a5a14a10841a60322a0a6dcc549952e21153
Comments Tree: locked

The Python SDK is intended for scripting, analytics, exports, notebooks, and
operational workflows.

## Published package

Install the published PyPI package:

```bash
pip install paperproof-sdk-py==0.2.3
```

| Field | Value |
|---|---|
| Registry | PyPI |
| Package | `paperproof-sdk-py` |
| Current published version | `0.2.3` |
| PyPI page | [pypi.org/project/paperproof-sdk-py](https://pypi.org/project/paperproof-sdk-py/) |
| Source repository | [PaperProofLabs/paperproof-sdk-py](https://github.com/PaperProofLabs/paperproof-sdk-py) |
| License | `Apache-2.0` |
| Python requirement | `>=3.10` |

Optional adapters are available through extras:

```bash
pip install "paperproof-sdk-py[sui,walrus]==0.2.3"
```

## Typical uses

- query recent artifacts;
- export typed records to CSV or JSONL;
- inspect artifact version histories;
- retrieve governance events;
- prepare research datasets;
- validate deployment configuration;
- build repeatable operational scripts.

## Design goals

The Python surface should feel natural in synchronous scripts and notebooks. It
should expose clear exceptions, typed records, batch helpers, and
DataFrame-friendly output where practical.

Use Python when the main task is analysis or automation rather than browser
wallet interaction.

The SDK includes deployment constants for the current mainnet core, typed
builders and views, GraphQL-first event queries, gRPC object reads through
optional `pysui`, canonical event filtering, deployment verification, Walrus
HTTP and CLI adapters, notebook exports, and a read-only CLI.

## Recommended shape

A Python integration should expose typed records instead of returning
unstructured dictionaries everywhere. Scripts should be able to:

1. Select a deployment manifest.
2. Query canonical events with cursors.
3. Resolve series and typed version objects.
4. Retrieve and verify Walrus content when required.
5. Export records to JSONL, CSV, or DataFrame-friendly structures.
6. Preserve rejected or incomplete reads for later inspection.

Python is particularly useful for reproducible research workflows. A notebook
can fetch a dataset series, pin an exact version, verify its content hash, run
analysis, and export a report that cites the stable artifact code and exact
version object.

## Operational scripts

Python also fits deployment checks and reporting:

- compare configured package IDs with official manifest history;
- produce daily artifact and comment summaries;
- monitor governance proposal state;
- export fee events;
- validate that official comments trees match their series bindings;
- audit prompt-route or Agent Memory registry configuration.

Scripts that send transactions still need an explicit signer and careful
secret handling. Analytics code should remain read-only by default.

## Canonicality is not optional

Do not derive metrics from every event whose type name looks familiar. Validate
package IDs and official object relationships. Preserve the difference between
zero results and a failed page read. This is especially important for
governance statistics, participation reports, and incentive calculations.
