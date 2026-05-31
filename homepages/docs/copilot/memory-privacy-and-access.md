# Memory Privacy and Access

Docs Path: `copilot/memory-privacy-and-access`

Artifact Code: PaperProof-generic_file-001144-37741376f536
Series ID: 0x37741376f5364c9c0b9f863cdee6bad96fbafbf4994401bdaabfdd247050e4c9
Comments Tree: locked

PaperProof separates public memory capability metadata from private memory
content.

## Public registry metadata

The PaperProof memory registry stores discovery and availability metadata such
as:

- wallet owner;
- app ID;
- memory ID;
- provider;
- namespace root;
- descriptor artifact and version policy;
- availability;
- owner-enabled state;
- deletion tombstone.

## Private memory body

The memory body remains in MemWal and Walrus rather than in PaperProof Move
objects. Typical private memory may include:

- preferred language;
- preferred answer style;
- recent focus topics;
- ongoing task summaries.

## Browser access

`Access` authorizes the current browser to use the wallet-linked memory. The
browser stores local access material. If you move to a new computer, connect
the same wallet and authorize memory access again.

## Important boundary

Keeping memory bodies outside public PaperProof objects reduces public
exposure, but it is not a complete confidentiality guarantee. Browser,
provider, relay, and storage policy still matter. Future privacy layers such as
Seal may strengthen encrypted or selective-access memory flows.

## Public metadata is intentional

The registry is a discovery and policy layer. It lets the official app answer:

- Does this wallet have an active memory capability for this app?
- Which provider and schema policy apply?
- Is the entry available for official use?
- Has the owner disabled or deleted it?
- Which versioned descriptor artifact explains the capability?

Those questions need inspectable metadata. They do not require publishing the
user's private memory text on chain.

## Local delegate access

`Access` creates or reuses the wallet-linked MemWal account, generates local
delegate access material, and registers the delegate with MemWal. Private
delegate material stays in the browser. On a new computer, connect the same
wallet and authorize again.

`Revoke` removes the current browser's access. It is distinct from `Delete`.
Revoking local access does not tombstone the chain entry. Deleting the chain
entry does not promise destruction of external stored bytes.

## Confidentiality checklist

Keeping bodies outside public Sui objects materially reduces public exposure,
but users should still consider:

- browser storage security;
- model-provider handling of prompts and responses;
- relayer request handling;
- MemWal and Walrus storage policy;
- device compromise;
- future encryption and selective-access design.

Seal-based privacy is a possible future enhancement. It is not an implemented
guarantee today.
