"""Universal Video Render & Assembly Pipeline Helper.
Executes the full end-to-end rendering pipeline for a YouTube Shorts project:
  1. Verifies voice and word alignment artifacts
  2. Extracts sound cues (capture.mjs cues) -> data/cues.json
  3. Synthesizes procedural audio mix (mix.py) -> data/mix.wav
  4. Headless Chrome/Edge frame capture to MP4 (capture.mjs video) -> renders/video.mp4
  5. Extracts 4-5 high-CTR candidate cover frames (ctr_booster.py) -> review/covers/*.jpg
"""
import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE = Path(__file__).resolve().parent.parent
PYTHON_EXE = WORKSPACE / ".faceless-shorts" / "venv" / "Scripts" / "python.exe"
if not PYTHON_EXE.exists():
    PYTHON_EXE = Path(sys.executable)

FFMPEG_BIN = WORKSPACE / "bin"


def run_step(step_name: str, cmd_args: list, cwd: Path):
    """Run a sub-process step, streaming stdout directly to console."""
    print(f"\n=======================================================")
    print(f"▶ [{step_name.upper()}] Starting...")
    print(f"  Command: {' '.join(str(c) for c in cmd_args)}")
    print(f"  Working Dir: {cwd}")
    print(f"=======================================================")
    t0 = time.time()
    env = os.environ.copy()
    env["PATH"] = str(FFMPEG_BIN) + os.pathsep + env.get("PATH", "")
    env["FACELESS_HOME"] = str(WORKSPACE / ".faceless-shorts")

    p = subprocess.Popen(
        cmd_args,
        cwd=str(cwd),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    for line in p.stdout:
        print(line.rstrip(), flush=True)

    p.wait()
    elapsed = time.time() - t0
    if p.returncode != 0:
        print(f"[✘] Step '{step_name}' failed with exit code {p.returncode} in {elapsed:.1f}s")
        return False
    print(f"[✔] Step '{step_name}' completed successfully in {elapsed:.1f}s")
    return True


def render_project(project_path_str: str, draft: bool = False):
    proj_path = (WORKSPACE / project_path_str).resolve()
    if not proj_path.exists():
        print(f"Error: Project directory not found: {proj_path}")
        return False

    print(f"\n🎬 Initiating Full Video Render Pipeline for: {proj_path.name}")
    print(f"Target Project Directory: {proj_path}")

    # Check prerequisites
    script_file = proj_path / "script.json"
    if not script_file.exists():
        print("Error: script.json missing! Run project creation first.")
        return False

    narration_file = proj_path / "data" / "narration.wav"
    words_file = proj_path / "data" / "words.json"
    if not narration_file.exists() or not words_file.exists():
        print("Notice: Narration or words missing. Generating voice and alignment now...")
        voice_script = WORKSPACE / "faceless-shorts" / "scripts" / "voice.py"
        words_script = WORKSPACE / "faceless-shorts" / "scripts" / "words.py"
        if not run_step("voice_synthesis", [str(PYTHON_EXE), str(voice_script), str(proj_path)], proj_path):
            return False
        if not run_step("word_alignment", [str(PYTHON_EXE), str(words_script), str(proj_path)], proj_path):
            return False

    # Step 1: Extract Cues
    cues_file = proj_path / "data" / "cues.json"
    if not cues_file.exists() or cues_file.stat().st_size == 0:
        if not run_step("extract_cues", ["node", "tools/capture.mjs", "cues"], proj_path):
            return False

    # Step 2: Audio Foley & Music Mix
    mix_file = proj_path / "data" / "mix.wav"
    if not mix_file.exists() or mix_file.stat().st_size == 0:
        if not run_step("audio_mix", [str(PYTHON_EXE), "tools/mix.py"], proj_path):
            return False

    # Step 3: Video Frame Capture & H.264 MP4 Encode
    renders_dir = proj_path / "renders"
    renders_dir.mkdir(parents=True, exist_ok=True)
    out_mp4 = renders_dir / "video.mp4"
    render_args = ["node", "tools/capture.mjs", "video", str(out_mp4)]
    if draft:
        render_args.extend(["0", "5", "--draft"])

    if not run_step("video_render", render_args, proj_path):
        return False

    # Step 4: Extract CTR Cover Thumbnails
    ctr_script = WORKSPACE / "tools" / "ctr_booster.py"
    run_step("ctr_covers", [str(PYTHON_EXE), str(ctr_script), str(proj_path.relative_to(WORKSPACE))], WORKSPACE)

    print(f"\n=======================================================")
    print(f"🎉 PRODUCTION PIPELINE COMPLETE: {proj_path.name}")
    print(f"   Video: {out_mp4.relative_to(WORKSPACE)}")
    if out_mp4.exists():
        size_mb = out_mp4.stat().st_size / (1024 * 1024)
        print(f"   File Size: {size_mb:.2f} MB")
    print(f"   Ready for Review & YouTube Studio Publishing!")
    print(f"=======================================================")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Render Full Faceless Short Video")
    parser.add_argument("project_path", type=str, help="Relative or absolute path to project directory")
    parser.add_argument("--draft", action="store_true", help="Render fast draft (first 5s, lower quality)")
    args = parser.parse_args()

    success = render_project(args.project_path, draft=args.draft)
    sys.exit(0 if success else 1)
