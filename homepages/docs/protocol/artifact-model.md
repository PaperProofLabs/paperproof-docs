# Artifact Model

Docs Path: `protocol/artifact-model`

Artifact Code: PaperProof-generic_file-001144-ff3a36416d5e
Series ID: 0xff3a36416d5e7a1c612ea5500ca498ba9e9cbe11f29116ae533727101cb237e1
Comments Tree: locked

A PaperProof artifact is a continuing protocol object, not merely a file.

## Artifact series

An artifact series is the stable identity of a continuing work. It records:

- artifact type;
- human-readable artifact code;
- owner;
- current version;
- official comments tree;
- official likes book;
- status and timestamps.

The series remains stable as new versions are added.

The series object ID is the canonical identity. The human-readable code is a
public reference for interfaces, documents, and citations:

```text
PaperProof-{type}-{epoch6}-{series_id_hex_12}
```

Applications should rebuild `artifact_code -> series_id` mappings from
canonical `ArtifactPublishedEvent` records. Codes are not global sequential
counters.

## Built-in artifact types

PaperProof currently recognizes:

| Type | Typical use |
|---|---|
| `preprint` | Manuscripts and research drafts |
| `blog_post` | Long-form posts, announcements, and forum topics |
| `technical_report` | Specifications, audits, and engineering reports |
| `dataset` | Research data, schemas, and reproducibility archives |
| `software_release` | Source archives, package hashes, and changelogs |
| `generic_file` | Files that do not require a specialized schema |

Protocol types are intentionally scarce. New types require contract, SDK,
documentation, and governance support.

Adding a built-in type is not a cosmetic frontend change. It requires a type
constant, typed record, publication entrypoints, getters, tests, SDK support,
deployment work, documentation, and governance activation.

## Typed versions

Each artifact type has typed version records. A dataset version carries
different fields from a software release or preprint version. This helps apps,
indexers, and agents understand what a record means without guessing from an
opaque blob.

Every typed record includes a shared header:

| Field | Purpose |
|---|---|
| `series_id` | Stable work identity |
| `artifact_type` | Built-in artifact family |
| `version` | Series-local revision number |
| `previous_version_id` | Append-only lineage pointer |
| `author` | Address that published the revision |
| `content_hash` | Retrieved-byte verification commitment |
| `walrus_blob_id` | Walrus content reference |
| `walrus_blob_object_id` | Associated Walrus blob object |
| `content_type` | Rendering and processing hint |
| `metadata_extensions` | Small bounded extension attributes |
| `status`, `created_at_ms` | Lifecycle and chronology |

## Lifecycle and metadata

First publication creates the series, first typed version, official comments
tree, and likes book. Later updates add immutable version records. A series can
receive at most `168` versions. Active series accept updates; locked or hidden
series remain readable but reject new versions.

Preprints use a special reserve-and-finalize workflow because the public code
may need to appear inside the final PDF. Other built-in types use direct first
publication.

Series owners may replace bounded series-level metadata while a series is
active. Version metadata is immutable after publication. Indexers should treat
series metadata as current descriptive state and version metadata as a
historical snapshot.

## Official interaction creation

First publication also creates one official comments tree and one official
likes book. The publishing root owns the internal tree-factory capability.
Users do not supply an arbitrary public factory object. Publishing validates
the official governance vault and fee manager recorded on the root before it
collects fees or creates interaction objects.

The resulting series records:

```text
comments_tree_id
likes_book_id
```

This is the authority path for artifact discussion. A third party can create
other objects or interfaces, but an official PaperProof client should present
the tree and book bound by the series.

## Pause and status boundaries

Protocol pause is scoped to publication entrypoints that create a new series or
append a new version. Comments and likes do not read the publishing root on
every action. A specific discussion can be closed through its tree status
without turning every social action into a write against one global object.

This boundary supports both operational control and usable shared-object
concurrency.
