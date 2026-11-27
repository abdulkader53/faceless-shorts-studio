"""YouTube Content Studio - Local Platform Bridge Server.
Zero-dependency HTTP server that connects the Creator Operations Platform frontend
to the underlying Python, Node.js, and FFmpeg video production pipeline.
Serves static UI files and provides REST API endpoints for GUI operation.
"""
import http.server
import json
import os
import re
import socketserver
import subprocess
import sys
import threading
import time
import urllib.parse
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent
PYTHON_EXE = WORKSPACE / ".faceless-shorts" / "venv" / "Scripts" / "python.exe"
if not PYTHON_EXE.exists():
    PYTHON_EXE = Path(sys.executable)

FFMPEG_EXE = WORKSPACE / "bin" / "ffmpeg.exe"
PORT = 3000

# Background task registry for real-time log streaming
TASKS = {}
TASK_LOCK = threading.Lock()


def run_pipeline_task(task_id: str, cmd_args: list, cwd: Path = WORKSPACE, env_extra: dict = None):
    """Run CLI pipeline process in background and stream output to task log."""
    env = os.environ.copy()
    env["PATH"] = str(WORKSPACE / "bin") + os.pathsep + env.get("PATH", "")
    env["FACELESS_HOME"] = str(WORKSPACE / ".faceless-shorts")
    if env_extra:
        env.update(env_extra)

    with TASK_LOCK:
        TASKS[task_id] = {
            "id": task_id,
            "status": "RUNNING",
            "logs": [],
            "start_time": time.time(),
            "exit_code": None
        }

    def _worker():
        try:
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
                line_str = line.rstrip()
                with TASK_LOCK:
                    TASKS[task_id]["logs"].append(line_str)
                    if len(TASKS[task_id]["logs"]) > 500:
                        TASKS[task_id]["logs"].pop(0)

            p.wait()
            with TASK_LOCK:
                TASKS[task_id]["exit_code"] = p.returncode
                TASKS[task_id]["status"] = "COMPLETED" if p.returncode == 0 else "FAILED"
        except Exception as e:
            with TASK_LOCK:
                TASKS[task_id]["logs"].append(f"ERROR: {str(e)}")
                TASKS[task_id]["exit_code"] = 1
                TASKS[task_id]["status"] = "FAILED"

    t = threading.Thread(target=_worker, daemon=True)
    t.start()


def check_exact_and_semantic_duplicates(new_title: str, existing_topics: list):
    """Analyze new title against existing bank for exact and semantic duplication."""
    norm_new = re.sub(r'[^a-z0-9 ]+', '', new_title.lower()).strip()
    words_new = set(norm_new.split())
    
    # Meaningless stop words to discard for semantic overlap
    stop_words = {'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'why', 'how', 'what', 'who', 'this', 'is', 'was', 'were', 'that'}
    meaningful_new = words_new - stop_words

    exact_matches = []
    semantic_matches = []

    for item in existing_topics:
        exist_title = item.get("title", "")
        norm_exist = re.sub(r'[^a-z0-9 ]+', '', exist_title.lower()).strip()
        
        # 1. Exact match
        if norm_new == norm_exist:
            exact_matches.append(item)
            continue
            
        # 2. Semantic overlap
        words_exist = set(norm_exist.split())
        meaningful_exist = words_exist - stop_words
        if not meaningful_new or not meaningful_exist:
            continue
            
        shared = meaningful_new.intersection(meaningful_exist)
        ratio = len(shared) / max(len(meaningful_new), len(meaningful_exist))
        
        if ratio >= 0.30 or len(shared) >= 2:
            semantic_matches.append({
                "topic": item,
                "shared_keywords": list(shared),
                "similarity_score": round(ratio * 100, 1),
                "explanation": f"Shares {len(shared)} key subjects: {', '.join(sorted(shared))}"
            })

    return {
        "is_exact_duplicate": len(exact_matches) > 0,
        "exact_matches": exact_matches,
        "is_semantic_duplicate": len(semantic_matches) > 0,
        "semantic_matches": semantic_matches
    }


class RangeFileWrapper:
    """Wrapper around open file object to serve exact byte range for video seeking."""
    def __init__(self, f, length):
        self.f = f
        self.remaining = length

    def read(self, size=-1):
        if self.remaining <= 0:
            return b''
        if size < 0 or size > self.remaining:
            size = self.remaining
        data = self.f.read(size)
        self.remaining -= len(data)
        return data

    def close(self):
        self.f.close()


class ContentStudioRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler serving the UI and handling JSON API endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE), **kwargs)

    def send_head(self):
        url = urllib.parse.urlparse(self.path)
        if url.path.startswith('/api/'):
            return None

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        range_header = self.headers.get('Range')
        if not range_header or not os.path.exists(path):
            return super().send_head()

        try:
            size = os.path.getsize(path)
            ranges = range_header.replace('bytes=', '').strip().split('-')
            start = int(ranges[0]) if ranges[0] else 0
            end = int(ranges[1]) if len(ranges) > 1 and ranges[1] else size - 1
            if start >= size or end >= size:
                self.send_error(416, "Requested Range Not Satisfiable")
                return None

            length = end - start + 1
            self.send_response(206)
            ctype = self.guess_type(path)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.send_header('Content-Length', str(length))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()

            f = open(path, 'rb')
            f.seek(start)
            return RangeFileWrapper(f, length)
        except Exception:
            return super().send_head()

    def end_headers(self):
        # Enable CORS for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        # Root defaults to content_studio_app.html
        if path == "/" or path == "/index.html":
            self.path = "/content_studio_app.html"
            return super().do_GET()

        # API ROUTES
        if path == "/api/status":
            kokoro_ok = (WORKSPACE / ".faceless-shorts" / "kokoro" / "kokoro-v1.0.onnx").exists()
            whisper_ok = True
            ffmpeg_ok = FFMPEG_EXE.exists()
            self.send_json({
                "status": "HEALTHY",
                "python": str(PYTHON_EXE),
                "ffmpeg": str(FFMPEG_EXE) if ffmpeg_ok else "MISSING",
                "kokoro": "READY" if kokoro_ok else "MISSING",
                "whisper": "READY" if whisper_ok else "MISSING",
                "workspace": str(WORKSPACE),
                "version": "1.0.0"
            })
            return

        if path == "/api/schedule":
            schedule_file = WORKSPACE / "schedule.json"
            if schedule_file.exists():
                try:
                    data = json.loads(schedule_file.read_text(encoding="utf-8"))
                    self.send_json(data)
                    return
                except Exception:
                    pass
            # Fallback to empty list
            self.send_json([])
            return

        if path == "/api/topics":
            topics_file = WORKSPACE / "topics.json"
            if topics_file.exists():
                try:
                    data = json.loads(topics_file.read_text(encoding="utf-8"))
                    self.send_json(data)
                    return
                except Exception:
                    pass
            self.send_json([])
            return

        if path == "/api/task-status":
            params = urllib.parse.parse_qs(url.query)
            task_id = params.get("taskId", [""])[0]
            with TASK_LOCK:
                task = TASKS.get(task_id)
                if task:
                    self.send_json(task)
                else:
                    self.send_json({"error": "Task not found"}, status=404)
            return

        if path == "/api/project-inspect":
            params = urllib.parse.parse_qs(url.query)
            rel_path = params.get("path", [""])[0]
            proj_dir = WORKSPACE / rel_path
            if not proj_dir.exists():
                self.send_json({"exists": False}, status=404)
                return

            has_script = (proj_dir / "script.json").exists()
            has_voice = (proj_dir / "data" / "narration.wav").exists()
            has_words = (proj_dir / "data" / "words.json").exists()
            has_cues = (proj_dir / "data" / "cues.json").exists()
            has_mix = (proj_dir / "data" / "mix.wav").exists()
            renders = list((proj_dir / "renders").glob("*.mp4")) if (proj_dir / "renders").exists() else []
            covers = list((proj_dir / "review" / "covers").glob("*.jpg")) if (proj_dir / "review" / "covers").exists() else []

            self.send_json({
                "exists": True,
                "path": rel_path,
                "has_script": has_script,
                "has_voice": has_voice,
                "has_words": has_words,
                "has_cues": has_cues,
                "has_mix": has_mix,
                "video_rendered": len(renders) > 0,
                "video_path": str(renders[0].relative_to(WORKSPACE)) if renders else None,
                "covers": [str(c.relative_to(WORKSPACE)) for c in covers]
            })
            return

        if path == "/api/project-script":
            params = urllib.parse.parse_qs(url.query)
            rel_path = params.get("path", [""])[0]
            script_file = WORKSPACE / rel_path / "script.json"
            if script_file.exists():
                try:
                    data = json.loads(script_file.read_text(encoding="utf-8"))
                    self.send_json(data)
                    return
                except Exception as e:
                    self.send_json({"error": str(e)}, status=500)
                    return
            self.send_json({"error": "script.json not found"}, status=404)
            return

        # Default static file serving
        return super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
        data = {}
        try:
            data = json.loads(body)
        except Exception:
            pass

        if path == "/api/schedule":
            schedule_file = WORKSPACE / "schedule.json"
            schedule_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
            self.send_json({"success": True, "count": len(data)})
            return

        if path == "/api/topics":
            topics_file = WORKSPACE / "topics.json"
            topics_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
            self.send_json({"success": True, "count": len(data)})
            return

        if path == "/api/topics/check-duplicates":
            new_title = data.get("title", "")
            topics_file = WORKSPACE / "topics.json"
            existing = []
            if topics_file.exists():
                try:
                    existing = json.loads(topics_file.read_text(encoding="utf-8"))
                except Exception:
                    pass
            results = check_exact_and_semantic_duplicates(new_title, existing)
            self.send_json(results)
            return

        if path == "/api/project-script":
            proj_rel = data.get("project_path", "")
            script_payload = data.get("script", {})
            if not proj_rel or not script_payload:
                self.send_json({"error": "Missing project_path or script payload"}, status=400)
                return

            proj_dir = WORKSPACE / proj_rel
            if not proj_dir.exists():
                self.send_json({"error": "Project directory not found"}, status=404)
                return

            script_file = proj_dir / "script.json"
            script_file.write_text(json.dumps(script_payload, indent=2), encoding="utf-8")

            # Sync title in schedule.json if present
            schedule_file = WORKSPACE / "schedule.json"
            if schedule_file.exists():
                try:
                    sched = json.loads(schedule_file.read_text(encoding="utf-8"))
                    for s in sched:
                        if s.get("projectPath") == proj_rel:
                            if "title" in script_payload:
                                s["title"] = script_payload["title"]
                            break
                    schedule_file.write_text(json.dumps(sched, indent=2), encoding="utf-8")
                except Exception:
                    pass

            self.send_json({"success": True, "message": "Script updated successfully"})
            return

        # PIPELINE EXECUTION ENDPOINTS
        if path == "/api/pipeline/create-project":
            script_key = data.get("script_key", "")
            task_id = f"create_{script_key}_{int(time.time())}"
            cmd = [str(PYTHON_EXE), str(WORKSPACE / "tools" / "script_architect.py"), "--create", script_key]
            run_pipeline_task(task_id, cmd)
            self.send_json({"taskId": task_id, "status": "STARTED"})
            return

        if path == "/api/pipeline/generate-voice":
            proj_rel = data.get("project_path", "")
            proj_dir = WORKSPACE / proj_rel
            task_id = f"voice_{int(time.time())}"
            cmd = [str(PYTHON_EXE), str(WORKSPACE / "faceless-shorts" / "scripts" / "voice.py"), str(proj_dir)]
            run_pipeline_task(task_id, cmd)
            self.send_json({"taskId": task_id, "status": "STARTED"})
            return

        if path == "/api/pipeline/generate-words":
            proj_rel = data.get("project_path", "")
            proj_dir = WORKSPACE / proj_rel
            task_id = f"words_{int(time.time())}"
            cmd = [str(PYTHON_EXE), str(WORKSPACE / "faceless-shorts" / "scripts" / "words.py"), str(proj_dir)]
            run_pipeline_task(task_id, cmd)
            self.send_json({"taskId": task_id, "status": "STARTED"})
            return

        if path == "/api/pipeline/render-video":
            proj_rel = data.get("project_path", "")
            task_id = f"render_{int(time.time())}"
            cmd = [str(PYTHON_EXE), str(WORKSPACE / "tools" / "render_helper.py"), proj_rel]
            if data.get("draft"):
                cmd.append("--draft")
            run_pipeline_task(task_id, cmd)
            self.send_json({"taskId": task_id, "status": "STARTED"})
            return

        if path == "/api/pipeline/extract-covers":
            proj_rel = data.get("project_path", "")
            task_id = f"covers_{int(time.time())}"
            cmd = [str(PYTHON_EXE), str(WORKSPACE / "tools" / "ctr_booster.py"), proj_rel]
            run_pipeline_task(task_id, cmd)
            self.send_json({"taskId": task_id, "status": "STARTED"})
            return

        if path == "/api/pipeline/mine-trends":
            niche = data.get("niche", "all")
            task_id = f"mine_{int(time.time())}"
            cmd = [str(PYTHON_EXE), str(WORKSPACE / "tools" / "trend_miner.py"), "--niche", niche, "--save"]
            run_pipeline_task(task_id, cmd)
            self.send_json({"taskId": task_id, "status": "STARTED"})
            return

        self.send_json({"error": "Endpoint not found"}, status=404)


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def start_server(port=PORT):
    server = ThreadedHTTPServer(('127.0.0.1', port), ContentStudioRequestHandler)
    print(f"Content Studio Platform Bridge running at http://127.0.0.1:{port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    start_server(PORT)
