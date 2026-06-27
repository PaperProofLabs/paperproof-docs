# PaperProof Skill

Docs Path: `developers/static-frontend-integration`

Artifact Code: PaperProof-generic_file-001144-c3190886ae51
Series ID: 0xc3190886ae5103e7a8b0faf8290b329ac726ec23e0c6a5822cbe7cd5109810fa
Comments Tree: locked

`paperproof-community-skill` is the community-facing operational skill package
for working with PaperProof Protocol outside the official website.

It is designed for AI agents, developer assistants, technical operators,
researchers, and advanced users who want a reusable way to publish, update,
query, verify, and manage PaperProof artifacts directly through protocol-native
workflows.

## What it is

The PaperProof Skill is not a consumer frontend and not a private internal
operations bundle. It sits between the protocol layer and higher-level
applications such as bots, local scripts, CI pipelines, release flows, research
workbenches, and agent runtimes.

Its purpose is simple: give community participants a transparent and reusable
way to interact with PaperProof as infrastructure.

## Positioning

PaperProof Protocol defines the canonical artifact model, artifact series,
version lineage, Walrus-backed content commitments, comments trees, likes
books, governance hooks, and package-aware protocol state.

The SDKs are the main language-native integration tracks:

- TypeScript for browser and Node.js applications;
- Python for scripts, notebooks, analytics, and operational tasks;
- Rust for indexers and durable backend services.

The PaperProof Skill complements those SDKs. Instead of being a library that
another application imports, it is a reusable operational layer that packages
common protocol tasks into agent-friendly and operator-friendly workflows.

## Relationship to PaperProof Protocol

The skill is protocol-native. It uses the PaperProof SDK, signs real Sui
transactions, reads real protocol objects, uploads content to Walrus, and
returns structured execution results about what happened at each stage.

It does not depend on browser clicking, website-only hidden logic, or a private
backend path in order to publish or update artifacts. That makes it valuable
for an open ecosystem where many interfaces and agents may exist beyond the
official app.

The protocol remains the source of truth. The skill is a reusable access and
execution layer for that truth.

## Main capabilities

Common workflows include:

- publishing new artifacts;
- adding new versions to existing artifact series;
- packaging local files or worktrees into publishable releases;
- running signer, balance, RPC, relay, and series preflight checks;
- querying series and versions;
- verifying protocol state and publish outcomes;
- participating in governance proposal and voting workflows;
- supporting agent-driven or script-driven operational tasks.

The design goal is community reuse. A third party should be able to run these
flows without depending on the official website as the primary execution
surface.

## How to use it

In practice, the usage pattern is straightforward:

1. prepare local content, a worktree, or a target artifact series;
2. choose the appropriate skill command for publish, add-version, query, or
   governance work;
3. run preflight checks so signer access, balances, RPC connectivity, Walrus
   reachability, and target series readability are confirmed before mainnet
   execution;
4. execute the requested protocol action;
5. inspect the structured output for upload status, transaction status, and
   latest-version confirmation.

This makes the skill suitable for both direct terminal use and integration into
agent workflows, scripts, and repeatable operational pipelines.

## When to use the skill

Use the SDKs when you are building your own application, service, or custom
integration layer.

Use the PaperProof Skill when you want a ready-to-run community workflow for
common PaperProof operations without starting from a blank codebase.

The two approaches are complementary. The SDKs are the programmable building
blocks. The skill is the reusable operational package that applies those
building blocks to common real-world tasks.
