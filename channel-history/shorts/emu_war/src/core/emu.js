// THE EMU WAR kit (Tall Tale 3D): everything the story needs that the base kit doesn't have.
//   drawEmu(g, st)            one emu, flat 2D cartoon (side view facing right, 512 x 512 box, feet at y 495)
//   new Emu({ height })       a 3D cut-out emu with real shadow: .set(st) .face(cam) .at(x,y,z) .dir = ±1
//   new Flock(scene, n)       n cheap running / grazing emus sharing a few pre-drawn frames: .place(i, x, y, z, opts)
//   farm(E, { sunset })       dry outback wheat farm: golden ground, hills, trees, wheat that can be trampled
//   truck()                   army truck facing +x with a mounted Lewis gun and a muzzle flash
//   PROPS.gun                 a Lewis gun for a Toon's hands
import * as THREE from 'three';
import { INK } from './toon.js';
import * as WD from './world.js';

const TAU = Math.PI * 2;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a, b, k) => a + (b - a) * k;

// ───────────────────────── the emu drawing ─────────────────────────
// st = { phase (run cycle, radians), run 0..1, mood: neutral|smug|angry|shock|happy|sly, look -1..1, blink 0..1, down 0..1 (head to the
//        ground, eating), beak 0..1 (open), hat: null|'slouch'|'helmet', medal, bob (px), lean (rad), tint }
export function drawEmu(g, st = {}) {
  const S = { phase: 0, run: 0, mood: 'neutral', look: 0, blink: 0, down: 0, beak: 0, hat: null, medal: 0, bob: 0, lean: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const run = S.run, bob = (run ? -Math.abs(Math.sin(S.phase)) * 16 * run : 0) + S.bob;
  const FEATHER = '#8A7458', FEATHER_D = '#5E4C3A', FEATHER_L = '#A58C6B', NECK = '#A9C2CF', LEG = '#D7BF98';
  const hip = [236, 330 + bob];

  // legs (two segments, the visible "knee" bends backward like a real bird)
  const leg = (side) => {
    const p = S.phase + (side > 0 ? Math.PI : 0), sw = run ? Math.sin(p) * (28 + 62 * run) : side * 16;
    const lift = run ? Math.max(0, -Math.cos(p)) * 62 * run : 0;
    const fx = hip[0] + sw, fy = 494 - lift;
    const ax = hip[0] + sw * 0.35 - 22 - lift * 0.18, ay = mix(hip[1], fy, 0.52);
    g.strokeStyle = INK; g.lineWidth = 25; g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(ax, ay); g.lineTo(fx, fy - 6); g.stroke();
    g.strokeStyle = side > 0 ? LEG : '#BFA67E'; g.lineWidth = 12; g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(ax, ay); g.lineTo(fx, fy - 6); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 11; [[44, 0], [34, -14], [30, 12]].forEach(([dx, dy]) => { g.beginPath(); g.moveTo(fx, fy - 6); g.lineTo(fx + dx, fy - 6 + dy * 0.5 + (dy > 0 ? 4 : 0)); g.stroke(); });
  };
  leg(-1); leg(1);

  // body: a fluffy blob (tufts first, then the body shape covers the inner lines)
  const cx = 232, cy = 254 + bob;
  g.save(); g.translate(cx, cy); g.rotate(-S.lean - run * 0.1); g.translate(-cx, -cy);
  const tuft = (x, y, r, col) => { g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); };
  for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU; const back = Math.cos(a) < -0.5 ? 1 : 0; const rr = back ? 40 : 28 + rnd(i) * 7; tuft(cx + Math.cos(a) * (142 - rr * 0.35 - back * 8), cy + Math.sin(a) * (98 - rr * 0.35), rr, a > 0.2 && a < 2.9 ? FEATHER_D : FEATHER); }
  [[-150, -30, 44], [-160, 6, 40], [-146, 40, 38], [-132, -64, 36]].forEach(([dx, dy, r]) => tuft(cx + dx, cy + dy, r, FEATHER_D));
  const gr = g.createLinearGradient(0, cy - 100, 0, cy + 100); gr.addColorStop(0, FEATHER_L); gr.addColorStop(0.55, FEATHER); gr.addColorStop(1, FEATHER_D);
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, 138, 94, 0, 0, TAU); g.fill();
  g.strokeStyle = FEATHER_D; g.lineWidth = 6; g.globalAlpha = 0.6;
  for (let i = 0; i < 11; i++) { const x = cx - 110 + (i % 6) * 40 + rnd(i) * 14, y = cy - 50 + Math.floor(i / 6) * 55 + rnd(i * 3) * 18; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y + 18, x + 4, y + 36); g.stroke(); }
  g.globalAlpha = 1; g.restore();

  // neck + head
  const hx = mix(372 + run * 24, 408, S.down), hy = mix(84 + run * 34 + bob * 0.6, 436, S.down);
  const nx = 300, ny = 234 + bob;
  const neckPath = () => { g.beginPath(); g.moveTo(nx, ny); g.bezierCurveTo(nx + 36 - S.down * 20, ny - 70 + S.down * 40, hx - 56 + S.down * 10, hy + 100 - S.down * 40, hx - 6, hy + 16); };
  g.strokeStyle = INK; g.lineWidth = 50; neckPath(); g.stroke();
  g.strokeStyle = NECK; g.lineWidth = 34; neckPath(); g.stroke();
  g.strokeStyle = '#8BA8B8'; g.lineWidth = 3; g.globalAlpha = 0.6; for (let i = 0; i < 6; i++) { const t = 0.15 + i * 0.14; const x = mix(nx, hx - 6, t) + 10, y = mix(ny, hy + 16, t); g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 2, y + 10); g.stroke(); } g.globalAlpha = 1;
  if (S.medal) { const t = 0.34, x = mix(nx, hx - 6, t) + 6, y = mix(ny, hy + 16, t) + 18; g.fillStyle = '#D8343F'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 24, y - 26); g.lineTo(x + 22, y - 2); g.lineTo(x + 8, y + 10); g.lineTo(x - 30, y - 10); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#F2C230'; g.beginPath(); g.arc(x, y + 22, 18, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#B8862F'; g.font = '900 20px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1', x, y + 23); }

  g.save(); g.translate(hx, hy); g.rotate(S.down * 0.7 + run * 0.12);
  // head feathers
  g.strokeStyle = INK; g.lineWidth = 8; [[-18, -18, -34, -44], [-6, -22, -14, -52], [8, -20, 6, -48]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 - 6, (b + d) / 2, c, d); g.stroke(); });
  g.strokeStyle = FEATHER_D; g.lineWidth = 3.5; [[-18, -18, -34, -44], [-6, -22, -14, -52], [8, -20, 6, -48]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 - 6, (b + d) / 2, c, d); g.stroke(); });
  // beak (lower part drops when open)
  const open = S.beak * 15;
  g.fillStyle = '#4A413A'; g.strokeStyle = INK; g.lineWidth = 7;
  g.beginPath(); g.moveTo(18, -12); g.quadraticCurveTo(52, -14, 78, 4 + open * 0.3); g.lineTo(26, 6); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(24, 6); g.lineTo(70, 6 + open * 0.5 + 4); g.quadraticCurveTo(48, 20 + open, 20, 16 + open * 0.4); g.closePath(); g.fillStyle = '#6A5C50'; g.fill(); g.stroke();
  if (S.beak > 0.3) { g.fillStyle = '#C8283A'; g.beginPath(); g.ellipse(46, 10 + open * 0.45, 18, 4 + open * 0.2, 0, 0, TAU); g.fill(); }
  // head
  g.fillStyle = '#BCD0DA'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 0, 34, 25, 0, 0, TAU); g.fill(); g.stroke();
  // eye
  const ex = 10, ey = -5, er = S.mood === 'shock' ? 17 : 14;
  g.fillStyle = '#FFFDF4'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#F2A23A'; g.beginPath(); g.arc(ex + S.look * 4, ey, S.mood === 'shock' ? 8 : 10, 0, TAU); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(ex + S.look * 5, ey, S.mood === 'shock' ? 3.5 : 5.5, 0, TAU); g.fill();
  g.fillStyle = '#FFF'; g.beginPath(); g.arc(ex + S.look * 5 - 2, ey - 3, 2, 0, TAU); g.fill();
  const lid = S.blink > 0.5 ? 1 : (S.mood === 'smug' || S.mood === 'sly' ? 0.52 : S.mood === 'happy' ? 0.3 : 0);
  if (lid > 0) { g.fillStyle = '#BCD0DA'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.rect(ex - er - 2, ey - er - 2, er * 2 + 4, (er * 2 + 4) * lid * 0.5 + 2); g.fill(); g.beginPath(); g.moveTo(ex - er - 2, ey - er + (er * 2) * lid * 0.5 + 1); g.lineTo(ex + er + 2, ey - er + (er * 2) * lid * 0.5 + 1); g.stroke(); g.save(); g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.clip(); g.restore(); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(ex, ey, er + 1, 0, TAU); g.stroke(); }
  if (S.mood === 'angry') { g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(ex - 18, ey - 22); g.lineTo(ex + 20, ey - 8); g.stroke(); }
  if (S.mood === 'shock') { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(ex - 14, ey - 26); g.lineTo(ex + 10, ey - 30); g.stroke(); }
  if (S.mood === 'smug') { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(ex - 16, ey - 20); g.lineTo(ex + 16, ey - 17); g.stroke(); }
  // hats
  if (S.hat === 'slouch') {
    g.fillStyle = '#A99B5B'; g.strokeStyle = INK; g.lineWidth = 8;
    g.beginPath(); g.ellipse(-2, -22, 56, 13, -0.14, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-30, -26); g.quadraticCurveTo(-30, -66, 0, -66); g.quadraticCurveTo(30, -66, 32, -28); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#6C5A2E'; g.fillRect(-30, -36, 62, 9);
  } else if (S.hat === 'helmet') {
    g.fillStyle = '#6C7A55'; g.strokeStyle = INK; g.lineWidth = 8;
    g.beginPath(); g.ellipse(0, -18, 48, 12, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-34, -20); g.quadraticCurveTo(-34, -62, 0, -62); g.quadraticCurveTo(34, -62, 34, -20); g.closePath(); g.fill(); g.stroke();
  }
  g.restore();

  // plaster / dust tint overlay (used for "taking bullets")
  if (S.tint) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = S.tint; g.fillRect(0, 0, 512, 512); g.globalCompositeOperation = 'source-over'; }
  g.restore();
}

// ───────────────────────── the 3D cut-out emu ─────────────────────────
let _blob = null;
function blobTex() {
  if (_blob) return _blob;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(30,20,10,0.7)'); gr.addColorStop(0.6, 'rgba(30,20,10,0.25)'); gr.addColorStop(1, 'rgba(30,20,10,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); _blob = new THREE.CanvasTexture(c); return _blob;
}
const planeFor = (S) => { const geo = new THREE.PlaneGeometry(S, S); geo.translate(0, S / 2 - S * (17 / 512), 0); return geo; };

export class Emu {
  /** height = metres from the ground to the top of the head (≈1.9) */
  constructor({ height = 1.9, res = 1.5, castShadow = true } = {}) {
    this.res = res; this.dir = 1;
    this.canvas = document.createElement('canvas'); this.canvas.width = this.canvas.height = Math.round(512 * res);
    this.g = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    const S = height / 0.9; this.S = S;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false });
    this.mesh = new THREE.Mesh(planeFor(S), this.mat); this.mesh.castShadow = castShadow;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(S * 0.55, S * 0.2), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.55 }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.01;
    this.group = new THREE.Group(); this.pivot = new THREE.Group(); this.pivot.add(this.mesh); this.group.add(this.pivot, this.blob);
    this.key = ''; this.set({});
  }
  set(st = {}) {
    const key = JSON.stringify(st, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
    if (key === this.key) return this; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.canvas.width, this.canvas.height); g.scale(this.res, this.res); drawEmu(g, st);
    this.tex.needsUpdate = true; return this;
  }
  /** turn to the camera; `dir` (+1 = looks right on screen, -1 = looks left) flips the drawing */
  face(cam) { const p = new THREE.Vector3(); this.group.getWorldPosition(p); this.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - this.group.rotation.y; this.mesh.scale.x = this.dir; return this; }
  at(x, y, z) { this.group.position.set(x, y, z); return this; }
}

// ───────────────────────── a flock: many emus, a few shared frames ─────────────────────────
let FR = null;
function frames() {
  if (FR) return FR;
  FR = { run: [], stand: [], graze: [], march: [] };
  const make = (draw, tint) => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.scale(0.5, 0.5); drawEmu(g, draw);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2;
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false, color: tint });
  };
  [['#FFFFFF', '#E9DCC8'], ['#F2E4D0', '#FFF7EA']].forEach(([a], v) => {
    const tint = ['#FFFFFF', '#E6D6C0'][v];
    for (let k = 0; k < 8; k++) FR.run[v * 8 + k] = make({ phase: (k / 8) * TAU, run: 1 }, tint);
    for (let k = 0; k < 2; k++) FR.stand[v * 2 + k] = make({ bob: k * 4, look: 0.3 }, tint);
    for (let k = 0; k < 2; k++) FR.graze[v * 2 + k] = make({ down: 1, beak: k, bob: k * 3 }, tint);
    for (let k = 0; k < 8; k++) FR.march[v * 8 + k] = make({ phase: (k / 8) * TAU, run: 0.42, mood: 'smug', hat: 'helmet', bob: 0 }, tint);
  });
  return FR;
}
export class Flock {
  constructor(scene, n, { height = 1.9 } = {}) {
    const F = frames(); this.F = F; this.items = []; this.group = new THREE.Group(); scene.add(this.group);
    const S = height / 0.9, geo = planeFor(S), bgeo = new THREE.PlaneGeometry(S * 0.55, S * 0.2), bmat = new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.5 });
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(geo, F.run[0]); const blob = new THREE.Mesh(bgeo, bmat); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.012;
      const grp = new THREE.Group(); const pivot = new THREE.Group(); pivot.add(mesh); grp.add(pivot, blob); this.group.add(grp);
      this.items.push({ grp, pivot, mesh, blob, v: i % 2, dir: 1, s: 1 });
    }
  }
  /** kind: 'run' | 'stand' | 'graze'; frame = integer (run: 0-7, others 0-1); s = scale */
  place(i, x, y, z, { dir = 1, kind = 'run', frame = 0, s = 1, vis = true } = {}) {
    const it = this.items[i]; if (!it) return; it.grp.visible = vis; if (!vis) return;
    it.grp.position.set(x, y, z); it.dir = dir; it.mesh.scale.set(dir * s, s, 1); it.blob.scale.set(s, s, s);
    const n = kind === 'run' || kind === 'march' ? 8 : 2; it.mesh.material = this.F[kind][it.v * n + (((frame % n) + n) % n)];
  }
  face(cam) { this.items.forEach((it) => { if (!it.grp.visible) return; const p = it.grp.position; it.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z); }); return this; }
  hideAll() { this.items.forEach((it) => (it.grp.visible = false)); }
}

// ───────────────────────── the outback farm ─────────────────────────
const SHADE = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
export function farm(E, { sunset = false, wheatN = 9000 } = {}) {
  const scene = new THREE.Scene();
  WD.sky(scene, sunset ? { top: '#5B4FA8', horizon: '#FF9E6E', ground: '#FF9E6E' } : { top: '#2F86DE', horizon: '#F4E6C2', ground: '#F4E6C2' });
  const sun = WD.sunlight(scene, E, sunset ? { col: '#FFB27A', i: 2.6, pos: [-14, 5, -18], sky: '#C9A6E0', ground: '#7A5A3A', hemi: 1.0, box: 16, target: [0, 0, -4] } : { col: '#FFEBC4', i: 2.9, pos: [8, 13, 7], box: 16, target: [0, 0, -4] });
  Object.assign(sun.key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); sun.key.shadow.camera.far = 70; sun.key.shadow.camera.updateProjectionMatrix();
  WD.clouds(scene, [[-30, 22, -90, 14], [25, 30, -100, 18], [60, 18, -80, 11], [-5, 16, -60, 8]], sunset ? '#FFB8A0' : '#FFFFFF');
  const gcol = sunset ? '#C99A58' : '#D7B656';
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), WD.mat({ map: WD.T.grass(gcol, [60, 60]) })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(15, 40), WD.mat({ map: WD.T.dirt('#C58B52', [5, 5], false) })); dirt.rotation.x = -Math.PI / 2; dirt.position.set(0, 0.015, 6); dirt.receiveShadow = true; scene.add(dirt);
  WD.hills(scene, { z: -80, col: sunset ? '#A58A52' : '#B8A55A' });
  [[-9, -10], [11, -16], [-16, -22], [19, -26]].forEach(([x, z], i) => { const t = WD.tree(1.1 + rnd(i) * 0.4, sunset ? '#6E8A48' : '#8AA64A', 'round'); t.position.set(x, 0, z); scene.add(t); });
  // wheat: thin cones + ears, instanced, laid out in a big rectangle behind the dirt yard
  const stalkG = new THREE.ConeGeometry(0.014, 1, 4); stalkG.translate(0, 0.5, 0);
  const earG = new THREE.CapsuleGeometry(0.013, 0.1, 2, 5); earG.translate(0, 1.02, 0);
  const sMat = new THREE.MeshStandardMaterial({ color: '#E0B84A', roughness: 0.9 }), eMat = new THREE.MeshStandardMaterial({ color: '#F0C85A', roughness: 0.8 });
  const stalks = new THREE.InstancedMesh(stalkG, sMat, wheatN), ears = new THREE.InstancedMesh(earG, eMat, wheatN);
  const pos = []; for (let i = 0; i < wheatN; i++) pos.push([(rnd(i * 1.3) - 0.5) * 46, -2 - rnd(i * 2.9) * 36, rnd(i * 4.1) * 6.28, 0.85 + rnd(i * 7.7) * 0.35]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p3 = new THREE.Vector3();
  const colors = [new THREE.Color('#E3BE50'), new THREE.Color('#D4A93E'), new THREE.Color('#EFCF6A')];
  pos.forEach((_, i) => { stalks.setColorAt(i, colors[i % 3]); ears.setColorAt(i, colors[(i + 1) % 3]); });
  stalks.castShadow = false; ears.castShadow = false; scene.add(stalks, ears);
  let cutX = 1e9, lastCut = null, lastSway = null;
  /** wheat.update(t, { cut: [{ x0, x1, z0, z1 }...] }) : stalks inside a rect lie flat; the rest sway in the wind */
  const wheat = {
    stalks, ears, count: wheatN,
    update(t, rects = []) {
      const sig = rects.map((r) => [r.x0, r.x1, r.z0, r.z1].map((v) => v.toFixed(1)).join()).join('|') + '@' + (t * 6).toFixed(0);
      if (sig === lastSway) return; lastSway = sig;
      for (let i = 0; i < wheatN; i++) {
        const [x, z, ry, h] = pos[i]; let flat = 0;
        for (const r of rects) if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) { flat = 1; break; }
        const sway = Math.sin(t * 2.2 + x * 0.35 + z * 0.2) * 0.07;
        e.set(flat ? 1.35 + (rnd(i) - 0.5) * 0.5 : sway, ry, flat ? (rnd(i * 3) - 0.5) * 0.8 : sway * 0.6); q.setFromEuler(e);
        sc.set(1, flat ? 0.35 : h, 1); p3.set(x, flat ? 0.06 : 0, z); m4.compose(p3, q, sc); stalks.setMatrixAt(i, m4);
        sc.set(1, flat ? 0.35 : h, 1); ears.setMatrixAt(i, m4);
      }
      stalks.instanceMatrix.needsUpdate = true; ears.instanceMatrix.needsUpdate = true;
    },
  };
  wheat.update(0);
  return { scene, sun, wheat };
}

// ───────────────────────── props ─────────────────────────
export function lewisGun(s = 1) {
  const g = new THREE.Group(), steel = WD.mat({ color: '#3A3E44', roughness: 0.45, metalness: 0.5 }), wood = WD.mat({ color: '#7A4A2A' });
  const cyl = (r, h, m, x, y, z, rz = Math.PI / 2) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), m); c.rotation.z = rz; c.position.set(x, y, z); c.castShadow = true; g.add(c); return c; };
  cyl(0.05, 1.1, steel, 0.55, 0, 0); cyl(0.085, 0.65, steel, 0.4, 0, 0); cyl(0.035, 0.3, steel, 1.2, 0, 0);
  const pan = cyl(0.2, 0.08, steel, 0.25, 0.2, 0, 0); pan.rotation.x = Math.PI / 2; pan.rotation.z = 0;
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.07), wood); stock.position.set(-0.2, -0.04, 0); stock.castShadow = true; g.add(stock);
  [[-0.2, 0.25], [0.2, -0.25]].forEach(([x, rz]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 6), steel); l.position.set(0.55 + x * 0.6, -0.3, 0); l.rotation.z = rz * 1.2; g.add(l); });
  g.scale.setScalar(s); return g;
}
export function flashSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.translate(64, 64); g.fillStyle = '#FFE08A'; g.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, r = i % 2 ? 22 : 60; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
  g.fillStyle = '#FFF8D0'; g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.scale.set(0.9, 0.9, 1); m.visible = false; return m;
}
/** army truck facing +x: cab at the front (+x), open bed behind, gun on the bed. .update(dist) spins the wheels, .bounce(t) rattles the body */
export function truck() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const green = WD.mat({ color: '#6F7A45', roughness: 0.7 }), dark = WD.mat({ color: '#23252B', roughness: 0.8 }), tan = WD.mat({ color: '#A99B5B' });
  const box = (w, h, d, m, x, y, z, p = body) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; p.add(b); return b; };
  box(4.4, 0.35, 1.9, dark, 0, 0.62, 0);                                              // chassis
  box(1.5, 1.15, 1.8, green, 1.5, 1.35, 0); box(0.05, 0.55, 1.5, WD.mat({ color: '#9CC7E4', roughness: 0.1 }), 2.26, 1.55, 0); // cab + windscreen
  box(0.2, 0.7, 1.7, green, 2.3, 0.95, 0); box(0.08, 0.3, 1.2, dark, 2.38, 0.9, 0);          // bonnet front + grille
  box(2.6, 0.12, 1.8, green, -0.85, 0.85, 0);                                          // bed floor
  [-0.9, 0.9].forEach((z) => box(2.6, 0.6, 0.1, green, -0.85, 1.2, z)); box(0.1, 0.6, 1.8, green, -2.15, 1.2, 0);   // bed sides
  box(0.1, 0.8, 1.8, green, 0.5, 1.3, 0);
  g.wheels = [];
  [1.55, -1.45].forEach((x) => [-1, 1].forEach((s) => {
    const wg = new THREE.Group(); wg.position.set(x, 0.45, s * 0.98); g.add(wg);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.32, 20), dark); w.rotation.x = Math.PI / 2; w.castShadow = true; wg.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 12), tan); hub.rotation.x = Math.PI / 2; wg.add(hub);
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.36), tan); lug.position.set(0.32, 0, 0); wg.add(lug);    // makes the spin visible
    g.wheels.push(wg);
  }));
  const gun = lewisGun(1.1); gun.position.set(-0.4, 1.55, 0); body.add(gun); g.gun = gun;
  const flash = flashSprite(); flash.position.set(1.35, 0, 0); gun.add(flash); g.flash = flash;
  const crateM = WD.mat({ color: '#8A6A3A', map: WD.T.planks('#9A7442', [0.5, 0.5]) });
  [[-1.6, 1.35, -0.45], [-1.6, 1.35, 0.45], [-1.6, 1.9, 0]].forEach(([x, y, z]) => { const c = box(0.8, 0.5, 0.8, crateM, x, y - 0.12, z); });
  g.body = body; g.rot = 0;
  g.update = (dist) => { g.wheels.forEach((w) => (w.rotation.z = -dist / 0.46)); };
  g.bounce = (t, a = 0.05) => { body.position.y = Math.abs(Math.sin(t * 17)) * a; body.rotation.z = Math.sin(t * 11) * a * 0.5; };
  return g;
}

/** a Lewis gun held by a Toon (draws toward the right; use `flip: true` on the Toon to aim left) */
export const PROPS = {
  gun: (g, x, y) => {
    g.save(); g.translate(x - 20, y - 30); g.strokeStyle = INK; g.lineWidth = 7;
    g.fillStyle = '#4A4F57'; g.beginPath(); g.roundRect(-10, -16, 230, 30, 8); g.fill(); g.stroke();
    g.fillStyle = '#6A707A'; g.beginPath(); g.roundRect(30, -24, 100, 46, 10); g.fill(); g.stroke();
    g.fillStyle = '#2E3238'; g.beginPath(); g.roundRect(210, -10, 70, 18, 6); g.fill(); g.stroke();
    g.fillStyle = '#7A5A3A'; g.beginPath(); g.roundRect(-70, -12, 70, 26, 8); g.fill(); g.stroke();
    g.fillStyle = '#3A3E44'; g.beginPath(); g.arc(70, -42, 36, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#6A707A'; g.beginPath(); g.arc(70, -42, 20, 0, TAU); g.fill();
    g.restore();
  },
};
