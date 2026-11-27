// Cinematic Illustrated Documentary Engine (Core Compositor)
// Provides Ken Burns camera pushes, 2.5D parallax, atmospheric grain,
// dust/spray particles, museum callouts, and documentary typography.
import { ctx, W, H, TAU, lerp, clamp, rnd, eo, eio } from './lib.js';

export const DOC_THEME = {
  gold: '#D4AF37',
  goldBright: '#F3E5AB',
  crimson: '#8B1E1E',
  slateDark: '#12151B',
  slateLight: '#2C3539',
  ink: '#0D0F12',
  parchment: '#F5EBE6',
  white: '#FFFFFF',
  dimWhite: 'rgba(255,255,255,0.75)',
};

/** Image Asset Cache */
const IMAGE_CACHE = new Map();

export function loadImage(src) {
  if (IMAGE_CACHE.has(src)) return IMAGE_CACHE.get(src);
  const img = new Image();
  img.src = src;
  IMAGE_CACHE.set(src, img);
  return img;
}

/** Preload an array of image paths */
export async function preloadImages(srcArray) {
  const promises = srcArray.map((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { IMAGE_CACHE.set(src, img); resolve(img); };
      img.onerror = () => { console.warn(`Failed to load: ${src}`); resolve(null); };
      img.src = src;
    });
  });
  return Promise.all(promises);
}

/**
 * Draw a cinematic still with Ken Burns camera movement.
 * options: {
 *   src: string,
 *   mode: 'push_in' | 'pull_back' | 'pan_right' | 'pan_left' | 'static',
 *   focus: [xPercent, yPercent], // default [0.5, 0.5]
 *   zoomRange: [startScale, endScale],
 *   vignette: number (0..1),
 *   grain: number (0..1),
 *   fade: number (0..1),
 * }
 */
export function drawCinematicStill(src, lt, d, t, {
  mode = 'push_in',
  focus = [0.5, 0.5],
  zoomRange = [1.0, 1.14],
  vignette = 0.45,
  grain = 0.04,
  fade = 1,
} = {}) {
  const img = loadImage(src);
  if (!img || !img.complete || img.naturalWidth === 0) {
    // Fallback while loading
    ctx.fillStyle = '#0E1116';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  const progress = clamp(lt / d);
  const eased = eio(progress);

  // Compute camera scale and translation
  let scale = 1.0;
  let panX = 0;
  let panY = 0;

  if (mode === 'push_in') {
    scale = lerp(zoomRange[0], zoomRange[1], eased);
  } else if (mode === 'pull_back') {
    scale = lerp(zoomRange[1], zoomRange[0], eased);
  } else if (mode === 'pan_right') {
    scale = zoomRange[1];
    panX = lerp(-60, 60, eased);
  } else if (mode === 'pan_left') {
    scale = zoomRange[1];
    panX = lerp(60, -60, eased);
  } else {
    scale = zoomRange[0];
  }

  // Draw image to fill 1080x1920 (aspect cover)
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetAspect = W / H;
  const imgAspect = iw / ih;

  let dw, dh;
  if (imgAspect > targetAspect) {
    dh = H;
    dw = H * imgAspect;
  } else {
    dw = W;
    dh = W / imgAspect;
  }

  // Center on focus point
  const fx = W * focus[0];
  const fy = H * focus[1];

  ctx.save();
  ctx.globalAlpha = fade;

  // Camera transform centered on focus point
  ctx.translate(fx + panX, fy + panY);
  ctx.scale(scale, scale);
  ctx.translate(-fx, -fy);

  // Draw image centered in frame
  const ix = (W - dw) / 2;
  const iy = (H - dh) / 2;
  ctx.drawImage(img, ix, iy, dw, dh);

  ctx.restore();

  // Apply Atmospheric Vignette
  if (vignette > 0) {
    drawVignette(vignette);
  }

  // Apply Film Grain
  if (grain > 0) {
    drawFilmGrain(grain, t);
  }
}

/** Cinematic Vignette Overlay */
export function drawVignette(strength = 0.5) {
  const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.65);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.7, `rgba(0,0,0,${strength * 0.45})`);
  grad.addColorStop(1, `rgba(0,0,0,${strength * 0.88})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

/** Subtle Film Grain */
export function drawFilmGrain(amount = 0.03, t = 0) {
  const seed = Math.sin(t * 123.45) * 1000;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  for (let i = 0; i < 40; i++) {
    const gx = (rnd(i + seed) * W);
    const gy = (rnd(i * 2 + seed) * H);
    const gr = 1 + rnd(i * 3) * 2;
    ctx.fillRect(gx, gy, gr, gr);
  }
  ctx.restore();
}

/** Floating Atmospheric Dust / Sea Spray Particles */
export function drawAtmosphericParticles(count = 28, t = 0, color = 'rgba(255, 235, 190, 0.35)') {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const speedY = 25 + (i % 5) * 12;
    const speedX = Math.sin(i * 3 + t * 0.8) * 15;
    const px = (rnd(i * 7) * W + speedX * t) % W;
    const py = (H - ((rnd(i * 11) * H + speedY * t) % H));
    const size = 1.8 + rnd(i * 5) * 3.5;
    const alpha = (0.2 + 0.5 * Math.sin(i + t * 2)) * 0.6;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fillStyle = color.replace('0.35', String(alpha.toFixed(2)));
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Museum / Documentary Callout Tag
 * e.g., "ARCHAEOLOGICAL RECORD: GESORIACUM · 40 A.D."
 */
export function drawDocumentaryCallout(text, x, y, progress = 1, {
  category = 'HISTORICAL SOURCE',
  accentColor = DOC_THEME.gold,
  align = 'center',
} = {}) {
  if (progress <= 0) return;
  const scale = eo(clamp(progress));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.font = '700 24px Inter';
  const catWidth = ctx.measureText(category).width;
  ctx.font = '800 36px Caladea';
  const textWidth = ctx.measureText(text).width;
  const boxW = Math.max(catWidth, textWidth) + 64;
  const boxH = 88;

  let startX = -boxW / 2;
  if (align === 'left') startX = 0;
  if (align === 'right') startX = -boxW;

  // Frosted dark pill backing
  ctx.fillStyle = 'rgba(13, 16, 22, 0.82)';
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(startX, -boxH / 2, boxW, boxH, 12);
  ctx.fill();
  ctx.stroke();

  // Left accent pip
  ctx.fillStyle = accentColor;
  ctx.fillRect(startX + 12, -boxH / 2 + 16, 4, boxH - 32);

  // Category subline
  ctx.font = '800 20px Inter';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'left';
  ctx.fillText(category.toUpperCase(), startX + 28, -8);

  // Main text
  ctx.font = '700 32px Caladea';
  ctx.letterSpacing = '1px';
  ctx.fillStyle = DOC_THEME.white;
  ctx.fillText(text, startX + 28, 24);

  ctx.restore();
}

/**
 * Disputed History Badge / Fact Tag
 * Visually distinguishes myth from primary source evidence
 */
export function drawEvidencePill(type = 'SUETONIUS: GAIUS 46', label = 'ANCIENT ALLEGATION', x = 540, y = 320, progress = 1) {
  if (progress <= 0) return;
  const sc = eo(clamp(progress));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);

  ctx.font = '700 22px Inter';
  const tw1 = ctx.measureText(type).width;
  ctx.font = '800 26px Inter';
  const tw2 = ctx.measureText(label).width;
  const totalW = tw1 + tw2 + 60;

  ctx.fillStyle = 'rgba(10, 12, 16, 0.88)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-totalW / 2, -30, totalW, 60, 30);
  ctx.fill();
  ctx.stroke();

  // Type badge
  ctx.fillStyle = DOC_THEME.gold;
  ctx.beginPath();
  ctx.roundRect(-totalW / 2 + 8, -22, tw1 + 20, 44, 22);
  ctx.fill();

  ctx.font = '800 20px Inter';
  ctx.fillStyle = DOC_THEME.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type, -totalW / 2 + 18 + tw1 / 2, 0);

  // Label text
  ctx.font = '700 22px Inter';
  ctx.fillStyle = DOC_THEME.white;
  ctx.textAlign = 'left';
  ctx.fillText(label, -totalW / 2 + tw1 + 38, 0);

  ctx.restore();
}
