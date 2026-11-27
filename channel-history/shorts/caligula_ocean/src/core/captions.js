// Modern Documentary Subtitle Engine
// Renders clean, high-contrast, mobile-first typography in platform safe zones
// with frosted dark backing pills and golden keyword highlights.
import { ctx, clamp, lerp, seg, eob, TAU } from './lib.js';
import { T, lineWords } from './timing.js';

export const CAP_SAFE = {
  y: 1610,         // Cleanly above platform navigation and description overlay
  font: '800 68px Inter, sans-serif',
  maxW: 920,
  pillBg: 'rgba(10, 12, 16, 0.82)',
  textWhite: '#FFFFFF',
  textHighlight: '#F5C542', // Imperial Warm Gold
  border: 'rgba(255, 255, 255, 0.15)',
};

let caps = [];

function autoChunks(text) {
  const ws = text.toUpperCase().split(/\s+/).filter(Boolean), out = [];
  for (let i = 0; i < ws.length;) {
    const n = ws.length - i === 4 ? 2 : Math.min(3, ws.length - i);
    out.push(ws.slice(i, i + n));
    i += n;
  }
  return out.map((c) => {
    const k = c.reduce((b, w, j) => (w.replace(/[^A-Z]/g, '').length > c[b].replace(/[^A-Z]/g, '').length ? j : b), 0);
    return c.map((w, j) => (j === k ? '*' + w : w)).join(' ');
  });
}

export function buildCaptions(script) {
  caps = [];
  script.lines.forEach((ln, i) => {
    const chunks = (ln.caps ? ln.caps.split('|') : autoChunks(ln.text)).map((s) => s.trim()).filter(Boolean);
    const ws = lineWords(i);
    if (!ws.length) return;
    const counts = chunks.map((c) => c.split(/\s+/).length);
    const N = counts.reduce((a, b) => a + b, 0);
    const nm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']+/g, '');
    let acc = 0, from = 0;

    chunks.forEach((c, j) => {
      const first = nm(c.split(/\s+/)[0]);
      let idx = j === 0 ? 0 : ws.findIndex((w, k) => k > from && first && (nm(w.w) === first || (first.length > 2 && nm(w.w).startsWith(first))));
      if (idx < 0) idx = Math.max(from + (j ? 1 : 0), Math.min(ws.length - 1, Math.round(acc * ws.length / N)));
      acc += counts[j];
      from = idx;
      caps.push({
        line: i,
        s: ws[idx].s - 0.04,
        words: c.split(/\s+/).map((w) => ({ txt: w.replace('*', ''), hi: w.startsWith('*') }))
      });
    });
  });

  caps.forEach((c, k) => {
    const next = caps[k + 1];
    const lineEnd = T.lines[c.line].end;
    c.e = next ? (next.s - lineEnd > 0.7 && next.line !== c.line ? lineEnd + 0.35 : next.s) : T.dur;
  });
  return caps;
}

export const captionList = () => caps;

/**
 * Modern documentary pill caption
 */
export function drawCaption(t) {
  const c = caps.find((c) => t >= c.s && t < c.e);
  if (!c) return;

  const lt = t - c.s;
  // Subtle smooth spring entrance
  const pop = lt < 0.16 ? lerp(0.92, 1.0, eob(seg(lt, 0, 0.16))) : 1;

  ctx.save();
  ctx.translate(540, CAP_SAFE.y);
  ctx.scale(pop, pop);

  ctx.font = CAP_SAFE.font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const spacing = 22;
  const wordWidths = c.words.map((w) => ctx.measureText(w.txt).width);
  const totalTextW = wordWidths.reduce((a, b) => a + b, 0) + spacing * (c.words.length - 1);
  const fit = Math.min(1, CAP_SAFE.maxW / (totalTextW + 80));
  ctx.scale(fit, fit);

  const pillPadX = 36;
  const pillPadY = 22;
  const pillW = totalTextW + pillPadX * 2;
  const pillH = 92;

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;

  // Frosted dark pill background
  ctx.fillStyle = CAP_SAFE.pillBg;
  ctx.beginPath();
  ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 24);
  ctx.fill();

  // Subtle frosted rim border
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = CAP_SAFE.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Render words
  let startX = -totalTextW / 2;
  c.words.forEach((w, i) => {
    ctx.fillStyle = w.hi ? CAP_SAFE.textHighlight : CAP_SAFE.textWhite;
    // Slight text glow on highlighted word
    if (w.hi) {
      ctx.shadowColor = 'rgba(245, 197, 66, 0.4)';
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = 'transparent';
    }
    ctx.fillText(w.txt, startX, 2);
    startX += wordWidths[i] + spacing;
  });

  ctx.restore();
}
