// High-Speed Hydrodynamic Cavitation & Sonoluminescence Physics Animation
// Shot 3: High-speed club strike, fluid shear velocity field, turbulent cavitation wake
// Shot 4: Violent vapor collapse, 4,700 K sonoluminescence thermal burst, radial acoustic shockwaves, carapace fracture
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class CavitationStrike {
  constructor() {
    this.strikeImg = loadImage('assets/mantis_shrimp_strike.jpg');
    this.collapseImg = loadImage('assets/cavitation_bubble_collapse.jpg');
  }

  // ── Shot 3: High-Speed Strike & Hydrodynamic Cavitation Wake ──
  drawNucleation(lt, d, t) {
    // 1. High-speed strike plate with smooth push-in
    ctx.save();
    const bgScale = lerp(1.15, 1.05, eio(clamp(lt / d)));
    ctx.translate(540, 960);
    ctx.scale(bgScale, bgScale);
    ctx.translate(-540, -960);

    if (this.strikeImg && this.strikeImg.complete && this.strikeImg.naturalWidth > 0) {
      const iw = this.strikeImg.naturalWidth, ih = this.strikeImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.strikeImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#06131d'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // Impact zone coordinates on screen
    const impactX = 640, impactY = 880;

    // 2. Expanding Cavitation Vapor Bubble & Pulsing Fluid Sheen
    const strikeProgress = clamp(lt / (d * 0.75));
    this.drawFluidCavitationSheen(impactX, impactY, strikeProgress, t);

    // 3. Fluid Velocity Field Vectors (Laminar flow separating into turbulent eddies)
    this.drawVelocityField(impactX, impactY, strikeProgress, t);

    // 4. Turbulent Micro-Bubble Stream
    this.drawCavitationMicroBubbles(impactX - 160, impactY + 30, strikeProgress, t);

    // 5. Scientific Telemetry Overlay (Top Left)
    this.drawTelemetryS03(lt, strikeProgress);
  }

  drawFluidCavitationSheen(ix, iy, progress, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Expanding vapor refraction envelope around impact
    const r = eo(progress) * 160 + 20;
    const pulse = Math.sin(t * 18) * 6;

    const grad = ctx.createRadialGradient(ix, iy, 10, ix, iy, r + pulse);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.35, 'rgba(125, 211, 252, 0.65)');
    grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.3)');
    grad.addColorStop(0.95, 'rgba(56, 189, 248, 0.55)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ix, iy, r + pulse, 0, TAU);
    ctx.fill();

    // Specular Fresnel glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(ix - r * 0.3, iy - r * 0.3, r * 0.22, r * 0.12, -0.6, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  drawVelocityField(cx, cy, progress, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(79, 209, 232, 0.6)';
    ctx.fillStyle = 'rgba(79, 209, 232, 0.85)';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < 6; i++) {
      const angle = -0.55 + i * 0.22;
      const dist = 180 + (i % 2) * 45;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const len = 50 + Math.sin(t * 14 + i) * 16;

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

  drawCavitationMicroBubbles(cx, cy, progress, t) {
    ctx.save();
    ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
    for (let i = 0; i < 40; i++) {
      const phase = (t * 7 + i * 2.1) % 1;
      const bx = cx - phase * 320 + Math.sin(i * 9) * 40;
      const by = cy + (Math.cos(i * 6) * 50) + (i % 2 === 0 ? -20 : 20);
      const br = (1 - phase) * 5 + 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTelemetryS03(lt, progress) {
    ctx.save();
    const bx = 80, by = 260, bw = 460, bh = 200;
    ctx.fillStyle = 'rgba(10, 16, 26, 0.86)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('HYDRODYNAMIC SHEAR ANALYSIS', bx + 24, by + 40);

    const vel = (progress * 23.4).toFixed(1);
    ctx.font = '900 44px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${vel} m/s`, bx + 24, by + 98);

    ctx.font = '600 17px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('STRIKE VELOCITY (52.3 MPH)', bx + 24, by + 128);

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = progress > 0.5 ? '#ef4444' : '#facc15';
    ctx.fillText('LOCAL PRESSURE: < 0.02 ATM (BOILING)', bx + 24, by + 170);

    ctx.restore();
  }

  // ── Shot 4: Violent Implosion & Sonoluminescence Shockwave ──
  drawImplosion(lt, d, t) {
    ctx.save();
    const bgScale = lerp(1.08, 1.22, eio(clamp(lt / d)));
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
    const tFlash = 0.45;

    if (lt >= tFlash) {
      const after = lt - tFlash;
      this.drawShockwaves(cx, cy, after);
      this.drawSonoluminescenceFlash(cx, cy, after);
      this.drawCarapaceFractures(cx + 60, cy + 40, after);
    }

    this.drawTelemetryS04(lt, tFlash);
  }

  drawSonoluminescenceFlash(cx, cy, after) {
    if (after > 0.9) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const intensity = Math.exp(-after * 6.0);
    const radius = 320 * intensity + 45;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    grad.addColorStop(0.25, `rgba(186, 230, 253, ${intensity * 0.95})`);
    grad.addColorStop(0.55, `rgba(56, 189, 248, ${intensity * 0.65})`);
    grad.addColorStop(0.85, `rgba(14, 116, 144, ${intensity * 0.3})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();

    // Hot plasma core
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 22 * intensity + 5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  drawShockwaves(cx, cy, after) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const rt = after - i * 0.12;
      if (rt <= 0) continue;
      const r = rt * 850;
      const a = Math.exp(-rt * 2.6) * 0.8;

      ctx.lineWidth = 5.5;
      ctx.strokeStyle = `rgba(186, 230, 253, ${a})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 16, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCarapaceFractures(fx, fy, after) {
    if (after <= 0) return;
    ctx.save();
    const crackProgress = clamp(after / 0.35);

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.95)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    const cracks = [
      [[0, 0], [45, -35], [95, -60], [140, -75]],
      [[0, 0], [35, 40], [70, 85], [115, 120]],
      [[0, 0], [-20, 50], [-45, 95], [-60, 140]],
      [[0, 0], [50, 10], [110, 20], [160, 15]],
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

    // Flying fragments
    ctx.fillStyle = '#f87171';
    for (let d = 0; d < 12; d++) {
      const angle = d * 0.55;
      const dist = after * (260 + d * 35);
      const px = fx + Math.cos(angle) * dist;
      const py = fy + Math.sin(angle) * dist + after * after * 180;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTelemetryS04(lt, tFlash) {
    ctx.save();
    const bx = 540 - 240, by = 260, bw = 480, bh = 200;
    ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
    ctx.strokeStyle = lt >= tFlash ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('SONOLUMINESCENCE & SHOCKWAVE PEAK', 540, by + 40);

    ctx.font = '900 44px Inter, sans-serif';
    ctx.fillStyle = lt >= tFlash ? '#ef4444' : '#facc15';
    ctx.fillText('4,700 K (8,000°F)', 540, by + 98);

    ctx.font = '600 18px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CORE COLLAPSE TEMPERATURE', 540, by + 128);

    ctx.font = '800 20px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SECONDARY IMPACT: 1,500 N FORCE', 540, by + 170);

    ctx.restore();
  }
}
