# Publish Storage Onchain UX Optimization Notes

This note records the code-level analysis behind the delay users may see after choosing a file or clicking **Storage Onchain** on the Publish page, before the wallet popup appears. It is intended to guide future user experience optimization without changing PaperProof's security model, protocol behavior, or button flow.

## Scope and Constraints

The optimization target is narrow:

- Do not change artifact publishing semantics.
- Do not change the wallet signing model.
- Do not add, remove, rename, or split existing buttons.
- Do not move trusted content preparation to a backend service.
- Improve perceived and actual responsiveness before the first wallet prompt.
- Use visual pending feedback only for local preparation gaps before a wallet prompt appears.

The desired outcome is that the user still performs the same operation, but waits less or receives clearer immediate feedback while local preparation is running.

This document is not a commitment to implement every idea below. Each item is marked or worded according to how certain its benefit is in the current code path.

Visual feedback must not compete with browser wallet UI. If a wallet popup is about to appear or has appeared, the page already has a clear user-facing state. Button animation should stop before wallet signing is requested.

Prefer small, reversible changes. Do not add scheduling, caching, background promises, or extra state unless the current code path shows a measurable delay or a clear user-facing idle gap.

## Confirmed Current Flow

For file-based artifact types, the file input change handler immediately prepares the file and then starts Storage onchain:

- `src/main.ts`: `prepareFile(input)` validates, hashes, and stores the prepared content draft.
- `src/main.ts`: after `prepareFile`, the handler calls `prepareStorageOnchain(form, draft)` inside `withBusy('Storage onchain', ...)`.
- `src/main.ts`: `prepareStorageOnchain` creates a Walrus storage draft if missing, then calls `registerAndUploadWalrusStorage`.
- `src/services/walrus.ts`: `registerAndUploadWalrusStorage` triggers the first wallet prompt through `draft.flow.executeRegister(...)`.

For Blog Post publishing, clicking **Storage Onchain** first prepares the Markdown package:

- `src/main.ts`: `prepareMarkdownIfNeeded(form)` builds a Markdown package zip and hashes it.
- `src/main.ts`: `prepareStorageOnchain(form, publishContentDraft)` then creates the Walrus draft and registers it.

Therefore, the delay before the wallet popup is not primarily caused by the wallet. It is caused by work that must currently complete before the register transaction can be handed to the wallet.

One important nuance: for file-based artifacts, choosing a file currently starts Storage onchain automatically. That means optimizations must focus on work that happens immediately after file selection. Background preparation after file selection is only useful if it can run before the automatic Storage onchain path needs the result, or if it is paired with earlier prewarming.

## Confirmed Delay Sources

### 1. Walrus client is initialized lazily

`createWalrusStorageDraft(bytes, contentType)` calls `getWalrusClient()`. The client initialization dynamically imports Sui gRPC and Walrus packages and creates the Walrus client. Because this happens inside Storage onchain preparation, it sits directly in front of the wallet popup.

This is the most likely high-impact optimization target because it moves dependency loading and client construction out of the critical path. The exact gain depends on browser cache state and network conditions.

Relevant file:

- `src/services/walrus.ts`

### 2. File content is read more than once

For non-PDF file artifacts, the current flow hashes the `File` and then separately reads `file.arrayBuffer()` to create the content bytes. This reads the same file twice.

For Technical Report, `validatePdfFile(file)` reads and parses the PDF, then `prepareFile` reads the same file again to produce the bytes used by the draft.

Relevant files:

- `src/main.ts`
- `src/services/pdf.ts`

### 3. Preprint stamping does extra PDF work

`stampPreprintPdf(file, stampText)` reads the source PDF, loads it, stamps each page, saves stamped bytes, creates a stamped `File`, then reloads the stamped bytes only to read the page count. After that, `prepareFile` reads the stamped file again to get bytes.

This makes Preprint preparation heavier than necessary while preserving the same final PDF output.

Relevant files:

- `src/main.ts`
- `src/services/pdf.ts`

### 4. Blog Markdown packages may be rebuilt too often

The Markdown editor input handler calls `prepareMarkdownIfNeeded(form)` while the user types. That means zip generation, compression, and hashing can happen repeatedly. Clicking **Storage Onchain** also calls `prepareMarkdownIfNeeded` to ensure the latest content is prepared.

This should be treated as a potential issue, not a proven major bottleneck. If typical official Blog posts are text-heavy with few images, a full cache/debounce system may not be worth the added complexity.

Relevant file:

- `src/main.ts`

### 5. Blog asset file reads are sequential

`buildMarkdownPackage(form)` currently reads attached image files one by one before generating the zip. Multiple images can therefore increase preparation latency linearly.

This is a lower-confidence optimization than client prewarming or duplicate-read removal. Browser file reads may already be limited by local I/O and memory behavior, so parallel reads should be measured with realistic image counts before treating it as a major improvement.

Relevant file:

- `src/main.ts`

### 6. Busy state may not paint before heavy local work

`withBusy` sets busy state and calls `render()`, then immediately awaits the heavy function. The browser may not get a frame to paint the updated status before local file processing, zip compression, PDF parsing, or Walrus initialization begins.

This does not change actual processing time, but it can make the interface feel frozen.

Relevant file:

- `src/main.ts`

### 7. Buttons have no local-preparation pending state

Some Publish actions perform meaningful local work before the browser wallet is invoked. During that interval, the page can look idle even though it is reading files, hashing, parsing PDFs, building a Markdown package, initializing Walrus, or encoding a Walrus write flow.

A subtle button pulse can help only during this pre-wallet local preparation gap. It should not continue while the wallet popup is open, while the user is signing, or while the app is waiting for the wallet transaction result.

Relevant file:

- `src/main.ts`

## Recommended Optimizations

The recommendations are grouped by confidence. Start with Tier 1. Tier 2 should be implemented only if timing data or user testing still shows a problem. Tier 3 should be considered optional and easy to skip.

## Tier 1: Low-Risk, High-Confidence Changes

### 1. Prewarm the Walrus client

Expose a lightweight `warmWalrusClient()` helper from `src/services/walrus.ts` that internally calls `getWalrusClient()`.

Safe trigger points include:

- After entering the Publish page and the browser is idle.
- After selecting an artifact type that requires Walrus storage.
- After opening a publish form, before content selection.

This should not connect a wallet, sign a transaction, read content, upload data, or register a blob. It only moves dynamic imports and client construction out of the critical path before the wallet popup.

Avoid blocking initial page rendering on this prewarm. If the prewarm fails because of transient network or package loading issues, it should be logged or ignored and the normal Storage onchain path should still attempt initialization later.

### 2. Read file bytes once and reuse them

Refactor file preparation so each selected file is read once into a `Uint8Array`, then reused for hashing, validation, and draft creation.

Recommended direction:

- For normal files, call `file.arrayBuffer()` once, hash the resulting bytes, and store the same bytes in `PreparedContentDraft`.
- For Technical Report, make `validatePdfFile` accept bytes or return bytes together with PDF metadata.
- For Preprint, make `stampPreprintPdf` return stamped bytes together with the stamped file and metadata.

This preserves the exact content hash semantics because the hash still covers the bytes that will be published.

### 3. Remove redundant Preprint PDF reload

After stamping, `stampPreprintPdf` can use the existing `PDFDocument` page count instead of reloading `stampedBytes` only to call `getPageCount()`.

This reduces CPU and memory pressure for multi-page PDFs without changing the stamped PDF output.

### 4. Add pre-wallet button pulse feedback

Add a scoped pending state for the exact Publish button or file action that is doing local preparation. The state should add a restrained brightness pulse, not a warning-style flashing animation.

Recommended behavior:

- Start pulsing when local preparation begins after a user action.
- Stop pulsing before invoking wallet signing or wallet transaction APIs.
- Stop pulsing if local preparation fails.
- Stop pulsing if local preparation succeeds but no wallet action follows.
- Do not pulse during wallet popup, wallet signing, transaction execution, or post-transaction waiting.

Good candidate preparation segments:

- `prepareFile(input)` for selected files.
- `prepareMarkdownIfNeeded(form)` for Blog Post packages, if package preparation is visibly slow.
- `createWalrusStorageDraft(bytes, contentType)` for Walrus flow creation and blob encoding.

Segments that should not be covered by button pulse:

- `draft.flow.executeRegister(...)` because it invokes wallet signing for Walrus registration.
- `signAndExecute(...)` because it invokes wallet signing for Sui transactions.
- `draft.flow.executeCertify(...)` when used through a wallet signer.
- Any period where a wallet popup is visible or expected to be visible.

This feedback should be implemented as a specific action pending state rather than relying only on global `state.busy`. Global busy can span wallet signing and transaction execution, while the button pulse should represent only the browser-side preparation gap before wallet interaction.

Suggested state shape:

```ts
let pendingPublishPreparation: string | null = null;
```

Use stable action keys such as `choose-file:publish`, `storage-onchain:publish`, `storage-onchain:add-version`, or `markdown-package:publish`. Render the pending class only on the button or file-control label associated with that action.

Suggested CSS behavior:

```css
.publish-step-button.is-preparing,
.file-picker-button.is-preparing {
  animation: publishPreparationPulse 1.2s ease-in-out infinite;
  cursor: progress;
}

@keyframes publishPreparationPulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(0.78); }
}

@media (prefers-reduced-motion: reduce) {
  .publish-step-button.is-preparing,
  .file-picker-button.is-preparing {
    animation: none;
  }
}
```

Avoid disabling the wallet-triggering action merely because the pulse is active unless the same operation is already running. The goal is to prevent duplicate local work, not to interfere with wallet opening.

Implementation detail for the current Walrus path: `registerAndUploadWalrusStorage` currently enters the wallet-triggering call internally through `draft.flow.executeRegister(...)`. The first implementation should prefer the simple boundary: pulse during `createWalrusStorageDraft`, then stop before `registerAndUploadWalrusStorage` begins. Avoid adding callback hooks unless a later measurement proves they are needed.

### 5. Let busy state paint before heavy work

After `render()` in `withBusy`, yield one browser frame before starting expensive local work. For example, use a small `nextFrame()` helper based on `requestAnimationFrame`.

This makes the UI immediately show that work has started, even if the following operation remains CPU-heavy.

This mainly improves perceived responsiveness. It does not reduce the total wall-clock time of hashing, zip generation, PDF processing, or Walrus flow creation. Keep this change tiny and verify it does not alter wallet popup timing or transaction behavior.

## Tier 2: Implement Only If Measurements Justify It

### 6. Cache and debounce Markdown package preparation

Introduce a stable package key for Blog Post drafts. The key can include:

- Markdown body.
- Title.
- Author.
- Topic.
- Editor mode.
- Asset path, name, size, type, and last modified timestamp.

If the key has not changed, `prepareMarkdownIfNeeded` should return the current draft immediately.

If a package build is already in flight for the same key, the Storage onchain path should await that promise instead of starting another build.

The input handler should debounce package preparation so typing does not trigger repeated zip and hash work.

Keep this minimal. Prefer a simple cache key and in-flight promise reuse over a broad state machine. Do not delay final packaging on the actual **Storage Onchain** click; that path must always package the latest content if the content changed.

### 7. Read Blog assets in parallel

Inside `buildMarkdownPackage`, read all image asset files with `Promise.all(...)`, then add the resulting buffers to the zip.

This keeps the package content identical while reducing latency when a post contains several images.

Treat this as an optional measured optimization. It may help multi-image posts, but it may also increase short-term memory pressure because several asset buffers are held at once.

### 8. Prepare Walrus draft earlier, but do not register earlier

After content bytes are ready, the app can start `createWalrusStorageDraft(bytes, contentType)` in the background and store the promise on the content draft. When Storage onchain runs, it can await the existing promise.

Do not call `executeRegister` earlier. Registration is a wallet-signed transaction and must remain tied to the user's explicit Storage onchain action.

Because file-based artifacts currently start Storage onchain immediately after `prepareFile`, this optimization is most useful for Blog Post, add-version flows, or any future flow where the user may spend time reviewing metadata after content bytes are ready. For the current automatic file path, Walrus client prewarming is the cleaner first step.

This is not recommended as an early implementation. It adds async state that can become stale when users switch artifact types, change files, edit Blog content, or leave the page. Implement it only after simpler prewarming and duplicate-read fixes are in place and measured delays remain.

## Non-Goals

These changes should not:

- Upload user content to a PaperProof backend for preparation.
- Move hashing, PDF stamping, or package construction to a trusted server.
- Automatically sign or pre-sign wallet transactions.
- Change Walrus registration, upload, certification, or PaperProof publish semantics.
- Split the current low-button publish workflow into more visible steps.
- Continue button pulse while a browser wallet popup is open or expected.

## Suggested Implementation Order

1. Add Walrus client prewarming.
2. Add a frame yield in `withBusy` so status updates paint before heavy work.
3. Remove duplicate file reads for normal files and Technical Reports.
4. Refactor Preprint stamping to return bytes and avoid the redundant PDF reload.
5. Add pre-wallet button pulse feedback for local preparation gaps.
6. Measure Blog package preparation. Add cache, debounce, or in-flight promise reuse only if the measurements show repeated package building is a real issue.
7. Measure multi-image Blog package preparation. Parallelize asset reads only if it shows a clear benefit.
8. Defer background Walrus draft creation unless the simpler changes still leave a clear pre-wallet delay.

This order gives the largest user-visible improvement first while keeping each change small and easy to verify.

## Measurement Notes

Before and after each implementation step, capture simple timings around these boundaries:

- File selection started.
- `prepareFile` completed.
- `prepareMarkdownIfNeeded` completed.
- `createWalrusStorageDraft` started and completed.
- Button pulse started and stopped.
- `executeRegister` called.
- Wallet popup observed by the user.

Use `performance.now()` and development-only console timing, or remove the instrumentation before release. These measurements help distinguish true latency reductions from perceived responsiveness improvements.

## Verification Checklist

For each optimization, verify the following flows:

- Preprint PDF reserve, choose file, Storage onchain, publish.
- Technical Report choose PDF, Storage onchain, publish.
- Dataset choose file, Storage onchain, publish.
- Software Release choose file, Storage onchain, publish.
- Generic File choose file, Storage onchain, publish.
- Blog Post with no images, Storage onchain, publish.
- Blog Post with multiple images, Storage onchain, publish.
- Add version for file-based artifacts.
- Add version for Blog Post Markdown package.
- Confirm the preparing button pulse stops before each wallet popup.
- Confirm the preparing button pulse stops on local preparation errors.
- Confirm repeated clicks during local preparation do not start duplicate preparation work.

The resulting content hash, content type, Walrus blob ID, Walrus blob object ID, and final PaperProof artifact/version records should remain semantically unchanged.
