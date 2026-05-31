# Comments and Likes

Docs Path: `protocol/comments-and-likes`

Artifact Code: PaperProof-generic_file-001144-3bfda36c9df3
Series ID: 0x3bfda36c9df3be93b8ea8e1779504d390bb5a7105532a8208fff8dc6ef4ed935
Comments Tree: locked

Every PaperProof artifact series receives official interaction objects: a
comments tree and a likes book.

## Official comments tree

The official comments tree is bound to the artifact series. Applications should
not accept an arbitrary comments object merely because it has the expected Move
type.

Comments may be:

- short inline on-chain comments;
- blob-backed comments with Walrus references and a bounded preview.

The comments tree supports moderation state:

| Tree status | Meaning |
|---|---|
| `open` | New comments are accepted |
| `locked` | New comments are disabled |
| `archived` | The thread remains readable but is closed |

Docs articles can use locked or archived trees. Blog posts and forum topics can
use open trees.

The tree has a structural root comment whose status is immutable. Replies can
only be added beneath active comments. Hidden or deleted comments remain
readable through getters but cannot continue receiving replies.

Tree owners can manage thread status and moderate individual comments. Authors
can delete their own non-deleted comments. Deletion is final.

| Value | Tree state |
|---|---|
| `0` | Open |
| `1` | Locked |
| `2` | Archived |

## Likes

The likes book is also bound to the artifact series. A like is a participation
signal with a PPRF holding check. It is not a claim that the artifact is true,
safe, lawful, or high quality.

Likes live in a separate `LikesBook`, so like activity does not unnecessarily
contend with comment writes.

## Canonical binding

First publication creates the official tree and likes book through the
root-embedded factory capability. Applications should verify
`ArtifactSeries.comments_tree_id` and `ArtifactSeries.likes_book_id`. A
standalone object with the expected Move type is not automatically official.
