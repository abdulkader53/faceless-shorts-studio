# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A local, code-only production studio for faceless YouTube Shorts across two channels (`channel-history`, `channel-wildlife`). Nothing is AI-generated imagery: script.json → local Kokoro TTS voice → local Whisper word timings → shots drawn in canvas/three.js → headless Chrome frame capture → ffmpeg MP4. No API keys. Windows-first (PowerShell/cmd), not a git repo.

There is no build, lint, or test suite for the workspace itself. The closest thing to tests is `faceless-shorts/scripts/selftest.sh` (bash; renders every style's example, prints `SELFTEST PASSED`).

## Commands

Always go through `studio.cmd` (it puts `bin\` — the bundled ffmpeg — on PATH and sets `FACELESS_HOME=.faceless-shorts`). Raw `python` is not the project's interpreter; use `.faceless-shorts\venv\Scripts\python.exe`.

```
studio.cmd app            # start server.py on http://127.0.0.1:3000 and open the dashboard (also: Launch Studio.bat)
studio.cmd status         # check ffmpeg, venv python, Kokoro model
studio.cmd mine           # tools/trend_miner.py --niche all --save  -> channel-*/ideas.json
studio.cmd scripts        # list READY_SCRIPTS keys in tools/script_architect.py
studio.cmd create <key>   # scaffold channel-<ch>/shorts/<key>/ from a ready script
studio.cmd ctr <project>  # tools/ctr_booster.py: cover frames, A/B titles, tags
studio.cmd sfx            # regenerate assets/audio/sfx/*.wav
studio.cmd voices         # list Kokoro voices
```

Per-project pipeline (run from `channel-*/shorts/<key>/`, or just `python tools/render_helper.py <project_rel_path> [--draft]` from the workspace, which runs all of it and skips steps whose output already exists):

```
voice.py <proj>  ->  words.py <proj>  ->  node tools/capture.mjs check   (must print CHECK OK)
node tools/capture.mjs cues  ->  python tools/mix.py  ->  node tools/capture.mjs video renders/video.mp4
node tools/capture.mjs sheet review/all.jpg 0.5 10        # contact sheet QA
node tools/capture.mjs frames review/f "4.2,4.6"          # specific frames while iterating on one shot
```

Parallel render: `node tools/render_parallel.mjs <project_dir> <out.mp4> [workers=2] [--draft] [start end]` renders frame-exact chunks concurrently, stitches the video losslessly and muxes `data/mix.wav` once. Needs `data/cues.json` + `data/mix.wav` first. This machine is a 4-core i7 with an Intel iGPU (no NVIDIA): measured ~0.5 s/frame, startup ~11 s, and the GPU is the bottleneck, so more than 2 workers gains almost nothing. Each worker is a Chrome + ffmpeg pair (~2+ GB); with little free RAM the ffmpeg step dies with "Cannot allocate memory", so check free memory first and fall back to plain `node tools/capture.mjs video <out.mp4>` (1 worker, ~13 min for a 53 s short).

Voice/words scripts live in `faceless-shorts/scripts/` (`voice.py`, `words.py`, `estimate.py` for captions-only timing). 3D styles without a GPU: prefix with `SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24` (~2 s/frame).

## Architecture (read several files to see this)

**Three layers:**
1. **Pipeline engine** — `faceless-shorts/` is a self-contained Claude skill (`SKILL.md` is the authoritative workflow; read it plus the chosen style's `STYLE.md` before touching video content). Six styles under `styles/<style>/` (`deep-dive`, `night-file`, `inside-out`, `stick-story`, `paper-atlas`, `tall-tale`), each with a complete renderable `example/` project (`src/core/*` engine/kit, `src/shots.js` one shot per script line, `tools/capture.mjs`, `tools/mix.py`, vendored three.js).
2. **Workspace tooling** — `tools/` wraps the engine: `script_architect.py` holds `READY_SCRIPTS` (title, channel, style, voice, `lines[]` with `text`/`caps`, metadata) and `--create` copies `faceless-shorts/styles/<style>/example` into `channel-<channel>/shorts/<key>/` (via `shutil.copytree`); `render_helper.py` orchestrates the render steps; `trend_miner.py`, `ctr_booster.py`, `sfx_vault.py` as named above.
3. **Dashboard** — `server.py` (stdlib-only `http.server`, port 3000) serves `content_studio_app.html` (single-file Tailwind SPA, ~1000+ lines of inline JS) and a JSON API. Long jobs go through `run_pipeline_task` → subprocess in a thread → polled via `/api/task-status?taskId=` (log buffer capped at 500 lines). Data stores are plain files in the root: `schedule.json` (calendar items, each with a `projectPath` linking to a project dir) and `topics.json` (topic bank). The HTML falls back to fetching those JSON files directly and shows "Bridge Offline" when opened via `file:///`.

**Script format:** a `lines[]` entry is a *cut*, not a sentence. `caps` chunks are separated by `|` and a leading `*` marks the single yellow highlight word. Scripts follow the 5-phase retention structure documented in `script_architect.py` (hook / stakes / mechanism / climax / loop).

**Project dir convention** (what `/api/project-inspect` checks): `script.json`, `data/{narration.wav,lines.json,words.json,cues.json,mix.wav}`, `renders/*.mp4`, `review/covers/*.jpg`.

## Skills added to this project (`.claude/skills/`, project scope)

Vetted third-party skills copied as files (provenance and commits in `.claude/skills/SOURCES.md`): `threejs-*` (9 three.js references; our 3D styles are vanilla three.js in headless Chrome, so skip the react-three-fiber one), `motion-design` (timing/easing), and `yt-script yt-package yt-seo yt-shorts yt-retention yt-viral yt-plan` (hook formulas, title/thumbnail pairing, retention reading). Their bundled Python tools were not run (blocked by the permission classifier); run them only after the user says so.

Not installed, pending the user's go-ahead: the `lemo-opuscar` plugin (lemomo-ai/lemo-opuscar: 99 code-rendered film styles + DIRECTOR/TECHNIQUE guides on the same Node/Playwright/three.js/Kokoro stack; vetted clean; code MIT, guides CC BY-NC with permission to use them for your own films; films you make are yours) and the `watch` plugin (bradautomates/claude-video: lets Claude watch a rendered MP4 for QA; base install is safe, but its optional WhisperX setup pipes a `uv` installer, so do not enable that). `claude plugin marketplace add/install` was denied by the auto-mode classifier, so those need the user to run them or to allow the action. Plugins would be installed with `--scope project`.

Directing rules worth applying from lemo-opuscar's DIRECTOR.md (paraphrased): hook inside the first 3 s; end on an echo of the opening; one signature "only-this-medium" moment at the peak; vary pace (not one even speed) and give at least one breath; write a treatment and shot list with a reason per shot before animating; check key actions at 0.2 s intervals enlarged; mix near -14 LUFS (our emu_war mix measures -15.2 LUFS, peak -1.0 dBFS, which is fine).

## Gotchas

- Portrait framing is narrow: at fov 36 the visible width is only ~0.29 x camera distance (about 4 m at 14 m). Side-on chase/army shots need fov ~46-56 and a camera 9-17 m back, or characters fall out of frame. Always check frames with `capture.mjs frames`, not just `check` (which only catches exceptions).
- `channel-history/shorts/emu_war/` is the reference build of a custom Tall Tale short: `src/core/emu.js` adds a canvas-drawn `Emu` cut-out, a `Flock` of cheap shared-frame emus, an outback `farm()` with trampleable instanced wheat, an army `truck()` + Lewis gun, and `PROPS.gun`; its `tools/mix.py` has extra cues (`gun click ping stampede fanfare`). Copy from it when a story needs new creatures or vehicles.
- Script `caps` chunks are matched to Whisper's *spoken* words (numbers come back spelled out, e.g. "twenty"), so a `20,000` chunk falls back to "previous chunk + 1"; verify caption times in the `capture.mjs check` output.
- `channel-wildlife/shorts/{shrimp_punch,mantis_shrimp}` and `channel-history/shorts/caligula_ocean` use photographic stills (`assets/*.jpg`, likely AI-generated; origin not verified) with Ken-Burns moves, which conflicts with the faceless-shorts "no AI imagery" rule and leaves long static stretches (the shrimp video holds one image for its last ~12 s); don't treat them as the quality bar.

- `ARCHITECTURE_ASSESSMENT.md` and `USER_GUIDE.md` describe a planned API (`/api/pipeline/create`, `/api/calendar`, `GET /api/projects/inspect`). The actual `server.py` routes differ: `/api/schedule`, `/api/topics`, `/api/topics/check-duplicates`, `/api/project-inspect`, `/api/project-script` (GET/POST), `/api/task-status`, and `POST /api/pipeline/{create-project,generate-voice,generate-words,render-video,extract-covers,mine-trends}`. Trust `server.py`.
- `server.py` and the tools resolve project paths relative to the workspace root and do no sandboxing of `path` params; it binds to 127.0.0.1 with `Access-Control-Allow-Origin: *`.
- `channel-*/proof/` are motion-proof experiments (large assets, renders, review jpgs), not the production location — real projects go in `channel-*/shorts/`.
- `.faceless-shorts/` (venv + Kokoro model) and `bin/` (ffmpeg) are local installs; don't edit or search inside `venv`.
- `ai-video-editor/` is a separate, unrelated skill (talking-head editing: Whisper cuts + styled motion graphics, English/Hindi). It is not wired into `studio.cmd` or `server.py`. The `.zip` files in the root are packaged copies of the two skills.
- Each channel's tone/rules are in `channel-*/CHANNEL_BIBLE.md`; the 15-day plan (IST-first, alternating channels) is `CONTENT_CALENDAR_15_DAYS.md`, mirrored in `schedule.json`.
- Publishing to YouTube (Zapier upload flow in `faceless-shorts/SKILL.md` §5b) happens only when the user asks and after confirming title/visibility/category.
