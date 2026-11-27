// Parallel renderer: splits a project's film into N frame-exact chunks, runs one headless-Chrome capture per chunk at
// the same time, stitches the video streams losslessly, then muxes data/mix.wav once (so no audio seams).
//   node tools/render_parallel.mjs <project_dir> <out.mp4> [workers=3] [--draft] [start end]
// Needs data/mix.wav and data/cues.json (written by `capture.mjs cues`). ffmpeg is found in <workspace>/bin.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FFMPEG = path.join(WS, 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const FPS = +(process.env.FPS || 30);
const argv = process.argv.slice(2), draft = argv.includes('--draft');
const pos = argv.filter((a) => !a.startsWith('--'));
if (pos.length < 2) { console.log('usage: node tools/render_parallel.mjs <project_dir> <out.mp4> [workers=3] [--draft] [start end]'); process.exit(1); }
const proj = path.resolve(pos[0]), out = path.resolve(proj, pos[1]);
const workers = Math.max(1, +(pos[2] || 3));
const dur = JSON.parse(fs.readFileSync(path.join(proj, 'data/cues.json'), 'utf8')).duration;
const mix = path.join(proj, 'data/mix.wav');
const t0 = pos[3] ? +pos[3] : 0, t1 = pos[4] ? Math.min(+pos[4], dur) : dur;
const f0 = Math.round(t0 * FPS), f1 = Math.round(t1 * FPS), total = f1 - f0;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'par-render-'));
fs.mkdirSync(path.dirname(out), { recursive: true });

const per = Math.ceil(total / workers), chunks = [];
for (let i = 0; i < workers && f0 + i * per < f1; i++) chunks.push([f0 + i * per, Math.min(f1, f0 + (i + 1) * per)]);
console.log(`${total} frames, ${chunks.length} workers, ${draft ? 'draft' : 'final'} quality`);
const start = Date.now();
const run = (i, [a, b]) => new Promise((res, rej) => {
  const file = path.join(tmp, `c${i}.mp4`);
  // last chunk ends exactly at the film end so rounding can't drop a frame
  const end = b === f1 && t1 === dur ? dur : b / FPS;
  const p = spawn('node', ['tools/capture.mjs', 'video', file, (a / FPS).toFixed(6), end.toFixed(6), ...(draft ? ['--draft'] : [])], { cwd: proj, env: { ...process.env, PATH: path.join(WS, 'bin') + path.delimiter + process.env.PATH }, stdio: ['ignore', 'pipe', 'inherit'] });
  p.stdout.on('data', () => {});
  p.on('close', (c) => (c === 0 && fs.existsSync(file) ? res(file) : rej(new Error(`chunk ${i} failed (exit ${c})`))));
});
let files;
const cleanup = () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {} };
try { files = await Promise.all(chunks.map((c, i) => run(i, c))); } catch (e) { console.error(String(e) + '\n(likely out of memory: close other heavy programs, or use 1 worker / plain `capture.mjs video`)'); cleanup(); process.exit(1); }
fs.writeFileSync(path.join(tmp, 'list.txt'), files.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
const vid = path.join(tmp, 'video.mp4');
let r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-an', '-c:v', 'copy', vid], { stdio: 'inherit' });
if (r.status) process.exit(1);
const audio = fs.existsSync(mix) ? ['-ss', String(t0), '-t', String(t1 - t0), '-i', mix] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'];
r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-i', vid, ...audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
cleanup();
if (r.status) process.exit(1);
console.log(`${out} (${((Date.now() - start) / 1000).toFixed(0)} s)`);
