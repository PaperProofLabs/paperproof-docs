---
name: record-paperproof-demo-video
description: Plan, record, subtitle, compose, and quality-check a 4:40-5:00 PaperProof hackathon demo video. Use when Codex needs to make or revise a PaperProof demo recording from the slides, official website, screenshots, Docs/Blog/Forum materials, SDK evidence, Skill evidence, Sui/Walrus proof, or submitted hackathon materials.
---

# Record PaperProof Demo Video

## Purpose

Produce a judge-facing PaperProof demo video with a final runtime between
4:40 and 5:00. The video must explain the protocol story, show the live website,
and prove that PaperProof is already real infrastructure across Sui, Walrus,
SDKs, indexers, Copilot, and AI/agent workflows.

## Required Sources

Read the smallest useful set before planning the recording:

- `paperproof-slides/paperproof-slides.pdf` or `paperproof-slides/paperproof-slides.tex`
  for the pitch story and current slide order.
- `paperproof-docs/homepages/docs/getting-started/research-and-presentation-materials.md`
  for artifact mapping, demo links, and submission context.
- `paperproof-sui-overflow-2026/README.md` for the public submission framing.
- `paperproof-docs/screenshots/README.md` for available website, SDK, GitHub,
  Skill, and formal-verification screenshots.
- `paperproof-docs/skills/operate-paperproof-website/SKILL.md` when the video
  includes live website control, connected wallet state, or website publishing.

If more detail is needed, read:

- `references/paperproof-video-storyboard.md` for the recommended 4:40-5:00
  sequence and narration beats.
- `references/recording-toolchain.md` for browser recording, TTS/subtitle,
  ffmpeg, and quality-check guidance.

## Target Runtime

- Hard target: 4:40-5:00.
- Planning target: 4:50, leaving +/-10 seconds of editing tolerance.
- Raw capture may be longer than 5:00. For live website, Walrus, Sui, wallet,
  indexer, or remote-query scenes, prioritize recording the complete successful
  action and result first, then remove waiting time in editing.
- English narration target: about 650-800 words at a clear demo pace.
- Chinese narration target: about 900-1200 Chinese characters at a clear demo pace.
- Do not submit a video shorter than 4:40 or longer than 5:00 unless the user
  explicitly changes the target.

## Video Shape

Use this default structure unless the user gives a newer direction:

| Time | Segment | Screen material |
|---|---|---|
| 0:00-1:20 | Pitch and problem | Slides: title, missing layer, aha, what PaperProof is |
| 1:20-2:00 | Architecture | Slides: Sui/Walrus, system architecture, application architecture |
| 2:00-3:20 | Live product | Official website: Explore, artifact detail, Version History, Walrus/hash fields |
| 3:20-4:05 | Agent and ecosystem | Copilot, native prompts/memory, PaperProof Skill, SDK publication proof |
| 4:05-4:40 | Engineering proof | GitHub organization, contract/formal-verification branch, indexer/SDK evidence |
| 4:40-4:55 | Closing | Slides final page or website homepage with site/GitHub/X links |

The first 1-2 minutes may be a slide playback, but the video must not feel like
only a deck recording. Switch into the real website and evidence screens early
enough for judges to see that the project is live.

## Workflow

1. Build a recording plan with:
   - exact source files and URLs;
   - final segment timings totaling 4:50;
   - raw capture tolerance for scenes that may wait on network, Walrus, Sui,
     wallet approval, or indexer refresh;
   - screen sequence;
   - narration draft;
   - required live actions or screenshots.
2. Preflight every live website scene:
   - open `https://paperproof.site/`;
   - confirm key pages load;
   - confirm artifact pages show versions, content hashes, and Walrus refs;
   - confirm Copilot and Docs/Blog/Forum screens render if they appear.
3. Record in 1920x1080 landscape unless the user asks for social/mobile output.
   During raw capture, let slow operations finish instead of cutting off a
   scene. Mark long waits, loading spinners, repeated polling, and wallet
   confirmation delays for later removal.
4. Produce a tight edit list after recording:
   - keep each user action;
   - keep the first clear loading state if useful;
   - cut most dead waiting time;
   - keep the final success/result/proof state long enough to read.
5. Generate or add narration and subtitles after the edited visual sequence is
   stable.
6. Compose with ffmpeg and remove unwanted raw microphone/system audio unless
   the user explicitly wants it preserved.
7. Quality-check the final MP4 with `ffprobe` and frame inspection.

## Tooling

Prefer these tools:

- PowerPoint/PDF viewer or browser for slide playback.
- Playwright or Puppeteer for website control and screenshot/recording support.
- Edge CDP automation through `http://127.0.0.1:9222` when using an existing
  wallet-connected website session.
- `ffmpeg` and `ffprobe` for concatenation, audio stripping, captions, trimming,
  runtime checks, and final MP4 encoding.
- `edge-tts` or another available TTS tool when synthetic narration is needed.
- The cloned `hackathon-demo-video/scripts/record-demo.py` may be used as a
  reference pipeline for Playwright recording, TTS, subtitle rendering, and
  ffmpeg composition; adapt it for Windows paths, PaperProof's connected Edge
  workflow, and the required 4:40-5:00 runtime.

## PaperProof-Specific Rules

- Tell the story as protocol infrastructure, not as a file-upload app.
- Always connect Walrus to durable content and Sui to authoritative artifact
  identity, versioning, governance, and events.
- Show dogfooding: PaperProof Docs, Blog, Forum, papers, slides, SDKs, and the
  PaperProof Skill are themselves represented as PaperProof artifacts or
  project evidence.
- Make the agent story concrete: Copilot native prompts and wallet-scoped
  memory support all six artifact classes, while the community PaperProof Skill
  lets AI agents handle complex protocol workflows for users.
- Show verifiability: current version, Version History, content hash, Walrus
  blob reference, GitHub organization, SDK package screenshots, and formal
  verification work where appropriate.
- If a wallet or signing operation appears in the recording, use the website UI
  and follow `operate-paperproof-website`; do not substitute direct Skill, SDK,
  Sui CLI, or contract calls unless the user explicitly changes the demo.
- Never expose wallet passwords, private keys, seed phrases, local secret file
  contents, or private repository material in video, subtitles, narration, or
  logs.

## Deliverables

For a completed video task, produce or update:

- final MP4, named clearly with date or version;
- narration script or subtitle text used to make the video;
- optional SRT/VTT subtitle file if generated separately;
- short YouTube/title/description copy if requested;
- concise quality-check notes with final duration, resolution, audio status,
  and key screens verified.

## Quality Gate

Before declaring the video ready:

- `ffprobe` must report a valid video stream, expected resolution, expected
  duration, and intended audio state.
- Runtime must be between 280 and 300 seconds.
- Long network, chain, wallet, Walrus, or indexer waits must be removed or
  compressed unless the wait itself is part of the point being demonstrated.
- Check representative frames from beginning, middle, and end for black screens,
  blank pages, tiny unreadable text, or subtitle overlap.
- Confirm the video includes at least one live website/product segment, one
  protocol architecture segment, and one verifiability/evidence segment.
- Confirm subtitles are readable and do not cover the exact UI fields being
  discussed.
