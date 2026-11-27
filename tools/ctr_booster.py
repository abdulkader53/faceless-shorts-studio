"""CTR Booster & Metadata Optimizer for YouTube Shorts.
Generates viral titles, high-retention descriptions, SEO hashtag clusters,
and extracts peak-action thumbnail candidate frames using FFmpeg.
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

WORKSPACE = Path(__file__).resolve().parent.parent
FFMPEG = WORKSPACE / "bin" / "ffmpeg.exe"
if not FFMPEG.exists():
    FFMPEG = "ffmpeg"


def extract_cover_frames(project_path: Path, timestamps=[1.5, 4.0, 10.0, 18.0]):
    """Extract candidate cover frames for YouTube Shorts thumbnail selection."""
    video_path = project_path / "renders" / "video.mp4"
    if not video_path.exists():
        # Look for any mp4 in renders
        mp4s = list((project_path / "renders").glob("*.mp4"))
        if mp4s:
            video_path = mp4s[0]
        else:
            print(f"No rendered video found in {project_path / 'renders'} yet.")
            return []

    covers_dir = project_path / "review" / "covers"
    covers_dir.mkdir(parents=True, exist_ok=True)
    generated = []

    for t in timestamps:
        out_jpg = covers_dir / f"cover_{t:.1f}s.jpg"
        cmd = [
            str(FFMPEG), "-y", "-ss", str(t), "-i", str(video_path),
            "-frames:v", "1", "-q:v", "2", str(out_jpg)
        ]
        try:
            subprocess.run(cmd, capture_output=True, check=True)
            if out_jpg.exists():
                generated.append(out_jpg)
        except Exception:
            pass

    return generated


def generate_metadata_pack(project_path: Path):
    """Generate YouTube/TikTok title, description, and engagement pinned comment."""
    meta_file = project_path / "metadata.json"
    script_file = project_path / "script.json"
    
    title = "Viral Short"
    tags = ["shorts", "trending"]
    description = ""
    
    if meta_file.exists():
        meta = json.loads(meta_file.read_text(encoding="utf-8"))
        titles = meta.get("titles", [meta.get("title", "Viral Short")])
        tags = meta.get("tags", tags)
        description = meta.get("description", "")
    elif script_file.exists():
        s = json.loads(script_file.read_text(encoding="utf-8"))
        title = s.get("title", title)
        titles = [title, f"The Truth About {title}", f"What They Don't Tell You: {title}"]
    else:
        titles = ["Viral Short"]

    hashtag_str = " ".join([f"#{t.replace(' ', '')}" for t in tags[:6]])
    if "#shorts" not in hashtag_str.lower():
        hashtag_str = "#shorts " + hashtag_str

    full_description = f"{description}\n\nSubscribe for daily unbelievable stories!\n{hashtag_str}"
    
    pinned_comment = f"What would YOU have done in this situation? Drop your thoughts below! 👇"

    return {
        "titles": titles,
        "description": full_description,
        "tags": tags,
        "pinned_comment": pinned_comment
    }


def main():
    parser = argparse.ArgumentParser(description="CTR Booster for YouTube Shorts")
    parser.add_argument("project", type=str, help="Path to project directory")
    args = parser.parse_args()

    p = Path(args.project)
    if not p.is_absolute():
        p = WORKSPACE / p

    print(f"\n========================================================")
    print(f"🚀 CTR OPTIMIZER: {p.name.upper()}")
    print(f"========================================================")

    covers = extract_cover_frames(p)
    if covers:
        print(f"\n[✓] Extracted {len(covers)} candidate cover frames in: {covers[0].parent.relative_to(WORKSPACE)}")
        for c in covers:
            print(f"    - {c.name}")

    meta = generate_metadata_pack(p)
    print(f"\n🎯 3 High-CTR Title Options:")
    for i, t in enumerate(meta["titles"], 1):
        print(f"   Option {i}: {t}")

    print(f"\n📝 Optimized YouTube Description:")
    print("--------------------------------------------------------")
    print(meta["description"])
    print("--------------------------------------------------------")

    print(f"\n💬 High-Engagement Pinned Comment:")
    print(f"   \"{meta['pinned_comment']}\"")


if __name__ == "__main__":
    main()
