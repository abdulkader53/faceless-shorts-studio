# YouTube Content Studio — Platform User Guide & Operations Manual

Welcome to the **YouTube Content Studio: Creator Operations Platform**.

This platform is a comprehensive, production-grade operations suite designed to manage and produce high-retention faceless YouTube Shorts for two distinct channels:
1. **Channel 1 — History & Lore** (Bizarre True Events, Military Blunders, Ancient Mysteries)
2. **Channel 2 — Wild Anatomy & Superpowers** (Extreme Biology, Micro-Monsters, Nature's Physics)

---

## 🌟 The Core Principle: Zero-Terminal Operations

You **never** need to open a command prompt, navigate terminal directories, or remember Python, Node.js, or FFmpeg syntax to operate this studio. Every routine production operation—from scheduling to script creation, neural voiceover synthesis, word-by-word subtitle alignment, video rendering, and thumbnail cover extraction—is driven through the visual graphical interface.

---

## 🚀 1. Quick Launch (1-Click Startup)

To open the platform:

```cmd
studio.cmd app
```

*(You can also double-click `studio.cmd` or create a desktop shortcut to `studio.cmd app`).*

### What Happens Automatically:
1. The **Platform Bridge Server** (`server.py`) starts locally at `http://127.0.0.1:3000/`.
2. Your default web browser opens directly to the **YouTube Content Studio Platform**.
3. All local neural models (Kokoro TTS, Faster-Whisper), FFmpeg render engines, and project data stores connect instantly with a green **BRIDGE CONNECTED** indicator.

> **Offline / Standalone Fallback**: If you open `content_studio_app.html` directly from Windows Explorer (via `file:///`), the entire planning dashboard, calendar, topic bank, and duplicate detector operate offline. The production workspace displays copy-ready terminal commands if the bridge server is not active.

---

## 🖥️ 2. Platform Navigation & Modules

The platform is organized into 8 synchronized modules via the top navigation bar:

| Module | Purpose | Key Capabilities |
|---|---|---|
| **Overview** | Daily mission control | TODAY hero card, 8 real-time KPI metrics, 7-day publishing horizon, channel health cards. |
| **Content Calendar** | Visual scheduling | 15-day rolling calendar, Kanban production pipeline, list view, and dual IST/EST timezone windows. |
| **Production Workspace** | Video creation suite | 12-stage production checklist, 7 GUI pipeline action buttons, real-time live terminal log stream. |
| **Topic Bank** | Centralized idea vault | 15 pre-loaded viral topics, taxonomy tags, priority indicators, and live duplicate detection engine. |
| **Research & Discovery** | Viral trend mining | Real-time hook analysis, curiosity score ranking, and 1-click topic approval into the schedule. |
| **Channel Hubs** | Brand management | Dedicated hubs for History & Lore and Wild Anatomy with 8 category taxonomies and style guides. |
| **Published Archive** | Release history | Log of published videos, tags, and video URLs for historical performance tracking. |
| **Daily Reminders** | Execution rigor | Daily 25-minute production checklist, upload countdown, and release alarms. |

---

## 📅 3. The 15-Day Rolling Content Calendar & Timing Strategy

### Dual-Channel Alternating Cadence
The content schedule alternates daily between your two channels to maintain high algorithmic momentum without audience fatigue:

- **Odd Days (Day 1, 3, 5...)**: Channel 1 (History & Lore)
- **Even Days (Day 2, 4, 6...)**: Channel 2 (Wild Anatomy & Superpowers)

### Global Timezone Architecture
All scheduling is displayed with dual timezone awareness:
- **Local Production Time (Primary)**: `Asia/Kolkata` (IST) — Aligned with your daily working schedule.
- **Audience Publishing Window (Target)**: `US / Eastern` (EST) — Optimized for peak viewer activity in Tier-1 territories (US, UK, Canada).

| Day Type | Target EST Publishing Window | Local IST Production Target | Rationale |
|---|---|---|---|
| **Weekdays (Mon–Fri)** | **12:00 PM – 2:30 PM EST** | **9:30 PM – 12:00 AM IST** | Captures US lunch break and afternoon commute engagement. |
| **Weekends (Sat–Sun)** | **9:30 AM – 11:30 AM EST** | **7:00 PM – 9:00 PM IST** | Captures early morning weekend browsing and high retention sessions. |

### Calendar Views
- **Master 15-Day Calendar**: Click any date card to inspect scheduled topics, current checklist status, and jump straight into production.
- **Kanban Board**: Drag-and-drop or status-group cards across `IDEA`, `SCRIPT_READY`, `VOICE_READY`, `RENDERING`, `READY_TO_PUBLISH`, and `PUBLISHED`.
- **List View**: Dense operational table for bulk status checks and category audits.

---

## 🛡️ 4. Centralized Topic Bank & Duplicate Detection Engine

To prevent repetitive content and audience cannibalization, the platform includes a real-time **Exact & Semantic Duplicate Checker**.

### How to Use:
1. Open the **Topic Bank** module.
2. In the **Add New Topic** modal, type your proposed video title.
3. The engine instantly evaluates your title against all existing topics across two criteria:
   - **Exact Duplicate**: Normalizes punctuation, case, and spacing to flag identical concepts.
   - **Semantic Duplicate**: Strips stop words (`the`, `why`, `how`, `what`) and calculates subject keyword overlap.
4. If a match is found:
   - The UI displays a warning banner highlighting the matching topic.
   - It lists the shared subjects (e.g., *"Caligula", "legions", "ocean"*).
   - Displays a similarity score percentage to prevent redundant production.

---

## ⏱️ 5. Step-by-Step 25-Minute Daily Production Workflow

With the platform bridge running, creating a finished, broadcast-ready Short takes under 25 minutes:

```
[Select Day] ➔ [1. Create Project] ➔ [2. Generate Voice] ➔ [3. Align Words] ➔ [4. Render Video] ➔ [5. Extract Covers] ➔ [Publish]
```

### Step 1: Select Active Content
- Navigate to the **Production Workspace**.
- Select the day's scheduled topic from the dropdown (e.g., `Day 1: The Emperor Who Declared War On The Ocean`).
- Review the 12-stage checklist ribbon.

### Step 2: 1-Click Project Initialization
- Click **📁 Create / Reset Project**.
- The platform automatically scaffolds the project folder, copies the selected visual style template, and formats `script.json` and `metadata.json`.

### Step 3: Neural Voice Synthesis
- Click **🎙️ Generate Voice**.
- Kokoro-82M neural TTS synthesizes a realistic, high-energy American narration track (`data/narration.wav`) in under 15 seconds.

### Step 4: Subtitle Word-by-Word Alignment
- Click **📝 Align Subtitles**.
- Faster-Whisper analyzes the waveform and timestamps every individual word into `data/words.json` with 100% phonetic accuracy.

### Step 5: Full Video Rendering & Procedural Audio Mix
- Click **🎬 Render Video (MP4)**.
- The automated pipeline helper executes three operations in sequence:
  1. Extracts camera and foley cues (`data/cues.json`).
  2. Synthesizes procedural sound effects (whooshes, pops, dings) and ducks background music under the speech (`data/mix.wav`).
  3. Drives headless Edge/Chrome to capture 1080x1920 30fps frames and encodes an ultra-crisp H.264 MP4 (`renders/video.mp4`).

### Step 6: CTR Cover Thumbnail Extraction
- Click **🖼️ Extract Covers**.
- FFmpeg extracts 4 to 5 high-action frames from peak visual moments into `review/covers/` and computes sharpness ratings.

### Step 7: Final QA & Checklist Verification
- The 12-stage checklist ribbon automatically updates with green checkmarks (`✓`) for all completed steps.
- The project status advances to **READY_TO_PUBLISH**.

---

## 📤 6. YouTube Studio Publishing Handoff

When your video is rendered, publishing to YouTube Shorts is seamless:

1. Click the **YouTube Studio Handoff** modal in the Production Workspace.
2. **Title**: Click **Copy** next to your preferred high-CTR title (Option 1, 2, or 3).
3. **Description & Hashtags**: Click **Copy Description** to grab the pre-formatted description with optimized hashtag clusters (`#shorts #history #weirdhistory`).
4. **Thumbnail Selection**:
   - In the YouTube mobile app or YouTube Studio web uploader, drag the frame scrubber to select the exact second corresponding to your chosen cover frame (e.g., `cover_1.5s.jpg`).
5. **Pinned Comment**: Copy the curiosity-inducing discussion question into your upload notes to paste as your pinned comment immediately after publishing.

---

## 🎨 7. Channel Style Mappings & Taxonomies

### Channel 1: History & Lore
- **Visual Styles**:
  - `tall-tale` (2D expressive cut-out characters inside miniature 3D worlds).
  - `paper-atlas` (Vintage textured map animations and parchment reveals).
  - `night-file` (Atmospheric noir dossier and redacted document reveals).
- **8 Categories**:
  1. Bizarre True Events
  2. Military Blunders
  3. Ancient Mysteries & Architecture
  4. Heists & Con Artists
  5. Royal Scandals & Feuds
  6. Accidental Inventions
  7. Survival Under Odds
  8. Dark Folklore & Curses

### Channel 2: Wild Anatomy & Superpowers
- **Visual Styles**:
  - `deep-dive` (Zack D. Films medical and anatomical 3D explainers).
  - `inside-out` (Cross-section X-ray reveals and microscopic physics).
  - `stick-story` (Minimalist, rapid-fire cartoon physics animations).
- **8 Categories**:
  1. Extreme Animal Physics
  2. Micro-Monsters & Parasites
  3. Venom & Chemical Warfare
  4. Super-Senses & Detection
  5. Body Horror & Metamorphosis
  6. Predator vs Prey Duels
  7. Deep Ocean Extremophiles
  8. Prehistoric Titans

---

## ⚙️ 8. Maintenance & Health Diagnostics

The **Settings & Diagnostics** tab in the platform provides real-time system verification:

- **Python Virtual Environment**: Verified at `.faceless-shorts/venv/Scripts/python.exe`.
- **FFmpeg Full Build**: Verified at `bin/ffmpeg.exe`.
- **Kokoro-82M Voice Weights**: Verified at `.faceless-shorts/kokoro/kokoro-v1.0.onnx`.
- **Faster-Whisper Subtitle Engine**: Operational and cached locally.
- **Browser Automation Engine**: Microsoft Edge & Chrome auto-detected.

To run a manual diagnostic check from CMD at any time:
```cmd
studio.cmd status
```

---

## 🔮 9. Future Integration Roadmap (Backend Enhancements)

The following capabilities are architected into the UI and ready for direct API integration:

1. **Direct YouTube Data API v3 OAuth Uploader**:
   - Direct background uploading to YouTube Studio without manual browser drag-and-drop.
2. **Automated Cloud Backup**:
   - Synchronizing rendered MP4 masters and JSON databases to Google Drive or AWS S3.
3. **YouTube Analytics Ingestion**:
   - Polling 24-hour and 48-hour Shorts feed retention curves, swipe-away percentages, and click-through rates (CTR) directly into the Overview Dashboard.

---

*YouTube Content Studio Platform — Engineered for Creators.*
