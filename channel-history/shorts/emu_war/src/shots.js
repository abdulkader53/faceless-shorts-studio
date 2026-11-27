// THE ARMY THAT LOST A WAR TO BIRDS (the 1932 Emu War): the shot list (Tall Tale 3D).
// A shot: { id, at, note, draw(lt, d, t, blit) }: pose the cut-out people, move the camera, E.render(...), blit(), then any 2D overlay.
// Times come from the voice: cut(i) = just before line i, Wd('word', i) = when that word is said.
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as PR from './core/props.js';
import { Toon, PROPS } from './core/toon.js';
import { Emu, Flock, farm, truck, PROPS as EP } from './core/emu.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.1) < 0.12 ? 1 : 0);
const TAU = Math.PI * 2, INKC = '#1F1C33';
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// the cast (original characters, Tall Tale recipe)
const LOOK = {
  farmerA: { body: '#C9A06A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'boater', hatCol: '#E8C77A', band: '#B5372E', extra: ['mustache'] },
  farmerB: { body: '#8FB36A', pattern: 'check', patCol: '#6E8F4A', hat: 'cap', hatCol: '#7A4A2E', extra: ['freckles'] },
  soldier: { body: '#8C8B52', hat: 'cap', hatCol: '#6E7040', neck: 'collar', neckCol: '#5E5A30' },
  soldier2: { body: '#8C8B52', hat: 'beanie', hatCol: '#6E7040', neck: 'collar', neckCol: '#5E5A30', extra: ['freckles'] },
  major: { body: '#7E7D4A', hat: 'visor', hatCol: '#4E5430', neck: 'tie', neckCol: '#5A2A22', pattern: 'vest', patCol: '#5E5E36', extra: ['mustache', 'monocle'] },
  minister: { body: '#4A4560', hat: 'tophat', hatCol: '#2A2638', neck: 'bowtie', neckCol: '#D8343F', dots: 1, pattern: 'vest', patCol: '#2A2638', extra: ['monocle', 'mustache'] },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

// ── 2D overlay helpers ────────────────────────────────────────────────
function txt(s, x, y, size, fill = '#fff', { stroke = INKC, lw = 12, rot = 0, sc = 1, weight = 900, align = 'center' } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.font = `${weight} ${size}px Inter`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(s, 0, 0); }
  ctx.fillStyle = fill; ctx.fillText(s, 0, 0); ctx.restore();
}
function pill(x, y, w, h, fill, stroke, lw = 6) { ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, Math.min(h * 0.3, 36)); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
/** a HUD counter card that pops in */
function badge(label, value, x, y, p, col = '#F2C230', big = 92, w = 640) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); const s = eob(clamp(p)); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -80 + 10, w, 170, 30); ctx.fill();
  pill(0, 5, w, 170, 'rgba(24,20,44,0.94)', col, 7);
  txt(label, 0, -47, 34, col, { stroke: null, weight: 800 }); txt(value, 0, 20, big, '#FFFFFF', { lw: 14 }); ctx.restore();
}
/** a comic burst ("BANG!") */
function burst(text, x, y, p, { col = '#FFD43B', tcol = '#D8343F', rot = -0.1, r = 170, size = 96 } = {}) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = eob(clamp(p * 1.5)) * (p < 1 ? 1 + 0.06 * Math.sin(p * 30) : 1); ctx.scale(s, s);
  ctx.beginPath(); for (let i = 0; i < 22; i++) { const a = (i / 22) * TAU, rr = i % 2 ? r * 0.68 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.78); } ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INKC; ctx.stroke(); txt(text, 0, 4, size, tcol, { lw: 14 }); ctx.restore();
}
/** a red ink stamp (WRONG. / APPROVED) */
function stampMark(l1, l2, x, y, p, col = '#C8283A', rot = -0.14) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = lerp(2.6, 1, eo(clamp(p))); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, p * 2);
  const h = l2 ? 210 : 140; ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.beginPath(); ctx.roundRect(-330, -h / 2, 660, h, 24); ctx.stroke();
  txt(l1, 0, l2 ? -46 : 4, l2 ? 96 : 112, col, { stroke: null }); if (l2) txt(l2, 0, 52, 96, col, { stroke: null }); ctx.restore();
}
function speedLines(t, n = 14, alpha = 0.5) {
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const y = 260 + rnd(i * 3.1) * 1100, len = 160 + rnd(i * 7.7) * 340, x = ((t * 2600 * (0.7 + rnd(i))) + rnd(i * 5.3) * 1300) % 1500 - 200; ctx.globalAlpha = alpha * (0.4 + rnd(i * 9) * 0.6); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len, y); ctx.stroke(); }
  ctx.restore();
}
const shakeBlit = (blit, a, t) => { if (a <= 0) return blit(); ctx.save(); ctx.translate(540, 960); ctx.scale(1.045, 1.045); ctx.translate(-540 + Math.sin(t * 91) * a, -960 + Math.cos(t * 77) * a); blit(); ctx.restore(); };
const flash = (a, col = '255,244,200') => { if (a <= 0) return; ctx.fillStyle = `rgba(${col},${clamp(a)})`; ctx.fillRect(0, 0, 1080, 1920); };
const HERD = Array.from({ length: 90 }, (_, i) => [(rnd(i * 1.7) - 0.5) * 2, (rnd(i * 2.3 + 5) - 0.5) * 2, rnd(i * 4.9)]);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { field: { bloom: 0.22, aperture: 0.0009, maxblur: 0.006 }, close: { bloom: 0.2, aperture: 0.002, maxblur: 0.01 }, room: { bloom: 0.3, aperture: 0.001, maxblur: 0.008 }, dusk: { bloom: 0.38, aperture: 0.001, maxblur: 0.007, warm: 0.05 } };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at) });
  };
  const runF = (t, i) => Math.floor(t * 16 + i * 3);
  const idleF = (t, i) => Math.floor(t * 2.2 + i * 1.3);

  // ── set 1: the outback wheat farm (day) ───────────────────────────────
  const FM = farm(E, { wheatN: 8500 });
  const house = PR.house({ wall: '#EBD9B2', roof: '#9A4A32', door: '#3C6FB6' }); house.position.set(-13, 0, -2); house.rotation.y = 0.55; FM.scene.add(house);
  { const f = WD.fence(14); f.position.set(-9, 0, 6.5); FM.scene.add(f); }
  const sign = WD.signBoard('SOLDIER SETTLEMENT', { w: 3.6, h: 0.8, bg: '#6E4A2A', fg: '#F2E6CF' }); sign.position.set(4.6, 2.5, 1.4); FM.scene.add(sign);
  [-1.6, 1.6].forEach((dx) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 8), WD.mat({ color: '#6E4E36' })); p.position.set(4.6 + dx, 1.3, 1.36); p.castShadow = true; FM.scene.add(p); });
  const FMF = new Flock(FM.scene, 80);
  const eH = new Emu({ height: 1.9, res: 1.6 }); FM.scene.add(eH.group);
  const fA = person('farmerA'), fB = person('farmerB'), sA = person('soldier'), sB = person('soldier2'), sC = person('soldier'), mj = person('major');
  const fmToons = [fA, fB, sA, sB, sC, mj]; fmToons.forEach((p) => FM.scene.add(p.group));
  const TK = truck(); FM.scene.add(TK);
  const fmPeople = [eH, FMF, ...fmToons];
  const fmReset = () => { fmToons.forEach((p) => (p.group.visible = false)); FMF.hideAll(); TK.visible = false; eH.group.visible = false; TK.flash.visible = false; };
  const wreck = (t) => (t < cut(5) ? [] : [{ x0: -40, x1: 40, z0: -45, z1: lerp(-24, -4, eo(seg(t, cut(5), cut(6) + 0.3))) }]);
  const idleHerd = (F, n, t, o) => { for (let i = 0; i < n; i++) { const h = HERD[i]; F.place(i, o.cx + h[0] * o.w, 0, o.cz + h[1] * o.d, { dir: h[2] > 0.5 ? o.dir : -o.dir, kind: o.kind || 'stand', frame: idleF(t, i) }); } };
  const runHerd = (F, n, t, o) => { for (let i = 0; i < n; i++) { const h = HERD[i]; F.place(i, o.cx + h[0] * o.w + (h[2] - 0.5) * (o.spread || 0) * (t - (o.t0 || 0)), 0, o.cz + h[1] * o.d, { dir: o.dir, kind: 'run', frame: runF(t, i), s: o.s || 1 }); } };

  // ── set 2: the same farm at sunset (the ending) ──────────────────────
  const FS = farm(E, { sunset: true, wheatN: 2500 });
  const FSF = new Flock(FS.scene, 40);
  const eS = new Emu({ height: 1.9, res: 1.6 }); FS.scene.add(eS.group);
  const mj2 = person('major'), s2a = person('soldier'), s2b = person('soldier2'); [mj2, s2a, s2b].forEach((p) => FS.scene.add(p.group));
  const TK2 = truck(); FS.scene.add(TK2);
  const fsPeople = [eS, FSF, mj2, s2a, s2b];
  const fsReset = () => { [mj2, s2a, s2b].forEach((p) => (p.group.visible = false)); FSF.hideAll(); TK2.visible = false; eS.group.visible = false; TK2.flash.visible = false; };

  // ── set 3: the Minister's office ────────────────────────────────────
  const OF = WD.interior(E, { w: 7, depth: 6, wall: '#2E4E8A', motif: '#3A5E9C', ceiling: '#2A2638', floor: '#7A3E24', signText: null, counterOn: false, litter: false, picture: false });
  const dk = PR.desk(2.4); dk.position.set(0.4, 0, -3.2); OF.scene.add(dk);
  { const fl = WD.signBoard('DEPARTMENT OF DEFENCE', { w: 3.2, h: 0.5, bg: '#2A2638', fg: '#E2B33C' }); fl.position.set(0, 3.55, -5.88); OF.scene.add(fl);
    const map = PR.poster(['WHEAT', 'BELT', '!EMU', 'PROBLEM'], { w: 1.3, h: 1.7 }); map.position.set(-2.5, 2.1, -5.87); OF.scene.add(map); }
  const oMin = person('minister'), oA = person('farmerA'), oB = person('farmerB'); [oMin, oA, oB].forEach((p) => OF.scene.add(p.group));
  oMin.at(0.4, 0, -3.95); const ofPeople = [oMin, oA, oB];

  // ═══════════════════ the shots ═══════════════════
  // ── 1 · HOOK: "In 1932, the Australian army went to war against twenty thousand emus." ──
  { const st = cut(0), wTw = Wd('twenty', 0), wEm = Wd('emus', 0), wWar = Wd('war', 0);
    add({ id: 'S01', at: st, note: 'HOOK: extreme close-up of a smug emu staring; pull back to reveal the army facing the whole flock; 20,000 counter', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, []);
      eH.group.visible = true; eH.at(0.35, 0, -0.3); eH.dir = -1; eH.set({ mood: lt > 3.2 ? 'smug' : 'neutral', look: -0.5, blink: blink(t, 0.4), beak: 0 });
      [sA, sB, sC].forEach((s, i) => { s.group.visible = true; s.at(-3.7 + i * 1.15, 0, 1.0 - i * 0.4); s.set({ mood: i === 1 ? 'shock' : 'worried', armR: [75, 70], holdR: EP.gun, v: 'gun', sweat: i === 1 ? 1 : 0, blink: blink(t, i) }); });
      mj.group.visible = true; mj.at(-4.7, 0, 1.6); mj.set({ mood: 'proud', armR: [140, 20], armL: [10, 10], blink: blink(t) });
      idleHerd(FMF, 54, t, { cx: 3.0, cz: -2.0, w: 2.7, d: 5.0, dir: -1 });
      const k = eio(seg(lt, 0.85, 5.2));
      shoot(FM.scene, fmPeople, V3(-0.05, 1.72, 0.62), V3(0.3, 3.0, 15.5), V3(-0.14, 1.69, -0.3), V3(0.0, 1.1, -1.5), k, { ...LK.close, aperture: lerp(0.0035, 0.0009, k), fov: lerp(36, 47, k) }, null);
      shakeBlit(blit, 0, t);
      const p1 = clamp((t - 0.12) / 0.2); if (p1 > 0 && lt < 1.4) { ctx.save(); ctx.globalAlpha = clamp((1.4 - lt) / 0.25); txt('1932', 540, 560, 230, '#FFD43B', { lw: 24, rot: -0.05, sc: lerp(2.2, 1, eo(p1)) }); ctx.restore(); }
      badge('EMUS', fmt(20000 * eo(seg(t, wTw, wEm + 0.15))), 540, 230, clamp((t - wTw + 0.05) / 0.2), '#F2C230', 100, 600);
    } });
    cue(st + 0.9, 'whoosh', { gain: 0.8 }); cue(wTw, 'ding', { gain: 0.8 }); cue(wEm, 'boing', { gain: 0.7 }); cue(wWar, 'thud', { gain: 0.6 }); }

  // ── 2 · "And the emus won." (smug emu in a captured army hat, medal) ──
  { const st = cut(1), wWon = Wd('won', 1);
    add({ id: 'S02', at: st, note: 'low-angle push-in on the victorious emu: army hat, medal on "won"', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, []);
      eH.group.visible = true; eH.at(0.5, 0, 0); eH.dir = -1; const won = t > wWon;
      eH.set({ mood: 'smug', hat: 'slouch', medal: won ? 1 : 0, beak: won ? 1 : 0, look: -0.3, blink: blink(t, 0.7) });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-1.9, 0.55, 3.6), V3(-0.9, 0.9, 2.1), V3(0.3, 1.45, 0), V3(0.2, 1.5, 0), k, { ...LK.close, bloom: 0.3 });
      blit(); if (won) flash(1 - clamp((t - wWon) / 0.25), '255,230,140'); if (won) burst('WON!', 800, 560, clamp((t - wWon) / 0.3), { r: 190, size: 110 });
    } });
    cue(st, 'whoosh'); cue(wWon, 'stamp', { gain: 0.9 }); cue(wWon + 0.05, 'sparkle', { gain: 0.7 }); }

  // ── 3 · "See, after World War One," (the outback; farmland handed to veterans) ──
  { const st = cut(2), wW = Wd('World', 2);
    add({ id: 'S03', at: st, note: 'crane down from the sky onto the settlement; AFTER WORLD WAR I banner', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, []);
      fA.group.visible = fB.group.visible = true; fA.at(-1.5, 0, 2.6); fB.at(1.5, 0, 2.6);
      fA.set({ mood: 'proud', armR: [150 + Math.sin(t * 7) * 12, 10], blink: blink(t) }); fB.set({ mood: 'happy', armL: [150 + Math.sin(t * 7 + 1) * 12, 10], blink: blink(t, 1) });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(11, 13, 19), V3(3.2, 2.4, 9.2), V3(-2, 1.0, 0), V3(0, 1.5, 1.5), k, LK.field);
      blit(); const p = clamp((t - wW + 0.1) / 0.3); if (p > 0) { ctx.save(); ctx.translate(540, 300); ctx.rotate(-0.04); const s = eob(p); ctx.scale(s, s); pill(0, 0, 860, 120, '#2E4E8A', '#F2E6CF', 8); txt('AFTER WORLD WAR I', 0, 4, 66, '#F2E6CF', { stroke: null }); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.7 }); cue(wW, 'pop', { gain: 0.8 }); }

  // ── 3b · "Australia gave farmland to war veterans," (handshake, deed) ──
  { const st = Wd('Australia', 2) - 0.12, wF = Wd('farmland', 2), wV = Wd('veterans', 2);
    add({ id: 'S03b', at: st, note: 'two veterans shake on it, the deed in hand, SOLDIER SETTLEMENT sign behind', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, []);
      fA.group.visible = fB.group.visible = true; fA.at(-0.55, 0, 2.2); fB.at(0.55, 0, 2.2);
      const sh = Math.sin(t * 14) * 8;
      fA.set({ mood: 'happy', armR: [40 + sh * 0.3, -50 + sh], holdL: PROPS.paper('DEED'), armL: [60, -80], v: 'deed', blink: blink(t) }); fB.set({ mood: 'laugh', armL: [40 - sh * 0.3, -50 - sh], armR: [30, 10], blink: blink(t, 1.2) });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-2.6, 1.55, 6.4), V3(1.2, 1.7, 5.2), V3(0.4, 1.7, 2.2), V3(1.5, 2.0, 1.6), k, LK.field);
      blit(); badge('GOVERNMENT GIFT', 'FREE FARMLAND', 540, 250, clamp((t - wF + 0.1) / 0.25), '#7FD08A', 70, 760);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wF, 'ding', { gain: 0.7 }); cue(wV + 0.1, 'sparkle', { gain: 0.5 }); }

  // ── 4 · "who started growing wheat." ──
  { const st = cut(3), wW = Wd('wheat', 3);
    add({ id: 'S04', at: st, note: 'low dolly through the swaying wheat to a happy farmer', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, []);
      fA.group.visible = true; fA.at(0.5, 0, -10.5); fA.set({ mood: 'proud', armL: [150, 10], armR: [30, 10], bob: Math.sin(t * 5) * 3, blink: blink(t) });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-1.8, 1.45, -3.2), V3(0.6, 1.6, -7.0), V3(0.5, 1.5, -10.5), V3(0.5, 1.7, -11), k, { ...LK.field, aperture: 0.0012 });
      blit(); burst('WHEAT!', 790, 600, clamp((t - wW) / 0.3), { col: '#F2C230', tcol: '#6E4A2A', r: 180, size: 96 });
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wW, 'pop', { gain: 0.9 }); }

  // ── 5 · "Then twenty thousand hungry emus showed up," ──
  { const st = cut(4), wTw = Wd('twenty', 4), wEm = Wd('emus', 4), wUp = Wd('up', 4);
    add({ id: 'S05', at: st, note: 'the flock pours across the horizon; the farmer in the foreground goes pale; 20,000 counter', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, []);
      fA.group.visible = true; fA.at(-1.9, 0, 0.6); fA.set({ mood: t > wTw ? 'shock' : 'neutral', sweat: t > wTw ? 1 : 0, look: [0.5, 0], blink: blink(t, 2) });
      const k = eio(clamp(lt / d)), cx = lerp(34, -14, clamp(lt / (d + 0.4)));
      runHerd(FMF, 78, t, { cx, cz: -10, w: 11, d: 9, dir: -1, spread: 0 });
      shoot(FM.scene, fmPeople, V3(-3.6, 1.35, 4.4), V3(-1.4, 1.5, 2.8), V3(1.0, 1.6, -7), V3(-1.5, 1.4, -8), k, { ...LK.field, aperture: 0.0006 });
      blit(); badge('HUNGRY EMUS', fmt(20000 * eo(seg(t, wTw - 0.05, wEm + 0.25))), 540, 230, clamp((t - wTw + 0.1) / 0.2), '#F2C230', 100, 640);
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(st + 0.1, 'chug', { dur: L(5) - st, gain: 0.7 }); cue(wTw, 'ding', { gain: 0.8 }); }

  // ── 6 · "and destroyed the crops." (the field gets flattened) ──
  { const st = cut(5), wD = Wd('destroyed', 5);
    add({ id: 'S06', at: st, note: 'emus munch and stomp the wheat flat while the farmer weeps', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      fA.group.visible = true; fA.at(-2.2, 0, 1.0); fA.set({ mood: 'sad', tears: 1, armL: [20, 40], armR: [20, 40], look: [0.6, 0], blink: blink(t) });
      for (let i = 0; i < 26; i++) { const h = HERD[i]; FMF.place(i, -9 + h[0] * 12 + (i % 3) * 0.2, 0, -6 + h[1] * 7, { dir: h[2] > 0.5 ? 1 : -1, kind: 'graze', frame: Math.floor(t * 4 + i) }); }
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-4.8, 1.5, 5.0), V3(-1.2, 1.2, 2.6), V3(0, 1.0, -7), V3(-2, 0.9, -5), k, LK.field);
      blit(); burst('CRUNCH!', 810, 560, clamp((t - wD) / 0.3), { col: '#F28C4A', tcol: '#fff', rot: 0.08, r: 190, size: 92 });
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wD, 'thud', { gain: 0.8 }); cue(wD + 0.25, 'thud', { gain: 0.6 }); cue(wD + 0.5, 'thud', { gain: 0.6 }); }

  // ── 7 · "The farmers had fought in the war," (the farmers storm the minister's office) ──
  const wAsk = Wd('asked', 6), wGuns = Wd('guns', 6);
  { const st = cut(6);
    add({ id: 'S07', at: st, note: "the veterans march into the Minister's office with a petition", draw(lt, d, t, blit) {
      oMin.at(0.4, 0, -3.95); oA.at(-0.55, 0, -2.3); oB.at(1.3, 0, -2.1); oA.group.visible = oB.group.visible = true;
      oMin.set({ mood: 'worried', sweat: 1, armL: [20, 30], armR: [20, 30], blink: blink(t) });
      oA.set({ mood: 'angry', armR: [150, 10], holdL: PROPS.paper('PETITION'), armL: [70, -70], v: 'pet', legs: lt < 0.5 ? 'walk' : 'stand', phase: t * 8 }); oB.set({ mood: 'angry', armR: [150, 10], armL: [30, 10], legs: lt < 0.5 ? 'walk' : 'stand', phase: t * 8 + 1 });
      const k = eio(clamp(lt / d));
      shoot(OF.scene, ofPeople, V3(0.2, 1.7, 2.6), V3(0.4, 1.65, 1.5), V3(0.4, 1.4, -3.4), null, k, { ...LK.room, fov: 40 });
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(st + 0.3, 'thud', { gain: 0.5 }); }

  // ── 7b · "so they asked for machine guns." ──
  { const st = wAsk - 0.2;
    add({ id: 'S07b', at: st, note: 'the Minister grins and slams APPROVED on the guns request', draw(lt, d, t, blit) {
      oMin.at(0.4, 0, -3.95); oA.group.visible = oB.group.visible = false;
      const hit = clamp((t - wGuns) / 0.2), up = eo(seg(lt, 0, wGuns - st - 0.2));
      oMin.set({ mood: t > wGuns ? 'proud' : 'sly', armR: [lerp(40, 140, up) - hit * 100, -20], holdR: PROPS.rubberStamp, armL: [20, 10], v: 'rs', blink: blink(t) });
      const k = eio(clamp(lt / d));
      shoot(OF.scene, ofPeople, V3(0.7, 1.7, 0.4), V3(0.5, 1.65, -0.5), V3(0.4, 1.45, -4), null, k, LK.room);
      blit(); oA.group.visible = oB.group.visible = true;
      badge('REQUEST', 'MACHINE GUNS?', 540, 250, clamp((t - wAsk + 0.05) / 0.2), '#E2B33C', 70, 800);
      stampMark('APPROVED', null, 540, 700, clamp((t - wGuns - 0.1) / 0.18), '#2E9E55', -0.12);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wGuns + 0.1, 'stamp', { gain: 1 }); cue(wGuns + 0.13, 'slam', { gain: 0.7 }); }

  // ── 8 · "And the army came," (the truck rolls in) ──
  { const st = cut(7), wTwo = Wd('two', 7);
    add({ id: 'S08', at: st, note: 'the army truck rolls in with soldiers in the back, wheels spinning', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      TK.visible = true; const x = lerp(-17, -1.5, eo(clamp(lt / (wTwo - st + 0.3)))); TK.position.set(x, 0, 3.0); TK.update(x); TK.bounce(t, 0.035);
      sA.group.visible = sB.group.visible = true; sA.at(x - 0.4, 0.95, 3.0); sB.at(x - 1.5, 0.95, 3.4);
      sA.set({ mood: 'proud', armR: [80, 30], armL: [30, 10], blink: blink(t), bob: Math.abs(Math.sin(t * 17)) * 3 }); sB.set({ mood: 'happy', armL: [150 + Math.sin(t * 8) * 10, 10], blink: blink(t, 1), bob: Math.abs(Math.sin(t * 17 + 1)) * 3 });
      const k = clamp(lt / d);
      shoot(FM.scene, fmPeople, V3(x + 4, 1.5, 8.2), V3(x + 6.5, 1.8, 7.4), V3(x + 0.8, 1.4, 3), V3(x + 2.4, 1.3, 3), eio(k), LK.field);
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(st + 0.05, 'chug', { dur: wTwo - st, gain: 0.9 }); }

  // ── 8b · "with two guns and ten thousand bullets." ──
  { const st = Wd('two', 7) - 0.15, wTwo = Wd('two', 7), wTen = Wd('ten', 7), wBul = Wd('bullets', 7);
    add({ id: 'S08b', at: st, note: 'orbit the truck bed: the Lewis gun and crates of ammo; GUNS 2 / BULLETS 10,000 counters', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      TK.visible = true; TK.position.set(0, 0, 3.0); TK.update(0); TK.bounce(t, 0.01);
      sA.group.visible = true; sA.at(-1.5, 0.95, 3.0); sA.set({ mood: 'proud', armR: [70, 20], armL: [70, 20], blink: blink(t) });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(4.6, 3.0, 9.4), V3(-0.8, 2.8, 9.0), V3(-0.4, 1.6, 3.0), V3(-0.9, 1.6, 3.0), k, { ...LK.field, aperture: 0.0007, fov: 42 });
      blit(); badge('MACHINE GUNS', '2', 300, 230, clamp((t - wTwo + 0.05) / 0.2), '#F2C230', 92, 480);
      badge('BULLETS', fmt(10000 * eo(seg(t, wTen - 0.05, wBul + 0.1))), 760, 230, clamp((t - wTen + 0.05) / 0.2), '#E8734A', 92, 560);
    } });
    cue(wTwo, 'ding', { gain: 0.7 }); cue(wTen, 'ding', { gain: 0.7 }); cue(wBul, 'slam', { gain: 0.5 }); }

  // ── 9 · "Easy mission, right?" ──
  { const st = cut(8), wR = Wd('right', 8);
    add({ id: 'S09', at: st, note: 'the Major, smug, thumbs-up, wink', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      mj.group.visible = true; mj.at(0, 0, 2.0); mj.set({ mood: 'smug', armR: [150, 0], armL: [30, -90], talk: talk(t, t < wR + 0.3), blink: blink(t, 0.5), look: [0.3, 0] });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(0.5, 1.7, 4.6), V3(0.1, 1.62, 3.5), V3(0, 1.62, 2.0), null, k, { ...LK.close, aperture: 0.0016 });
      blit();
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wR, 'ding', { gain: 0.8 }); }

  // ── 10 · "Wrong." ──
  { const st = cut(9), wW = Wd('wrong', 9);
    add({ id: 'S10', at: st, note: 'smash cut: the emu stares down the lens; WRONG. stamp', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      eH.group.visible = true; eH.at(0.35, 0, -0.3); eH.dir = -1; eH.set({ mood: 'sly', look: -0.5, beak: 0, blink: blink(t, 2.5) });
      const k = eo(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-0.35, 1.72, 0.85), V3(-0.2, 1.7, 0.6), V3(-0.14, 1.69, -0.3), null, k, { ...LK.close, aperture: 0.0035 });
      shakeBlit(blit, Math.max(0, 14 - lt * 40), t); stampMark('WRONG.', null, 540, 640, clamp((t - wW - 0.05) / 0.15));
    } });
    cue(st, 'slam', { gain: 0.9 }); cue(wW + 0.08, 'stamp', { gain: 1 }); }

  // ── 11 · "The emus split into tiny groups," (the herd bursts apart) ──
  { const st = cut(10), wSp = Wd('split', 10);
    add({ id: 'S11', at: st, note: 'high angle: one big herd explodes into small groups running in every direction', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      [sA, sB, sC].forEach((s, i) => { s.group.visible = true; s.at(-6.5 + i * 1.2, 0, -0.8 + i * 0.5); s.set({ mood: 'shock', armR: [75, 70], holdR: EP.gun, v: 'gun', look: [0.4, 0], blink: blink(t, i) }); });
      const go = Math.max(0, lt - 0.45 - (wSp - st - 0.45) * 0);
      for (let i = 0; i < 70; i++) { const h = HERD[i], g = i % 7, a = (g / 7) * TAU + 0.4, sp = 3.2 + (g % 3) * 0.7; const ax = Math.cos(a), az = Math.sin(a) * 0.7;
        FMF.place(i, 1 + h[0] * 1.8 + ax * sp * go, 0, -5 + h[1] * 1.6 + az * sp * go, { dir: ax >= 0 ? 1 : -1, kind: go > 0.05 ? 'run' : 'stand', frame: go > 0.05 ? runF(t, i) : idleF(t, i) }); }
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-1, 6.2, 13.2), V3(1.5, 8.4, 11), V3(0, 0.6, -4.5), V3(0.5, 0.4, -4.5), k, { ...LK.field, fov: 40 });
      blit(); burst('SCATTER!', 780, 330, clamp((t - wSp - 0.15) / 0.3), { col: '#9ED8F5', tcol: '#1F4E8A', r: 190, size: 84, rot: 0.08 });
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wSp, 'zip', { gain: 0.8 }); cue(wSp + 0.1, 'stampede', { dur: Le0(10) - wSp, gain: 0.8 }); }
  function Le0(i) { return L(i + 1); }

  // ── 12 · "and sprinted away faster than the army's truck." (side chase) ──
  { const st = cut(11), wF = Wd('faster', 11), wT = Wd('truck', 11);
    add({ id: 'S12', at: st, note: "side-on chase: the emus pull away from the army's truck, speed lines, bumpy ride", draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      const x = -4.2 + lt * 6.0; TK.visible = true; TK.position.set(x, 0, 2.4); TK.update(x * 1.0); TK.bounce(t, 0.07);
      sA.group.visible = sB.group.visible = true; sA.at(x - 0.4, 0.95, 2.4); sB.at(x - 1.6, 0.95, 2.8);
      sA.set({ mood: 'worried', armR: [80, 10], armL: [80, 10], sweat: 1, bob: Math.abs(Math.sin(t * 17)) * 5 }); sB.set({ mood: 'dizzy', armL: [150, 10], armR: [150, 10], bob: Math.abs(Math.sin(t * 17 + 1)) * 5 });
      for (let i = 0; i < 14; i++) { const h = HERD[i]; FMF.place(i, x + 3.6 + lt * 1.2 + h[0] * 1.3 + (i % 3) * 0.45, 0, 2.3 + h[1] * 2.2, { dir: 1, kind: 'run', frame: runF(t, i), s: 1 }); }
      const k = eio(clamp(lt / d)), cx = x + 2.2 + lt * 1.5;
      shoot(FM.scene, fmPeople, V3(cx, 2.0, 12.2), V3(cx + 0.6, 1.8, 11.4), V3(cx + 0.3, 1.4, 2.4), V3(cx + 1.0, 1.4, 2.4), k, { ...LK.field, fov: 56 });
      blit(); speedLines(t, 16, 0.55); burst('OUTRUN!', 800, 560, clamp((t - wF) / 0.3), { col: '#FFD43B', tcol: '#D8343F', r: 190, size: 84, rot: -0.1 });
    } });
    cue(st, 'whoosh', { gain: 0.6 }); cue(st + 0.1, 'chug', { dur: 2.4, gain: 0.8 }); cue(st + 0.1, 'stampede', { dur: 2.4, gain: 0.7 }); cue(wT, 'boing', { gain: 0.6 }); }

  // ── 13 · "The first machine gun jammed." ──
  { const st = cut(12), wJ = Wd('jammed', 12);
    add({ id: 'S13', at: st, note: 'gunner blasts away... then CLICK: the gun jams, smoke, sweat; the emu smirks behind him', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      TK.visible = true; TK.position.set(0, 0, 3.0); TK.update(0); TK.bounce(t, 0.0); const fire = lt > 0.15 && t < wJ - 0.15;
      TK.flash.visible = fire && Math.floor(t * 28) % 2 === 0; TK.flash.scale.setScalar(0.8 + rnd(Math.floor(t * 28)) * 0.7); TK.gun.position.x = -0.4 + (fire ? Math.sin(t * 70) * 0.04 : 0);
      sA.group.visible = true; sA.at(-1.05, 0.95, 3.0);
      sA.set({ mood: t > wJ ? 'shock' : 'angry', armR: [80, 20], armL: [80, 20], sweat: t > wJ ? 1 : 0, bob: fire ? Math.sin(t * 60) * 4 : 0, blink: 0 });
      eH.group.visible = true; eH.at(1.6, 0, -0.6); eH.dir = -1; eH.set({ mood: t > wJ ? 'smug' : 'neutral', beak: t > wJ ? 1 : 0, look: -0.6, blink: blink(t) });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(0.5, 2.3, 8.2), V3(0.1, 2.2, 7.0), V3(-0.65, 1.8, 3.0), V3(-0.55, 1.75, 2.2), k, { ...LK.field, fov: 46 });
      shakeBlit(blit, fire ? 7 : 0, t);
      if (fire) { burst(Math.floor(t * 9) % 2 ? 'RAT-A-TAT!' : 'BANG BANG!', 540, 520, 1, { col: '#FFD43B', tcol: '#D8343F', r: 230, size: 78, rot: Math.sin(t * 30) * 0.05 }); }
      stampMark('CLICK.', 'JAMMED!', 540, 540, clamp((t - wJ - 0.0) / 0.15), '#C8283A', -0.1);
    } });
    cue(st + 0.15, 'gun', { dur: wJ - st - 0.3, gain: 1 }); cue(wJ - 0.1, 'click', { gain: 1 }); cue(wJ + 0.4, 'boing', { gain: 0.6 }); }

  // ── 14 · "A month later, ten thousand bullets" (calendar flips; rounds counter) ──
  { const st = cut(13), wTen = Wd('ten', 13);
    add({ id: 'S14', at: st, note: 'the calendar flips; the truck blazes away at darting emus; ROUNDS FIRED climbs to ~10,000', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      TK.visible = true; TK.position.set(-5.5, 0, 3.0); TK.update(0); TK.bounce(t, 0.015); const fire = Math.floor(t * 9) % 3 !== 0;
      TK.flash.visible = fire && Math.floor(t * 26) % 2 === 0; sA.group.visible = true; sA.at(-5.9, 0.95, 2.7); sA.set({ mood: 'angry', armR: [80, 20], armL: [80, 20], bob: Math.sin(t * 60) * 3 });
      for (let i = 0; i < 30; i++) { const h = HERD[i]; const ph = (t * (0.5 + h[2] * 0.5) + h[2] * 4) % 4; FMF.place(i, -3 + ph * 4 + h[0] * 2, 0, -2 + h[1] * 6, { dir: 1, kind: 'run', frame: runF(t, i) }); }
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-1.5, 2.6, 9.5), V3(2.8, 2.0, 8.2), V3(-1, 1.4, 1.5), V3(1.5, 1.2, 0.5), k, LK.field);
      shakeBlit(blit, 4, t);
      const p = clamp((t - st) / 0.25); if (p > 0) { ctx.save(); ctx.translate(540, 240); ctx.rotate(-0.03 + Math.sin(t * 3) * 0.01); const s = eob(p); ctx.scale(s, s); pill(0, 0, 760, 150, '#F4EBD6', INKC, 8); txt('1 MONTH LATER', 0, 4, 78, '#B5372E', { stroke: null }); ctx.restore(); }
      badge('ROUNDS FIRED', fmt(9860 * eo(seg(t, wTen - 0.1, st + 2.4))), 540, 470, clamp((t - wTen + 0.1) / 0.2), '#E8734A', 100, 700);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.1, 'gun', { dur: 2.0, gain: 0.55 }); cue(wTen, 'ding', { gain: 0.7 }); }

  // ── 15 · "had taken down only about a thousand emus." (the sliver vs the flock) ──
  { const st = cut(14), wOnly = Wd('only', 14), wTh = Wd('thousand', 14);
    add({ id: 'S15', at: st, note: 'scoreboard: ~1,000 of 20,000 emus down (a tiny sliver) while the huge flock grazes on', draw(lt, d, t, blit) {
      fmReset(); FM.wheat.update(t, wreck(t));
      TK.visible = true; TK.position.set(-7.5, 0, 4.0); TK.update(0); TK.bounce(t, 0.0); sA.group.visible = true; sA.at(-7.9, 0.95, 3.7); sA.set({ mood: 'tired', armR: [20, 10], armL: [20, 10], sweat: 1, blink: blink(t) });
      idleHerd(FMF, 76, t, { cx: 3, cz: -4, w: 11, d: 8, dir: -1 });
      const k = eio(clamp(lt / d));
      shoot(FM.scene, fmPeople, V3(-1.5, 2.3, 10.5), V3(1.0, 2.0, 9.0), V3(0.5, 1.2, -2), V3(1.5, 1.2, -2), k, LK.field);
      blit();
      const p = clamp((t - wOnly + 0.1) / 0.25); if (p > 0) {
        ctx.save(); ctx.translate(540, 360); const s = eob(p); ctx.scale(s, s); pill(0, 0, 900, 330, 'rgba(24,20,44,0.94)', '#E8734A', 8);
        txt('EMUS TAKEN DOWN', 0, -110, 38, '#E8734A', { stroke: null, weight: 800 }); txt(fmt(1000 * eo(seg(t, wOnly, wTh + 0.3))).replace(/^/, '~'), 0, -30, 116, '#FFFFFF', { lw: 14 });
        ctx.fillStyle = '#3B3656'; ctx.beginPath(); ctx.roundRect(-380, 60, 760, 54, 20); ctx.fill(); ctx.fillStyle = '#E8734A'; ctx.beginPath(); ctx.roundRect(-380, 60, Math.max(20, 760 * 0.05 * eo(seg(t, wOnly, wTh + 0.3))), 54, 20); ctx.fill();
        txt('OUT OF 20,000', 0, 140, 40, '#F4EBD6', { stroke: null, weight: 800 }); ctx.restore();
      }
    } });
    cue(st, 'whoosh', { gain: 0.4 }); cue(wOnly, 'plop', { gain: 0.8 }); cue(wTh + 0.2, 'boing', { gain: 0.7 }); }

  // ── 16 · "So the army gave up, and went home." (sunset, the truck drives away) ──
  { const st = cut(15), wUp = Wd('up', 15);
    add({ id: 'S16', at: st, note: 'sunset: the beaten army trundles home while emus watch from the ridge', draw(lt, d, t, blit) {
      fsReset(); TK2.visible = true; const x = 2 - lt * 3.6; TK2.position.set(x, 0, 2.0); TK2.rotation.y = Math.PI; TK2.update(-x); TK2.bounce(t, 0.03);
      const lw = (lx, lz) => TK2.localToWorld(V3(lx, 0.95, lz));
      s2a.group.visible = s2b.group.visible = true; s2a.group.position.copy(lw(-0.4, 0.2)); s2b.group.position.copy(lw(-1.5, -0.3));
      s2a.set({ mood: 'sad', armR: [10, 20], armL: [10, 20], bob: Math.abs(Math.sin(t * 13)) * 2 }); s2b.set({ mood: 'tired', armR: [10, 20], armL: [10, 20], tears: 1 });
      for (let i = 0; i < 14; i++) { const h = HERD[i]; FSF.place(i, -9 + h[0] * 5 + (i % 5) * 0.4, 0, -5 + h[1] * 3.5, { dir: 1, kind: 'stand', frame: idleF(t, i) }); }
      eS.group.visible = true; eS.at(-3.8, 0, 0.2); eS.dir = 1; eS.set({ mood: 'smug', hat: 'slouch', beak: 1, look: 0.6, blink: blink(t) });
      const k = eio(clamp(lt / d));
      shoot(FS.scene, fsPeople, V3(7.5, 1.1, 8.2), V3(3.8, 1.5, 7.6), V3(-2.4, 1.3, 1.5), V3(-4, 1.4, 1.0), k, LK.dusk);
      blit();
    } });
    cue(st, 'slide', { dur: 1.6, gain: 0.5 }); cue(st + 0.1, 'chug', { dur: 2, gain: 0.5 }); cue(wUp, 'boing', { gain: 0.5 }); }

  // ── 17 · "Even the major admitted," (the Major, the quote) ──
  { const st = cut(16), wMaj = Wd('major', 16);
    add({ id: 'S17', at: st, note: 'the Major in the dusk, worn out, with the famous quote on screen', draw(lt, d, t, blit) {
      fsReset(); mj2.group.visible = true; mj2.at(0, 0, 0); mj2.set({ mood: 'tired', sweat: 1, talk: talk(t, t > wMaj), armR: [40, -70], armL: [20, 10], blink: blink(t, 0.4), lean: Math.sin(t * 2) * 1.5 });
      eS.group.visible = true; eS.at(2.4, 0, -1.2); eS.dir = -1; eS.set({ mood: 'smug', hat: 'slouch', look: -0.7, blink: blink(t, 1.5) });
      const k = eio(clamp(lt / d));
      shoot(FS.scene, fsPeople, V3(-0.9, 1.5, 4.4), V3(-0.3, 1.6, 3.5), V3(0.2, 1.55, 0), V3(0.9, 1.6, -0.2), k, { ...LK.dusk, aperture: 0.0015 });
      blit();
      const p = clamp((t - wMaj + 0.1) / 0.3); if (p > 0) { ctx.save(); ctx.translate(540, 300); const s = eob(p); ctx.scale(s, s);
        pill(0, 0, 900, 300, 'rgba(244,235,214,0.96)', INKC, 8); txt('“...the bullet-carrying', 0, -70, 58, INKC, { stroke: null, weight: 800 }); txt('capacity of these birds...”', 0, 0, 58, INKC, { stroke: null, weight: 800 });
        txt('MAJOR MEREDITH, 1932', 0, 92, 38, '#B5372E', { stroke: null, weight: 900 }); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.4 }); cue(wMaj + 0.1, 'pop', { gain: 0.7 }); }

  // ── 17b · "if his soldiers could take bullets like these birds," (bullets ping off the emu) ──
  { const st = Wd('if', 16) - 0.15, wB = Wd('bullets', 16), wBi = Wd('birds', 16);
    add({ id: 'S17b', at: st, note: 'bullets ping harmlessly off the unbothered emu; the soldier next to it shakes', draw(lt, d, t, blit) {
      fsReset(); eS.group.visible = true; eS.at(0.75, 0, 0); eS.dir = -1; eS.set({ mood: t > wBi ? 'smug' : 'neutral', hat: 'helmet', beak: 0, look: -0.4, blink: blink(t, 0.8) });
      s2a.group.visible = true; s2a.at(-0.95, 0, 0.5); s2a.set({ mood: 'shock', sweat: 1, armR: [30, 10], armL: [30, 10], bob: Math.sin(t * 50) * 3 });
      const k = eio(clamp(lt / d));
      shoot(FS.scene, fsPeople, V3(-1.6, 1.4, 7.2), V3(0.1, 1.55, 5.8), V3(0, 1.4, 0), V3(0.2, 1.5, 0), k, { ...LK.dusk, fov: 40 });
      shakeBlit(blit, t > wB ? Math.max(0, 6 - (t - wB) * 3) : 0, t);
      if (t > wB) for (let i = 0; i < 4; i++) { const ti = wB + 0.1 + i * 0.32, p = clamp((t - ti) / 0.28); if (p > 0 && p < 1) burst('PING!', 360 + (i % 2) * 400 + rnd(i) * 80, 600 + (i % 3) * 150, p, { col: '#E6F0FF', tcol: '#3A5E9C', r: 100, size: 52, rot: (i - 1.5) * 0.15 }); }
    } });
    cue(wB, 'ping', { gain: 0.8 }); cue(wB + 0.4, 'ping', { gain: 0.7 }); cue(wB + 0.75, 'ping', { gain: 0.8 }); cue(wBi, 'boing', { gain: 0.6 }); }

  // ── 18 · "they could take on any army on Earth." (the helmeted emu army marches) ──
  { const st = cut(17), wArmy = Wd('army', 17);
    add({ id: 'S18', at: st, note: 'an army of emus in helmets marches past in perfect step, low heroic angle', draw(lt, d, t, blit) {
      fsReset();
      const f = Math.floor(t * 7);
      for (let i = 0; i < 28; i++) { const row = i % 4, col = Math.floor(i / 4); FSF.place(i, -7.5 + col * 1.7 + lt * 2.6, 0, 1.2 - row * 1.7, { dir: 1, kind: 'march', frame: f + row, s: 1 }); }
      eS.group.visible = true; eS.at(-7.5 + 1.7 * 3 + lt * 2.6 + 0.9, 0, 3.0); eS.dir = 1; eS.set({ mood: 'proud', hat: 'helmet', medal: 1, run: 0.42, phase: f * (TAU / 8), beak: 1 });
      const k = eio(clamp(lt / d));
      shoot(FS.scene, fsPeople, V3(-1.2, 1.0, 11.5), V3(0.8, 1.3, 10.4), V3(0.3, 1.3, 0.8), V3(0.6, 1.3, 0.4), k, { ...LK.dusk, aperture: 0.0005, fov: 46 });
      blit(); const p = clamp((t - wArmy + 0.1) / 0.3); if (p > 0) { ctx.save(); ctx.translate(540, 300); ctx.rotate(-0.04); const s = eob(p); ctx.scale(s, s); pill(0, 0, 860, 130, '#4E5430', '#F2E6CF', 8); txt('THE EMU ARMY', 0, 4, 76, '#F2E6CF', { stroke: null }); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.1, 'fanfare', { gain: 0.7 }); cue(st + 0.1, 'stampede', { dur: 2.3, gain: 0.6 }); }

  // ── 19 · "Final score:" ──
  { const st = cut(18);
    add({ id: 'S19', at: st, note: 'FINAL SCORE board drops in over the proud emu', draw(lt, d, t, blit) {
      fsReset(); eS.group.visible = true; eS.at(0.4, 0, 0); eS.dir = -1; eS.set({ mood: 'smug', hat: 'slouch', medal: 1, beak: 0, look: -0.3, blink: blink(t) });
      const k = eio(clamp(lt / d));
      shoot(FS.scene, fsPeople, V3(-1.6, 0.7, 4.4), V3(-0.6, 1.0, 3.4), V3(0.2, 1.4, 0), null, k, { ...LK.dusk, aperture: 0.0012 });
      blit(); score(t, st, null, null);
    } });
    cue(st, 'slide', { dur: 0.7, gain: 0.6 }); cue(st + 0.15, 'thud', { gain: 0.8 }); }

  // ── 20 · "emus one, army zero." ──
  { const st = cut(19), wOne = Wd('one', 19), wZero = Wd('zero', 19);
    add({ id: 'S20', at: st, note: 'EMUS 1 / ARMY 0 slam in; confetti; follow call-to-action', draw(lt, d, t, blit) {
      fsReset(); eS.group.visible = true; eS.at(0.4, 0, 0); eS.dir = -1; const win = t > wOne; eS.set({ mood: 'smug', hat: 'slouch', medal: 1, beak: win ? 1 : 0, look: -0.3, blink: blink(t, 0.6), bob: win ? Math.abs(Math.sin(t * 11)) * -6 : 0 });
      const k = eio(clamp(lt / d));
      shoot(FS.scene, fsPeople, V3(-0.6, 1.0, 3.4), V3(0.3, 1.3, 4.7), V3(0.2, 1.4, 0), null, k, { ...LK.dusk, aperture: 0.001 });
      blit(); score(t, null, wOne, wZero);
      if (win) { for (let i = 0; i < 70; i++) { const a = clamp((t - wOne - rnd(i) * 0.2) / 2.2); if (a <= 0 || a >= 1) continue; const x = 140 + rnd(i * 3.3) * 800 + Math.sin(a * 9 + i) * 40, y = -40 + a * 1500 * (0.7 + rnd(i * 5) * 0.5); ctx.save(); ctx.translate(x, y); ctx.rotate(a * 12 + i); ctx.fillStyle = ['#F2C230', '#D8343F', '#3C6FB6', '#7FD08A', '#FFFFFF'][i % 5]; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); } }
      const pc = clamp((t - wZero - 0.5) / 0.4); if (pc > 0) { ctx.save(); ctx.translate(540, lerp(1780, 1650, eo(pc))); ctx.globalAlpha = pc; pill(0, 0, 900, 120, 'rgba(24,20,44,0.92)', '#F2C230', 6); txt('FOLLOW FOR MORE TRUE HISTORY', 0, 4, 44, '#F2C230', { stroke: null }); ctx.restore(); }
    } });
    cue(wOne, 'stamp', { gain: 1 }); cue(wOne + 0.03, 'slam', { gain: 0.8 }); cue(wOne + 0.05, 'fanfare', { gain: 0.9 }); cue(wZero, 'stamp', { gain: 0.9 }); cue(wZero + 0.03, 'thud', { gain: 0.8 }); cue(wOne + 0.1, 'sparkle', { gain: 0.8 }); }

  // the scoreboard (S19 drops it in, S20 fills in the numbers)
  function score(t, tIn, wOne, wZero) {
    const p = tIn != null ? clamp((t - tIn) / 0.4) : 1; if (p <= 0) return; const dropY = lerp(-300, 520, eob(p));
    ctx.save(); ctx.translate(540, dropY); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.roundRect(-440 + 10, -250 + 14, 880, 520, 36); ctx.fill();
    ctx.fillStyle = '#2B2540'; ctx.strokeStyle = '#F2C230'; ctx.lineWidth = 10; ctx.beginPath(); ctx.roundRect(-440, -250, 880, 520, 36); ctx.fill(); ctx.stroke();
    txt('FINAL SCORE', 0, -180, 84, '#F2C230', { stroke: null });
    const row = (y, label, col, val, tShow) => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(-380, y - 70, 760, 140, 24); ctx.fill(); txt(label, -330, y, 76, col, { stroke: null, align: 'left' });
      const q = tShow != null ? clamp((t - tShow) / 0.18) : 0; if (q > 0) txt(val, 280, y, 150, '#FFFFFF', { lw: 0, stroke: null, sc: lerp(2.4, 1, eo(q)) }); else txt('-', 280, y, 130, 'rgba(255,255,255,0.35)', { stroke: null }); };
    row(-40, 'EMUS', '#9EE0A0', '1', wOne); row(120, 'ARMY', '#E8734A', '0', wZero);
    ctx.restore();
  }

  return { shots: S, cues: CUES };
}
