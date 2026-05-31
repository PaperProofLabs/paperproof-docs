# Static Frontend Integration

Docs Path: `developers/static-frontend-integration`

Artifact Code: PaperProof-generic_file-001144-c3190886ae51
Series ID: 0xc3190886ae5103e7a8b0faf8290b329ac726ec23e0c6a5822cbe7cd5109810fa
Comments Tree: locked

The official PaperProof app is a TypeScript application compiled into static
assets. A static site can still display dynamic protocol state by calling
external APIs from the browser.

## What a static app can do

A browser application can:

- query Sui objects and events;
- retrieve Walrus content;
- load deployment manifests;
- build transactions;
- request wallet signatures;
- call browser-compatible model APIs;
- use browser-compatible memory relayers.

## CORS boundary

Browser requests are subject to CORS and network policy. A static host cannot
proxy requests by itself. External services that are called directly from the
browser must support the required cross-origin requests.

For local demos, a Vite development proxy may forward MemWal relayer requests.
For production static deployment, use a CORS-compatible relayer. If the relayer
is unavailable, memory recall and save should degrade gracefully without
breaking ordinary Copilot answers or chain features.

## Source of truth

The static app is an access layer. Sui objects, Walrus content, and the active
deployment manifest remain the protocol sources of truth.

## Static does not mean inert

A static deployment ships HTML, CSS, and JavaScript files without an
application server. Once loaded, the browser can still execute TypeScript-built
JavaScript, call public APIs, read protocol objects, retrieve blobs, and ask a
wallet extension to sign transactions. The displayed data can change from
minute to minute even though the deployed site files do not.

## Wallet boundary

The app should build unsigned transactions through the SDK and delegate signing
to the user's wallet. Never embed a private key, mnemonic, or privileged signer
in static assets. Secrets placed in frontend bundles are public.

## Browser network boundary

CORS is enforced by the browser because a script loaded from one origin is
trying to read a response from another origin. A human opening a URL in a tab is
not the same security operation. JavaScript cannot remove this restriction.

A Vite development proxy can help during local demonstrations because the
development server forwards requests. GitHub Pages, Walrus Sites, and other
static hosts do not become backend proxies merely by serving JavaScript.

## Graceful degradation matrix

| Failure | Expected effect |
|---|---|
| Indexer unavailable | Fall back to direct reads where practical or show incomplete state |
| Walrus read failure | Keep chain metadata visible and report preview failure |
| Model API failure | Report Copilot error without breaking protocol browsing |
| MemWal relayer CORS failure | Disable recall and saving only; preserve ordinary Copilot and chain features |
| Wallet disconnected | Keep reads available; disable signed actions |

The official app uses a local `/memwal-relayer` Vite proxy for hackathon demos.
Production static memory save and recall require a browser-compatible relayer
that allows the deployed site origin.

## Native prompt loading

The app loads a prompt manifest, resolves the registered latest or pinned
`generic_file` version on Sui, downloads the Walrus prompt package, validates
its schema, and injects it before its embedded fallback prompt. A prompt read
failure should not make the entire static site unusable.
