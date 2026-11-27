// Progressive Physical Event: Hydrodynamic Cavitation Collapse & Sonoluminescence
// Scientifically grounded: Patek et al. (2004) & Flannigan & Suslick (2005)
// 1. Phase 1 (0.00 - 0.35s): Peak vapor cavity expansion with capillary surface oscillations
// 2. Phase 2 (0.35 - 0.52s): Inward hypersonic collapse & Rayleigh-Taylor micro-jet pinching
// 3. Phase 3 (0.52 - 0.75s): 4,700 K (8,000°F) sonoluminescence thermal plasma flash
// 4. Phase 4 (0.75 - 4.02s): 1,500 m/s acoustic shockwaves & progressive carapace spiderweb fracture
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class ProgressiveImplosion {
  constructor() {
    this.collapseImg = loadImage('assets/cavitation_bubble_collapse.jpg');
    // Pre-seed shell fragment projectiles
    this.fragments = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * TAU + (Math.random() - 0.5) * 0.3;
      this.fragments.push({
        angle,
        speed: 240 + Math.random() * 320,
        r: 2.5 + Math.random() * 4.5,
        rot: Math.random() * TAU,
        rotSpeed: (Math.random() - 0.5) * 18,
      });
    }
  }

  draw(lt, d, t) {
    // 1. Background Collapse Plate with dynamic zoom
    ctx.save();
    const bgScale = lerp(1.08, 1.20, eio(clamp(lt / d)));
    ctx.translate(540, 960);
    ctx.scale(bgScale, bgScale);
    ctx.translate(-540, -960);

    if (this.collapseImg && this.collapseImg.complete && this.collapseImg.naturalWidth > 0) {
      const iw = this.collapseImg.naturalWidth, ih = this.collapseImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.collapseImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#0a0d14'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    const cx = 540, cy = 920;

    // Timeline of Progressive Physical Event:
    const tCollapseStart = 0.35;
    const tFlash = 0.52;

    if (lt < tCollapseStart) {
      // ── Phase 1: Peak Expansion ──
      const expandP = clamp(lt / tCollapseStart);
      const r = lerp(120, 180, eo(expandP));
      this.drawExpandingCavity(cx, cy, r, t);
    } else if (lt < tFlash) {
      // ── Phase 2: Inward Hypersonic Collapse & Asymmetric Pinch ──
      const collapseP = clamp((lt - tCollapseStart) / (tFlash - tCollapseStart));
      const r = lerp(180, 8, eo(collapseP));
      this.drawCollapsingCavity(cx, cy, r, collapseP, t);
    } else {
      // ── Phase 3 & 4: Sonoluminescence Flash, Shockwaves & Shell Fracture ──
      const afterFlash = lt - tFlash;

      // 4 High-speed concentric acoustic shockwaves
      this.drawAcousticShockwaves(cx, cy, afterFlash);

      // 4,700 K Sonoluminescence plasma flash
      this.drawPlasmaFlash(cx, cy, afterFlash);

      // Progressive carapace spiderweb fracture & flying chitin fragments
      this.drawProgressiveFractures(cx + 60, cy + 40, afterFlash);
    }

    // Scientific Telemetry HUD (Progressive Stage Tracker)
    this.drawProgressiveTelemetry(lt, tCollapseStart, tFlash);
  }

  drawExpandingCavity(cx, cy, radius, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const pulse = Math.sin(t * 18) * 4;
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius + pulse);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(186, 230, 253, 0.7)');
    grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.35)');
    grad.addColorStop(0.95, 'rgba(56, 189, 248, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + pulse, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  drawCollapsingCavity(cx, cy, radius, collapseP, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Asymmetric pinching under liquid micro-jet
    const pinchX = cx + collapseP * 25;
    const pinchY = cy - collapseP * 15;

    const grad = ctx.createRadialGradient(pinchX, pinchY, 2, cx, cy, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    // Non-spherical distorted ellipse
    ctx.ellipse(pinchX, pinchY, radius, radius * 0.75, -0.4, 0, TAU);
    ctx.fill();

    // High-speed liquid micro-jet needle entering the cavity
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 80, cy - 60);
    ctx.lineTo(pinchX, pinchY);
    ctx.stroke();

    ctx.restore();
  }

  drawPlasmaFlash(cx, cy, afterFlash) {
    if (afterFlash > 0.85) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const intensity = Math.exp(-afterFlash * 7.5);
    const radius = 340 * intensity + 40;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    grad.addColorStop(0.2, `rgba(186, 230, 253, ${intensity * 0.95})`);
    grad.addColorStop(0.5, `rgba(56, 189, 248, ${intensity * 0.6})`);
    grad.addColorStop(0.8, `rgba(14, 116, 144, ${intensity * 0.25})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();

    // Incandescent thermal core
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 25 * intensity + 5, 0, TAU);
    ctx.fill();

    // Radial flare streaks
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.7})`;
    ctx.lineWidth = 2.0;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI;
      const len = radius * 1.35;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(ang) * len, cy - Math.sin(ang) * len);
      ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawAcousticShockwaves(cx, cy, afterFlash) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const rt = afterFlash - i * 0.14;
      if (rt <= 0) continue;
      const r = rt * 920; // 1,500 m/s acoustic propagation
      const a = Math.exp(-rt * 2.8) * 0.85;

      ctx.lineWidth = 6;
      ctx.strokeStyle = `rgba(186, 230, 253, ${a})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 18, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawProgressiveFractures(fx, fy, afterFlash) {
    if (afterFlash <= 0) return;
    ctx.save();
    // Progressive crack propagation over 0.5 seconds
    const crackProgress = clamp(afterFlash / 0.5);

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.95)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    const cracks = [
      [[0, 0], [45, -35], [95, -60], [150, -80]],
      [[0, 0], [35, 40], [75, 90], [120, 130]],
      [[0, 0], [-25, 55], [-50, 105], [-70, 150]],
      [[0, 0], [55, 12], [115, 24], [175, 18]],
      [[0, 0], [-35, -45], [-75, -80], [-110, -100]],
    ];

    cracks.forEach((pts) => {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      const numPts = Math.floor(pts.length * crackProgress);
      for (let i = 1; i < pts.length; i++) {
        if (i <= numPts) ctx.lineTo(fx + pts[i][0], fy + pts[i][1]);
      }
      ctx.stroke();
    });

    // Flying chitin fragment projectiles
    for (let f of this.fragments) {
      const dist = afterFlash * f.speed;
      const px = fx + Math.cos(f.angle) * dist;
      const py = fy + Math.sin(f.angle) * dist + afterFlash * afterFlash * 220; // Gravity arc
      const curRot = f.rot + afterFlash * f.rotSpeed;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(curRot);

      ctx.fillStyle = '#f87171';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(-f.r, -f.r);
      ctx.lineTo(f.r * 1.4, -f.r * 0.5);
      ctx.lineTo(f.r, f.r * 1.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  drawProgressiveTelemetry(lt, tCollapseStart, tFlash) {
    ctx.save();
    const bx = 540 - 240, by = 260, bw = 480, bh = 220;
    ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
    ctx.strokeStyle = lt >= tFlash ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Corner brackets
    ctx.fillStyle = lt >= tFlash ? '#ef4444' : '#38bdf8';
    ctx.fillRect(bx, by, 14, 3);
    ctx.fillRect(bx, by, 3, 14);
    ctx.fillRect(bx + bw - 14, by + bh - 3, 14, 3);
    ctx.fillRect(bx + bw - 3, by + bh - 14, 3, 14);

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';

    let stageTitle = 'PHASE 1: MAXIMUM VAPOR EXPANSION';
    let tempText = '293 K (ROOM TEMP)';
    let forceText = 'RADIUS: 6.5 MM';

    if (lt >= tFlash) {
      stageTitle = 'PHASE 3: SONOLUMINESCENCE & SHOCKWAVE';
      tempText = '4,700 K (8,000°F)';
      forceText = 'SECONDARY IMPACT: 1,500 N FORCE';
    } else if (lt >= tCollapseStart) {
      stageTitle = 'PHASE 2: HYPERSONIC CAVITY COLLAPSE';
      tempText = 'RAPID COMPRESSION';
      forceText = 'COLLAPSE SPEED: > 1,000 M/S';
    }

    ctx.fillText(stageTitle, 540, by + 40);

    ctx.font = '900 44px Inter, sans-serif';
    ctx.fillStyle = lt >= tFlash ? '#ef4444' : '#facc15';
    ctx.fillText(tempText, 540, by + 98);

    ctx.font = '600 18px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CORE COLLAPSE TEMPERATURE', 540, by + 128);

    ctx.font = '800 20px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(forceText, 540, by + 172);

    ctx.restore();
  }
}
