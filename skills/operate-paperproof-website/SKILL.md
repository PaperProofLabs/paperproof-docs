---
name: operate-paperproof-website
description: Operate the PaperProof official website as an AI agent through an automated Edge browser. Use when Codex must inspect, screenshot, test, publish, update versions, connect a wallet, confirm wallet prompts, or debug paperproof.site UI behavior without using the PaperProof protocol Skill or direct contract calls.
---

# Operate PaperProof Website

## Purpose

Use browser automation against the real PaperProof website at
`https://paperproof.site/`. This skill is for AI agents, not human operators:
it records which tools, runtime paths, browser connection methods, and safety
constraints to use when operating the site.

## Preferred Tools

- Use Playwright first for browser control. Puppeteer is acceptable for simple
  DOM inspection or screenshots.
- Connect to an already launched Microsoft Edge session through Chrome DevTools
  Protocol at `http://127.0.0.1:9222` when a wallet session is needed.
- Use the system's global Node package location when a local repo does not have
  Playwright/Puppeteer installed. On this workstation the global Node modules
  path observed during setup was `E:\ProgramFiles\nodejs\node_modules`.
- In Node scripts, set `NODE_PATH` from `npm root -g` and call
  `require("module").Module._initPaths()` before requiring global packages.
- Use screenshots and DOM assertions to verify outcomes. Do not rely only on a
  click completing without an error.

Example module bootstrap:

```js
const { execSync } = require("child_process");
process.env.NODE_PATH = execSync("npm root -g").toString().trim();
require("module").Module._initPaths();
const { chromium } = require("playwright");
```

Example CDP connection:

```js
const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
const context = browser.contexts()[0];
const page = context.pages().find((p) => p.url().includes("paperproof.site"))
  ?? await context.newPage();
```

## Browser Session

- If no automation-ready Edge is running, ask the user to launch Edge with
  remote debugging and the shared Codex profile, for example:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="D:\Works\VscodeProject\PaperProofLabs\.edge-codex-profile" `
  "https://paperproof.site/"
```

- Reuse the existing Edge session when the user says the wallet is already
  connected or unlockable. A fresh profile may lose wallet state.
- Wallet popups may appear as `chrome-extension://...` pages in the same CDP
  browser context. Inspect all pages, not only the active website tab.

## Secrets

- Wallet password material may exist under
  `D:\Works\VscodeProject\PaperProofLabs\secrets\`.
- Never print, quote, commit, screenshot, or summarize secret values.
- Read secret files only when needed to unlock or confirm a wallet operation,
  and keep values in memory only for the current automation step.
- Do not store private keys or wallet passwords in generated docs, logs, test
  fixtures, screenshots, or Skill output.

## Operating Constraints

- When the user explicitly requires website operation, do not use the
  community PaperProof Skill, SDKs, direct Sui CLI calls, or direct contract
  transactions to substitute for the browser workflow.
- It is acceptable to inspect or patch website code when UI behavior blocks the
  requested browser task, but preserve the visible interface unless the user
  asks for a UI change.
- If a form appears stuck, check browser-native validation with
  `form.checkValidity()` and enumerate invalid inputs. Some required fields may
  be hidden or easy to miss.
- Some actionable controls are links rather than buttons. Query by role, text,
  href, and visible DOM when role-based lookup misses a control.
- Wallet approval clicks may need `force: true` or a bounding-box mouse click
  if the extension overlay intercepts pointer events.
- Expect multi-phase operations: one signing step may store content or prepare
  Walrus state, followed by a second signing step for the PaperProof on-chain
  publication/update.

## Verification

- After a publish or version update, navigate back to the artifact detail page
  and verify the current version, content hash, Walrus blob reference, and
  Version History.
- Capture screenshots only after the page is stable and relevant dynamic
  content has loaded.
- For production checks, prefer visible website state plus network/DOM evidence
  over local assumptions.
- Record important non-secret facts such as artifact ID, version number,
  content hash, blob ID, and transaction digest in the task response or project
  record when useful.
