# Artifact Identity and Official Bindings in PaperProof

Author: PaperProof Labs  
Category: Protocol Discussion  

This starter topic is for discussion about PaperProof's core protocol model:
durable artifact identity, versioned content, official comments trees, official
likes books, and canonical deployment bindings.

PaperProof artifacts are not intended to be simple file uploads. A published
artifact creates a stable series object. Versions can then be added over time
without erasing the history of the work. The series binds the current version,
official interaction objects, ownership, status, and protocol events.

The distinction between "an object with a familiar type" and "an official
PaperProof object" matters. Applications should validate package IDs, root
bindings, series relationships, comments tree IDs, likes book IDs, and
deployment manifests before presenting a record as official.

Useful questions for this board include:

- How should applications explain artifact series and versions to ordinary
  users?
- Which metadata should be visible by default, and which should remain in
  advanced views?
- How should interfaces distinguish official comments from third-party
  discussion surfaces?
- What should indexers reject as look-alike or non-canonical state?
- Which artifact families should receive specialized UI treatment first?

PaperProof Labs will use this board to collect protocol-level feedback before
turning mature ideas into Docs updates, SDK improvements, or governance-related
proposals.
