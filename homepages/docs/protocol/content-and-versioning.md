# Content and Versioning

Docs Path: `protocol/content-and-versioning`

Artifact Code: PaperProof-generic_file-001144-6743a9eb357e
Series ID: 0x6743a9eb357e4957c125d298e37458efc17294eb5bf4ab762ae341d008caf766
Comments Tree: locked

PaperProof separates compact authoritative state from large content bytes.

## Version records

Each published version records a shared header with:

- artifact series ID;
- artifact type;
- version number;
- previous version ID when applicable;
- author address;
- content hash;
- Walrus blob ID;
- Walrus blob object ID;
- content type;
- status and timestamp.

Type-specific records add metadata appropriate to the artifact family.

The version header is the chain-side statement of what bytes a client expects
to retrieve. Large packages stay flexible without becoming unverifiable.

## Append-only lineage

Adding a version does not mutate earlier version records. Applications can show
a convenient current view while preserving historical auditability.

This supports stable-series citation, exact-version reproducibility, release
comparison, recovery from a bad update, and freshness-aware agent retrieval.
Ordinary updates should append a version rather than create an unrelated
series.

## Walrus content lifecycle

Common content workflows include:

- publish;
- read;
- verify;
- extend storage;
- transfer an owned blob when allowed.

Walrus reserve and certify steps may belong to separate stages. Applications
should explain meaningful actions to users and compose compatible Sui calls
with PTBs where possible.

Walrus reserve-space, upload, and certify steps do not always collapse into one
transaction. Applications should present the stages clearly, preserve
intermediate references, and avoid repeating successful work after a
recoverable network error.

## Verification boundary

Move contracts record references and commitments. They do not download and
validate blob bytes inside the transaction. SDKs and applications should verify
retrieved content when stronger guarantees are needed.

## Verification checklist

1. Resolve the intended `ArtifactSeries`.
2. Select the current or explicitly requested version.
3. Read the typed version record from the expected package.
4. Retrieve the referenced Walrus bytes.
5. Compare their hash with `content_hash`.
6. Parse the content type only after verification.
7. Surface retrieval or verification failure explicitly.

PaperProof Copilot prompts demonstrate the same model. Prompt JSON packages are
published as `generic_file` versions and resolved through a governed registry.
