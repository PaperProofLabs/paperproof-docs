# Frequently Asked Questions

Docs Path: `safety-and-operations/faq`

Artifact Code: PaperProof-generic_file-001144-1402056d2615
Series ID: 0x1402056d261548faaff887a1bba4cc51fe45c30a5b2bc64e47c2c904a82a08fe
Comments Tree: locked

## Is PaperProof a storage network?

No. Walrus provides storage. PaperProof adds artifact identity, typed versions,
official interactions, governance-aware state, events, SDKs, and agent-readable
context.

## Is the official website the protocol?

No. It is a reference interface. Independent applications can use the same
public protocol objects.

## Are Docs, Blog, and Forum protocol types?

No. They are website-level navigation experiences that map to artifacts. Blog
posts and forum topics fit the `blog_post` artifact type. Docs articles can
also be published as readable artifacts with locked or archived comments trees.

## Can an artifact be updated?

Yes. A series keeps its stable identity while new append-only versions are
added.

## Can a Docs article receive comments?

The protocol creates an official comments tree for each artifact, but the owner
can lock or archive it. Official Docs should hide comment controls.

## Does Copilot control my wallet?

No. Copilot explains and guides. The wallet remains the authorization boundary.

## Is Copilot memory public?

The PaperProof registry exposes capability metadata. The private memory body is
handled by MemWal and Walrus, not stored directly in PaperProof Move objects.

## Does deleting memory erase Walrus blobs?

No. Delete tombstones the official registry entry and releases the active-entry
mapping. It does not delete external MemWal or Walrus content.

## What happens if an API fails?

The interface should show a degraded or failed state rather than pretending the
result is empty.

## Why does a static website show changing data?

A static deployment serves fixed HTML, CSS, and JavaScript assets. The loaded
browser code can still query Sui RPC endpoints, indexers, Walrus gateways,
model APIs, and browser-compatible relayers. Static means there is no required
application server for the website bundle; it does not mean the interface is
inert.

## Can a static site call any external API?

No. Browser JavaScript is subject to CORS and network policy. The remote service
must allow the deployed site origin. JavaScript cannot remove the browser's
CORS checks. A local Vite proxy can assist demonstrations, but GitHub Pages or
another static host is not a general backend proxy.

## What is the stable identity of an artifact?

The `ArtifactSeries` object ID is canonical. The human-readable artifact code
is designed for references and display. Clients should resolve codes through
canonical publication events and verify series bindings.

## Why are versions append-only?

Append-only records prevent silent replacement. Readers can follow the latest
version while still citing or inspecting an exact historical version.

## Why does a preprint need reservation?

A preprint code may need to appear inside the final PDF. The publisher reserves
the code, stamps the document, uploads it, and finalizes the reserved series.
Other artifact types can use direct first publication.

## Are likes endorsements?

No. Likes are lightweight PPRF-holder participation signals. They do not prove
truth, quality, safety, legality, or PaperProof Labs endorsement.

## Are official prompts really PaperProof artifacts?

Yes. Official Copilot prompt packages are stored through Walrus and published
as PaperProof `generic_file` artifact versions with content type
`application/vnd.paperproof.prompt+json`. The prompt registry resolves a route
to latest or pinned version policy.

## Can official prompts be updated without redeploying the website?

Yes. Publish a new version on the existing prompt series and keep the route on
latest-version policy. The app resolves the current version at runtime. A
pinned version can be used for controlled rollout or rollback.

## What do the Agent Memory buttons mean?

| Button | Meaning |
|---|---|
| `Enable` / `Disable` | Locally allow or pause recall |
| `Create` / `Delete` | Register or tombstone the official chain entry |
| `Update` | Save selected durable memory through MemWal |
| `Access` / `Revoke` | Authorize or remove this browser's MemWal access |

## Can a wallet have several active official Copilot memories?

Not for the same app. The registry enforces at most one active entry per wallet
and app ID. After deletion, the wallet can create a replacement.

## Does Agent Memory store private text on Sui?

No. PaperProof stores public discovery and policy metadata. The memory body
stays in MemWal and Walrus. This reduces public exposure but is not a complete
confidentiality guarantee.

## Why can Agent Memory saving fail while Copilot still works?

Static production memory save and recall require a browser CORS-compatible
MemWal relayer. If the relayer is unreachable or rejects the site origin,
ordinary Copilot, protocol reads, native prompts, and chain registration can
continue while recall and saving degrade.

## Is every major protocol change a token vote?

No. Major governed configuration uses proposal and voting flows. Routine prompt
route and Agent Memory registry maintenance use governance-vault-bound active
operator checks. This keeps small operations lightweight without allowing
arbitrary addresses to mutate official registry state.

## Has PaperProof been formally verified?

PaperProof completed a Sui Prover baseline for core project-side logic in
publishing, comments, governance, and governance voting. Formal verification is
bounded by the specified and modeled properties. It is not a claim that every
external integration or possible bug has been eliminated.
