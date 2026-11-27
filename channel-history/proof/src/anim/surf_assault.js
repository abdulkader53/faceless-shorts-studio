// Soldiers Advancing into Breaking Surf
// Authentic cinematic documentary motion:
// 1. Violent crashing tidal surf and surging sea foam around legionary greaves
// 2. High-speed water splash bursts and spray droplets
// 3. Specular blade gleams flashing along gladius steel edges
// 4. Lens water spray droplets with optical distortion
// 5. Historical Suetonius decree card
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class SurfAssault {
  constructor() {
    this.surfImg = loadImage('assets/legionaries_stabbing_surf.jpg');
    // Pre-seed turbulent splash particles
    this.splashes = [];
    for (let i = 0; i < 75; i++) {
      this.splashes.push({
        x: 200 + Math.random() * 680,
        y: 1150 + Math.random() * 350,
        vx: (Math.random() - 0.5) * 160,
        vy: -(120 + Math.random() * 220), // Strong upward splash
        r: 2.0 + Math.random() * 4.0,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }
  }

  draw(lt, d, t) {
    // 1. Photographic Surf Plate with aggressive push-in
    ctx.save();
    const bgScale = lerp(1.15, 1.04, eio(clamp(lt / d)));
    ctx.translate(540, 960);
    ctx.scale(bgScale, bgScale);
    ctx.translate(-540, -960);

    if (this.surfImg && this.surfImg.complete && this.surfImg.naturalWidth > 0) {
      const iw = this.surfImg.naturalWidth, ih = this.surfImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.surfImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#141820'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // 2. Surging Ocean Foam around Legionary Knees & Greaves
    this.drawSurgingFoam(t);

    // 3. High-Speed Water Splash Bursts
    this.drawWaterSplashBursts(t);

    // 4. Specular Blade Gleams Flashing on Gladii
    this.drawBladeGleams(t);

    // 5. Suetonius Decree Telemetry Card
    this.drawImperialDecreeCard(lt);
  }

  drawSurgingFoam(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Surging frothy wash (y: 1250 to 1600)
    for (let f = 0; f < 3; f++) {
      const foamY = 1280 + f * 70;
      const wavePhase = t * 4.5 + f * 1.6;
      const waveAlpha = 0.45 + Math.sin(wavePhase) * 0.25;

      const grad = ctx.createLinearGradient(0, foamY - 40, 0, foamY + 60);
      grad.addColorStop(0, `rgba(255, 255, 255, ${waveAlpha})`);
      grad.addColorStop(0.5, `rgba(210, 235, 250, ${waveAlpha * 0.6})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, foamY + 80);

      for (let x = 0; x <= W; x += 30) {
        const h = Math.sin(x * 0.02 + wavePhase) * 28 + Math.cos(x * 0.04) * 16;
        ctx.lineTo(x, foamY + h);
      }
      ctx.lineTo(W, foamY + 80);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawWaterSplashBursts(t) {
    ctx.save();
    for (let s of this.splashes) {
      const phase = (t * 2.8 + s.x * 0.01) % 1;
      const px = s.x + s.vx * phase;
      const py = s.y + s.vy * phase + 350 * phase * phase; // Gravity arc
      const pr = Math.max(0.5, s.r * (1 - phase));

      ctx.fillStyle = `rgba(240, 248, 255, ${s.alpha * (1 - phase)})`;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBladeGleams(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Blade impact points on screen: soldier center sword [680, 1020], left soldier [130, 1040], right soldier [780, 1060]
    const gleamTargets = [
      { x: 670, y: 1040, phase: 0 },
      { x: 140, y: 1060, phase: 0.4 },
      { x: 790, y: 1080, phase: 0.7 },
    ];

    gleamTargets.forEach((gt) => {
      const cycle = (t * 2.5 + gt.phase) % 1;
      if (cycle < 0.25) {
        const flash = Math.sin((cycle / 0.25) * Math.PI);
        const grad = ctx.createRadialGradient(gt.x, gt.y, 2, gt.x, gt.y, 45 * flash);
        grad.addColorStop(0, `rgba(255, 255, 255, ${flash * 0.95})`);
        grad.addColorStop(0.4, `rgba(212, 175, 55, ${flash * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gt.x, gt.y, 45 * flash, 0, TAU);
        ctx.fill();

        // 4-point star lens glint
        ctx.strokeStyle = `rgba(255, 255, 255, ${flash * 0.8})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(gt.x - 30 * flash, gt.y); ctx.lineTo(gt.x + 30 * flash, gt.y);
        ctx.moveTo(gt.x, gt.y - 30 * flash); ctx.lineTo(gt.x, gt.y + 30 * flash);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  drawImperialDecreeCard(lt) {
    ctx.save();
    const bx = 600, by = 260, bw = 420, bh = 220;
    ctx.fillStyle = 'rgba(18, 14, 11, 0.88)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Corner brackets
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bx, by, 14, 3);
    ctx.fillRect(bx, by, 3, 14);
    ctx.fillRect(bx + bw - 14, by + bh - 3, 14, 3);
    ctx.fillRect(bx + bw - 3, by + bh - 14, 3, 14);

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(245, 235, 230, 0.7)';
    ctx.fillText('IMPERIAL COMMAND · SUETONIUS', bx + 24, by + 40);

    ctx.font = '900 40px Inter, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('WAR ON NEPTUNE', bx + 24, by + 96);

    ctx.font = '700 17px Inter, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('COLLECT THE SPOILS OF THE OCEAN', bx + 24, by + 130);

    ctx.font = '600 15px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('HELMETS FILLED WITH SEASHELLS', bx + 24, by + 172);

    ctx.restore();
  }
}
