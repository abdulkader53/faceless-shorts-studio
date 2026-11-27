// Coordinated Strike Event: Photorealistic Impact Kinematics & Cavitation Dynamics
// 1. Photographic Strike Plate with Dynamic Snap-Zoom & Ballistic Impulse Shake
// 2. Coordinated Sonoluminescent Contact Flash at Point of Impact (680, 960)
// 3. High-Velocity Acoustic Shockwave Rings Expanding at 1,500 m/s
// 4. Turbulent Hydrodynamic Cavitation Micro-Bubble Field & Fluid Velocity Vectors
// 5. Scientific Impact Telemetry HUD (23.4 m/s velocity, 10,400 G acceleration, 1,500 N force)
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class StrikeEvent {
  constructor() {
    this.strikeImg = loadImage('assets/mantis_shrimp_strike.jpg');
    // Pre-seed turbulent cavitation wake bubbles
    this.wakeBubbles = [];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.random() - 0.5) * 1.8 + Math.PI;
      const speed = 120 + Math.random() * 260;
      this.wakeBubbles.push({
        angle,
        speed,
        r: 1.5 + Math.random() * 4.0,
        life: 0.3 + Math.random() * 0.7,
        seed: Math.random() * 100,
      });
    }
  }

  draw(lt, d, t) {
    // Strike Event Timeline:
    // 0.00 to 0.95s: Coiling & Tracking (subtle micro-tension push)
    // 0.95 to 1.15s: Explosive 10,400 G Ballistic Strike Impulse!
    // 1.15 to 2.93s: Cavitation Bubble Expansion, Acoustic Shockwaves & Wake Turbulence
    const tStrike = 0.95;
    const isStriking = lt >= tStrike;
    const strikeP = clamp((lt - tStrike) / 0.18);
    const afterImpact = Math.max(0, lt - tStrike);

    // Impact Camera Impulse (Snap-zoom + high-frequency micro-jitter)
    let shakeX = 0, shakeY = 0;
    if (isStriking && afterImpact < 0.35) {
      const decay = 1 - (afterImpact / 0.35);
      shakeX = Math.sin(afterImpact * 120) * 12 * decay;
      shakeY = Math.cos(afterImpact * 110) * 9 * decay;
    }

    const baseScale = isStriking ? lerp(1.08, 1.18, eo(strikeP)) : lerp(1.04, 1.08, lt / tStrike);

    // 1. Background Environmental Strike Plate
    ctx.save();
    ctx.translate(540 + shakeX, 960 + shakeY);
    ctx.scale(baseScale, baseScale);
    ctx.translate(-540, -960);

    if (this.strikeImg && this.strikeImg.complete && this.strikeImg.naturalWidth > 0) {
      const iw = this.strikeImg.naturalWidth, ih = this.strikeImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.strikeImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#06141f'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // 2. Coordinated Cavitation & Contact Physics at Impact Point (670, 960)
    const impactX = 670 + shakeX;
    const impactY = 960 + shakeY;

    if (isStriking) {
      // Acoustic shockwave pressure rings
      this.drawShockwaveRings(impactX, impactY, afterImpact);

      // Sonoluminescent thermal flash
      this.drawContactFlash(impactX, impactY, afterImpact);

      // Hydrodynamic cavitation micro-bubble plume
      this.drawCavitationPlume(impactX, impactY, afterImpact, t);

      // Fluid velocity field vectors
      this.drawVelocityField(impactX, impactY, afterImpact, t);
    }

    // 3. High-End Documentary Telemetry HUD
    this.drawTelemetry(lt, isStriking, strikeP, afterImpact);
  }

  drawShockwaveRings(cx, cy, afterImpact) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 3 Concentric acoustic waves expanding at ~1,500 m/s
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.08;
      if (afterImpact < delay) continue;
      const age = afterImpact - delay;
      if (age > 0.6) continue;

      const progress = age / 0.6;
      const radius = progress * 420;
      const alpha = (1 - progress) * 0.75;

      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
      ctx.lineWidth = 4 * (1 - progress) + 1;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.stroke();

      // Outer refraction glow
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.4})`;
      ctx.lineWidth = 12 * (1 - progress);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawContactFlash(cx, cy, afterImpact) {
    if (afterImpact > 0.3) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const flashProgress = afterImpact / 0.3;
    const flashAlpha = Math.exp(-flashProgress * 8);
    const flashRadius = 160 + flashProgress * 80;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashRadius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.95})`);
    grad.addColorStop(0.3, `rgba(254, 240, 138, ${flashAlpha * 0.7})`);
    grad.addColorStop(0.65, `rgba(56, 189, 248, ${flashAlpha * 0.4})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, flashRadius, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  drawCavitationPlume(cx, cy, afterImpact, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Expanding cloud of microscopic cavitation vapor bubbles
    for (let i = 0; i < this.wakeBubbles.length; i++) {
      const b = this.wakeBubbles[i];
      const bubbleAge = (afterImpact * 1.6 + b.seed * 0.02) % b.life;
      const prog = bubbleAge / b.life;

      const dist = prog * b.speed * 0.8;
      const px = cx + Math.cos(b.angle) * dist + Math.sin(t * 8 + i) * 12;
      const py = cy + Math.sin(b.angle) * dist - prog * 60; // Buoyant upward drift
      const r = b.r * (1 - prog * 0.5);

      const alpha = Math.sin(prog * Math.PI) * 0.85;
      ctx.fillStyle = `rgba(240, 249, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  drawVelocityField(cx, cy, afterImpact, t) {
    if (afterImpact > 0.8) return;
    ctx.save();
    const alpha = clamp(1 - afterImpact / 0.8) * 0.85;
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
    ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
    ctx.lineWidth = 2.2;

    for (let i = 0; i < 8; i++) {
      const angle = -0.75 + i * 0.22;
      const dist = 140 + (i % 2) * 50;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const len = 45 + Math.sin(t * 14 + i) * 15;

      const ex = sx + Math.cos(angle + 0.35) * len;
      const ey = sy + Math.sin(angle + 0.35) * len;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTelemetry(lt, isStriking, strikeP, afterImpact) {
    ctx.save();
    const bx = 80, by = 260, bw = 460, bh = 200;
    ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Corner brackets
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(bx, by, 14, 3);
    ctx.fillRect(bx, by, 3, 14);
    ctx.fillRect(bx + bw - 14, by + bh - 3, 14, 3);
    ctx.fillRect(bx + bw - 3, by + bh - 14, 3, 14);

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('BALLISTIC IMPACT KINEMATICS', bx + 24, by + 40);

    const vel = isStriking ? (strikeP * 23.4).toFixed(1) : '0.0';
    ctx.font = '900 44px Inter, sans-serif';
    ctx.fillStyle = isStriking ? '#ef4444' : '#38bdf8';
    ctx.fillText(`${vel} m/s`, bx + 24, by + 98);

    ctx.font = '600 17px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PEAK IMPACT SPEED (52.3 MPH)', bx + 24, by + 128);

    ctx.font = '700 17px Inter, sans-serif';
    ctx.fillStyle = isStriking ? '#ef4444' : '#facc15';
    ctx.fillText(isStriking ? 'FORCE: 1,500 N · ACCEL: 10,400 G' : 'STATUS: COILING STRIKE SPRING', bx + 24, by + 170);

    ctx.restore();
  }
}
