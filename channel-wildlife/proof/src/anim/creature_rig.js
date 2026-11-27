// Living Peacock Mantis Shrimp (Odontodactylus scyllarus)
// Photographic 2.5D Subject Articulation:
// 1. Photographic cephalothorax & carapace with respiratory heaving & micro-pitch
// 2. Tucked raptorial dactyl clubs shifting & testing biomechanical tension
// 3. Articulated photographic trinocular compound eyes on movable peduncles with independent saccades
// 4. Broad antennal scales flaring & sensory flagella swaying in marine currents
// 5. Metachronal pleopod respiration waves undulating beneath the ventral body
// 6. Volumetric underwater caustics & suspended marine snow
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class ArticulatedMantis {
  constructor() {
    this.heroImg = loadImage('assets/mantis_shrimp_hero.jpg');
    // Pre-calculate eye saccade keyframe targets
    this.eyeKeyframes = [
      { t: 0.0, l: { x: 0, y: 0, rot: 0 }, r: { x: 0, y: 0, rot: 0 } },
      { t: 0.8, l: { x: -8, y: -4, rot: -0.12 }, r: { x: 6, y: -8, rot: 0.08 } },
      { t: 1.6, l: { x: 6, y: 5, rot: 0.15 }, r: { x: -4, y: 4, rot: -0.14 } },
      { t: 2.4, l: { x: -3, y: 2, rot: -0.05 }, r: { x: 2, y: -2, rot: 0.06 } },
      { t: 3.65, l: { x: 0, y: 0, rot: 0 }, r: { x: 0, y: 0, rot: 0 } },
    ];
  }

  getEyeMotion(lt) {
    const kf = this.eyeKeyframes;
    let i = 0;
    while (i < kf.length - 1 && kf[i + 1].t <= lt) i++;
    if (i >= kf.length - 1) return kf[kf.length - 1];
    const cur = kf[i], nxt = kf[i + 1];
    const p = clamp((lt - cur.t) / (nxt.t - cur.t), 0, 1);
    const eased = eio(Math.min(1, p * 1.6));
    return {
      l: {
        x: lerp(cur.l.x, nxt.l.x, eased) + Math.sin(lt * 16) * 1.2,
        y: lerp(cur.l.y, nxt.l.y, eased) + Math.cos(lt * 14) * 0.9,
        rot: lerp(cur.l.rot, nxt.l.rot, eased) + Math.sin(lt * 12) * 0.02,
      },
      r: {
        x: lerp(cur.r.x, nxt.r.x, eased) + Math.sin(lt * 14 + 1) * 1.2,
        y: lerp(cur.r.y, nxt.r.y, eased) + Math.cos(lt * 15 + 1) * 0.9,
        rot: lerp(cur.r.rot, nxt.r.rot, eased) + Math.sin(lt * 13 + 1) * 0.02,
      }
    };
  }

  draw(lt, d, t) {
    if (!this.heroImg || !this.heroImg.complete || this.heroImg.naturalWidth === 0) {
      ctx.fillStyle = '#06141f'; ctx.fillRect(0, 0, W, H);
      return;
    }

    const iw = this.heroImg.naturalWidth;
    const ih = this.heroImg.naturalHeight;
    const aspect = iw / ih;
    let dw = W, dh = dw / aspect;
    if (aspect > W / H) { dh = H; dw = dh * aspect; }
    const dx = (W - dw) * 0.5;
    const dy = (H - dh) * 0.45;

    // 1. Living Creature Respiration & Organic Crawling Micro-Motion
    // Slow rhythmic respiratory expansion + subtle pelvic crawling pitch
    const breath = Math.sin(t * 2.8) * 0.012;
    const crawlPitch = Math.sin(t * 1.8) * 0.015;
    const crawlX = Math.sin(t * 1.2) * 8;
    const crawlY = Math.cos(t * 1.2) * 5;
    const scale = 1.05 + breath;

    ctx.save();
    ctx.translate(540 + crawlX, 960 + crawlY);
    ctx.rotate(crawlPitch);
    ctx.scale(scale, scale);
    ctx.translate(-540, -960);

    // Draw main photographic plate
    ctx.drawImage(this.heroImg, dx, dy, dw, dh);

    // 2. Articulated Photographic Trinocular Eyes (Independent Scanning)
    this.drawPhotographicEyes(dx, dy, dw, dh, iw, ih, lt, t);

    // 3. Shifting Raptor Clubs (Biomechanical testing tension)
    this.drawRaptorClubTension(dx, dy, dw, dh, iw, ih, t);

    // 4. Undulating Pleopod Swimmerets (Beneath abdomen)
    this.drawPleopodBreathing(t);

    ctx.restore();

    // 5. Volumetric Caustic Sunlight Beams
    this.drawCaustics(t);

    // 6. Suspended Marine Snow & Micro-Plankton
    this.drawMarineSnow(t);
  }

  drawPhotographicEyes(dx, dy, dw, dh, iw, ih, lt, t) {
    const motion = this.getEyeMotion(lt);
    const scaleX = dw / iw;
    const scaleY = dh / ih;

    // Eye coordinates measured in 768x1376:
    // Left eye: center [275, 445], radius 42
    // Right eye: center [355, 450], radius 48

    // ── Left Photographic Eye ──
    {
      const cxImg = 275, cyImg = 445, rImg = 42;
      const targetCenterX = dx + cxImg * scaleX;
      const targetCenterY = dy + cyImg * scaleY;
      const rCanvas = rImg * scaleX;

      ctx.save();
      ctx.translate(targetCenterX + motion.l.x, targetCenterY + motion.l.y);
      ctx.rotate(motion.l.rot);

      ctx.beginPath();
      ctx.arc(0, 0, rCanvas * 0.98, 0, TAU);
      ctx.clip();

      const sw = rImg * 2.2, sh = rImg * 2.2;
      const sx = cxImg - sw * 0.5, sy = cyImg - sh * 0.5;
      const dwTarget = sw * scaleX, dhTarget = sh * scaleY;

      ctx.drawImage(
        this.heroImg,
        sx, sy, sw, sh,
        -dwTarget * 0.5, -dhTarget * 0.5, dwTarget, dhTarget
      );

      // Specular highlight shift
      const glintX = -rCanvas * 0.25 + motion.l.x * 0.5;
      const glintY = -rCanvas * 0.3 + motion.l.y * 0.5;
      const glintGrad = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, rCanvas * 0.6);
      glintGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      glintGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
      glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glintGrad;
      ctx.fill();

      ctx.restore();
    }

    // ── Right Photographic Eye ──
    {
      const cxImg = 355, cyImg = 450, rImg = 48;
      const targetCenterX = dx + cxImg * scaleX;
      const targetCenterY = dy + cyImg * scaleY;
      const rCanvas = rImg * scaleX;

      ctx.save();
      ctx.translate(targetCenterX + motion.r.x, targetCenterY + motion.r.y);
      ctx.rotate(motion.r.rot);

      ctx.beginPath();
      ctx.arc(0, 0, rCanvas * 0.98, 0, TAU);
      ctx.clip();

      const sw = rImg * 2.2, sh = rImg * 2.2;
      const sx = cxImg - sw * 0.5, sy = cyImg - sh * 0.5;
      const dwTarget = sw * scaleX, dhTarget = sh * scaleY;

      ctx.drawImage(
        this.heroImg,
        sx, sy, sw, sh,
        -dwTarget * 0.5, -dhTarget * 0.5, dwTarget, dhTarget
      );

      const glintX = -rCanvas * 0.25 + motion.r.x * 0.5;
      const glintY = -rCanvas * 0.3 + motion.r.y * 0.5;
      const glintGrad = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, rCanvas * 0.6);
      glintGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      glintGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
      glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glintGrad;
      ctx.fill();

      ctx.restore();
    }
  }

  drawRaptorClubTension(dx, dy, dw, dh, iw, ih, t) {
    ctx.save();
    // Subtly shift photographic dactyl club region [300, 520, 160, 160] in 768x1376
    const scaleX = dw / iw, scaleY = dh / ih;
    const cxImg = 380, cyImg = 600, wImg = 140, hImg = 140;
    const targetCenterX = dx + cxImg * scaleX;
    const targetCenterY = dy + cyImg * scaleY;
    const dwTarget = wImg * scaleX, dhTarget = hImg * scaleY;

    // Muscular test flexion (~1.2 Hz tension cycle)
    const flexShift = Math.sin(t * 3.5) * 4;
    const flexRot = Math.sin(t * 3.5) * 0.03;

    ctx.translate(targetCenterX, targetCenterY + flexShift);
    ctx.rotate(flexRot);

    ctx.beginPath();
    ctx.ellipse(0, 0, dwTarget * 0.48, dhTarget * 0.48, 0.2, 0, TAU);
    ctx.clip();

    ctx.drawImage(
      this.heroImg,
      cxImg - wImg * 0.5, cyImg - hImg * 0.5, wImg, hImg,
      -dwTarget * 0.5, -dhTarget * 0.5, dwTarget, dhTarget
    );

    // Specular sheen on chitin
    const sheenGrad = ctx.createLinearGradient(-dwTarget * 0.4, -dhTarget * 0.4, dwTarget * 0.4, dhTarget * 0.4);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    sheenGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
    sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fill();

    ctx.restore();
  }

  drawPleopodBreathing(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const cx = 390, cy = 1180;
    for (let p = 0; p < 3; p++) {
      const phase = t * 5.0 + p * 1.2;
      const wave = Math.sin(phase) * 14;
      const py = cy + p * 42 + wave;
      const px = cx + p * 35;

      const grad = ctx.createRadialGradient(px, py, 4, px, py, 48);
      grad.addColorStop(0, 'rgba(255, 160, 100, 0.25)');
      grad.addColorStop(0.6, 'rgba(79, 209, 232, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 48, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCaustics(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i++) {
      const x = 160 + i * 240 + Math.sin(t * 1.1 + i * 1.4) * 70;
      const grad = ctx.createLinearGradient(x - 90, 0, x + 90, H);
      grad.addColorStop(0, 'rgba(64, 224, 208, 0.14)');
      grad.addColorStop(0.4, 'rgba(72, 209, 204, 0.07)');
      grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 110, 0);
      ctx.lineTo(x + 110, 0);
      ctx.lineTo(x + 180 + Math.cos(t * 1.4 + i) * 60, H);
      ctx.lineTo(x - 50 + Math.sin(t * 1.3 + i) * 50, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawMarineSnow(t) {
    ctx.save();
    // Two depth planes of suspended plankton particles
    ctx.fillStyle = 'rgba(200, 235, 255, 0.35)';
    for (let i = 0; i < 30; i++) {
      const px = ((i * 37.1 + Math.sin(t * 0.3 + i) * 30) % W);
      const py = ((i * 59.3 + t * 35) % H);
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, TAU);
      ctx.fill();
    }

    for (let i = 0; i < 15; i++) {
      const px = ((i * 73.7 + Math.sin(t * 0.5 + i * 2) * 50) % W);
      const py = ((i * 91.2 + t * 65) % H);
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 6);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}
