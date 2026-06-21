# Recording Toolchain

Use this reference when implementing the actual PaperProof demo recording,
captioning, and final MP4 assembly.

## Environment Checks

Check these before recording:

```powershell
ffmpeg -version
ffprobe -version
node -v
npm root -g
```

If using Python TTS or the external recording script, also check:

```powershell
uv --version
python --version
```

The workstation has previously used global Node modules for Playwright and
Puppeteer. In Node automation, resolve global modules with:

```js
const { execSync } = require("child_process");
process.env.NODE_PATH = execSync("npm root -g").toString().trim();
require("module").Module._initPaths();
```

## Website Recording

When a connected wallet or real browser session is needed, connect to the
existing Edge instance through CDP:

```js
const { chromium } = require("playwright");
const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
const context = browser.contexts()[0];
```

If the Edge session is not running, ask the user to launch it with:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="D:\Works\VscodeProject\PaperProofLabs\.edge-codex-profile" `
  "https://paperproof.site/"
```

For website-only scenes that do not need wallet state, a fresh Playwright
browser context is acceptable.

## Reusable Recording Pipeline

The cloned `hackathon-demo-video` repository provides a useful reference
pipeline:

```powershell
uv run hackathon-demo-video\scripts\record-demo.py `
  "https://paperproof.site/" `
  "Narration text here." `
  --format landscape `
  --capture desktop `
  --layout native `
  --voice en-US-GuyNeural `
  --output demo\paperproof-demo-subtitled.mp4
```

Adapt before relying on it:

- its default steps are for another demo app;
- its browser launch path is macOS-oriented in fallback code;
- it records a fresh headless browser, not a connected Edge wallet session;
- its subtitle font fallback may need Windows fonts such as Arial, Segoe UI, or
  Microsoft YaHei;
- its final duration follows the longer of video and narration, so pad visual
  steps or edit narration to stay between 280 and 300 seconds.

## ffmpeg Recipes

Strip audio:

```powershell
ffmpeg -y -i input.mp4 -c:v copy -an output-no-audio.mp4
```

## Cutting Waiting Time

For PaperProof demos, raw capture can intentionally run longer than the final
submission video. This is preferable for scenes that involve wallet approval,
Walrus storage, Sui queries, transaction confirmation, indexer refreshes,
Copilot responses, or remote page loading.

After recording, create an edit list:

| Keep | Cut or shorten |
|---|---|
| The click, form action, wallet confirmation, or navigation that starts the operation | Long spinners, repeated polling, blank loading pages, idle cursor time |
| A short glimpse that the system is doing real work | Waiting that does not teach the judge anything |
| The final result, transaction/proof state, content hash, Walrus blob, Version History, or success page | Duplicate views of the same unchanged screen |

Simple trim one segment:

```powershell
ffmpeg -y -ss 00:01:12 -to 00:01:38 -i raw.mp4 `
  -c:v libx264 -preset veryfast -crf 18 -c:a aac segment-01.mp4
```

Create multiple tight segments, then concatenate them. Use transcoding for
segments when source parameters may differ:

```powershell
ffmpeg -y -ss 00:00:00 -to 00:00:42 -i raw.mp4 -c:v libx264 -crf 18 -preset veryfast -c:a aac seg-01.mp4
ffmpeg -y -ss 00:01:25 -to 00:02:10 -i raw.mp4 -c:v libx264 -crf 18 -preset veryfast -c:a aac seg-02.mp4
ffmpeg -y -ss 00:03:45 -to 00:04:35 -i raw.mp4 -c:v libx264 -crf 18 -preset veryfast -c:a aac seg-03.mp4
```

`concat-list.txt`:

```text
file 'seg-01.mp4'
file 'seg-02.mp4'
file 'seg-03.mp4'
```

Concatenate:

```powershell
ffmpeg -y -f concat -safe 0 -i concat-list.txt `
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p `
  -c:a aac -b:a 128k paperproof-tight-cut.mp4
```

Prefer a tight visual cut first, then write narration/subtitles to match that
edited video. If narration already exists, adjust subtitle timings after cutting
or regenerate subtitles from the final narration.

Concatenate files with matching codec parameters:

```powershell
ffmpeg -y -f concat -safe 0 -i concat-list.txt -c copy merged.mp4
```

Transcode to stable 1080p H.264/AAC:

```powershell
ffmpeg -y -i input.mp4 `
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" `
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p `
  -c:a aac -b:a 128k output.mp4
```

Burn subtitles:

```powershell
ffmpeg -y -i input.mp4 -vf "subtitles=subtitles.srt" `
  -c:v libx264 -preset medium -crf 20 -c:a copy output-subtitled.mp4
```

## Quality Checks

Run:

```powershell
ffprobe -v error -show_streams -show_format final.mp4
```

Verify:

- duration is `280 <= seconds <= 300`;
- resolution is 1920x1080 unless intentionally changed;
- audio is present only if intended;
- subtitles are readable;
- first, middle, and final frames are nonblank;
- the video visibly includes slides, official website, artifact proof, and
  ecosystem evidence.

Use frame extraction for visual spot checks:

```powershell
ffmpeg -y -ss 00:00:05 -i final.mp4 -frames:v 1 frame-start.png
ffmpeg -y -ss 00:02:30 -i final.mp4 -frames:v 1 frame-mid.png
ffmpeg -y -ss 00:04:45 -i final.mp4 -frames:v 1 frame-end.png
```
