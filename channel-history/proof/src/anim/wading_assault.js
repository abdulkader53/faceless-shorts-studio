// Soldiers Advancing into Breaking Surf: Authentic Cinematic Action & Wave Dynamics
// 1. Photographic Surf Assault Plate with Heavy Forward Wading Kinematics & Wave Resistance
// 2. Gladius Steel Blade Specular Gleams Flashing in Cadence with Stabbing Strokes
// 3. Dynamic Crashing Surf, Turbulent Foaming Wake & Wave Parting around Soldiers
// 4. Violent Water Splash Bursts & Sea Spray Kicking onto the Camera Lens
// 5. Suetonius Imperial Decree Telemetry HUD (War on Neptune · Spoils of the Ocean)
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class WadingAssault {
  constructor() {
    this.surfImg = loadImage('assets/legionaries_stabbing_surf.jpg');
    // Pre-seed turbulent splash particles
    this.splashes = [];
    for (let i = 0; i < 65; i++) {
      this.splashes.push({
        x: Math.random() * W,
        y: 1250 + Math.random() * 250,
        vx: (Math.random() - 0.5) * 140,
        vy: -(120 + Math.random() * 240), // Upward spray
        r: 1.8 + Math.random() * 3.5,
        life: 0.35 + Math.random() * 0.45,
      });
    }

    // Lens water droplets
    this.lensDroplets = [];
    for (let i = 0; i < 18; i++) {
      this.lensDroplets.push({
        x: 100 + Math.random() * (W - 200),
        y: 120 + Math.random() * (H - 240),
        r: 6 + Math.random() * 14,
        alpha: 0.25 + Math.random() * 0.45,
      });
    }
  }

  draw(lt, d, t) {
    // Wading cadence: heavy, powerful forward strides against hydrodynamic drag
    const wadeFreq = 2.8;
    const wadePhase = t * wadeFreq;

    // Body heave against waves: forward lean + vertical displacement
    const bodyLean = Math.sin(wadePhase * 0.5) * 0.015;
    const bodyHeave = -Math.abs(Math.sin(wadePhase)) * 8;
    const zoomScale = lerp(1.12, 1.04, eio(clamp(lt / d)));

    // 1. Photographic Plate with Forward Wading Kinematics
    ctx.save();
    ctx.translate(540, 1150);
    ctx.rotate(bodyLean);
    ctx.translate(0, bodyHeave);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-540, -1150);

    if (this.surfImg && this.surfImg.complete && this.surfImg.naturalWidth > 0) {
      const iw = this.surfImg.naturalWidth, ih = this.surfImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.surfImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#141820'; ctx.fillRect(0, 0, W, H);
    }

    // 2. Gladius Steel Blade Specular Gleams
    this.drawGladiusGleams(t);

    ctx.restore();

    // 3. Dynamic Crashing Surf & Parting Foam across Soldiers' Waists
    this.drawCrashingWaveFoam(wadePhase, t);

    // 4. Violent Water Splash Bursts where Swords & Shields Impact Waves
    this.drawWaterSplashBursts(t);

    // 5. Optical Lens Water Droplets
    this.drawLensDroplets();

    // 6. Suetonius Historical Decree Telemetry HUD (Top Right)
    this.drawImperialDecreeCard(lt);
  }

  drawGladiusGleams(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Blade coordinates in legionaries_stabbing_surf.jpg:
    // Left soldier gladius: ~[140, 1110]
    // Center commander gladius: ~[680, 1180]
    // Right soldier gladius: ~[890, 1140]
    const blades = [
      { x: 140, y: 1110, angle: -0.4, phaseOffset: 0.8 },
      { x: 680, y: 1180, angle: 0.55, phaseOffset: 0 },
      { x: 890, y: 1140, angle: 0.65, phaseOffset: 1.4 },
    ];

    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      const gleamCycle = Math.sin(t * 6.5 + b.phaseOffset);
      if (gleamCycle <= 0.3) continue;

      const intensity = (gleamCycle - 0.3) / 0.7;
      const glintLen = 80 * intensity;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      // Steel gleam flare along blade edge
      const grad = ctx.createLinearGradient(-glintLen, 0, glintLen, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.95})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 4 * intensity + 1;
      ctx.beginPath();
      ctx.moveTo(-glintLen, 0);
      ctx.lineTo(glintLen, 0);
      ctx.stroke();

      // Core starburst glint
      const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 26 * intensity);
      starGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
      starGrad.addColorStop(0.4, `rgba(186, 230, 253, ${intensity * 0.6})`);
      starGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 26 * intensity, 0, TAU);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  drawCrashingWaveFoam(phase, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Foaming wave crests washing dynamically across the surf line (y: 1250 - 1500)
    for (let w = 0; w < 3; w++) {
      const wy = 1280 + w * 75;
      const wavePhase = t * 4.2 + w * 1.8;

      const grad = ctx.createLinearGradient(0, wy - 35, 0, wy + 45);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      grad.addColorStop(0.4, 'rgba(210, 235, 250, 0.45)');
      grad.addColorStop(0.8, 'rgba(160, 200, 225, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, wy + 45);

      for (let x = 0; x <= W; x += 30) {
        const swell = Math.sin(x * 0.018 + wavePhase) * 25 + Math.cos(x * 0.035 - t * 2) * 12;
        ctx.lineTo(x, wy + swell);
      }
      ctx.lineTo(W, wy + 45);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawWaterSplashBursts(t) {
    ctx.save();
    // Upward bursting foam and water spray particles
    for (let i = 0; i < this.splashes.length; i++) {
      const p = this.splashes[i];
      const age = (t * 2.2 + i * 0.08) % p.life;
      const prog = age / p.life;

      const px = p.x + p.vx * prog;
      const py = p.y + p.vy * prog + 320 * prog * prog; // Gravity pull-down
      const r = p.r * (1 - prog * 0.4);
      const alpha = Math.sin(prog * Math.PI) * 0.75;

      ctx.fillStyle = `rgba(240, 248, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawLensDroplets() {
    ctx.save();
    for (let i = 0; i < this.lensDroplets.length; i++) {
      const d = this.lensDroplets[i];
      const grad = ctx.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 1, d.x, d.y, d.r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${d.alpha * 0.8})`);
      grad.addColorStop(0.7, `rgba(200, 225, 245, ${d.alpha * 0.25})`);
      grad.addColorStop(0.95, `rgba(160, 190, 215, ${d.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawImperialDecreeCard(lt) {
    ctx.save();
    const bx = 560, by = 260, bw = 460, bh = 200;
    ctx.fillStyle = 'rgba(22, 14, 12, 0.90)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;

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
    ctx.fillStyle = 'rgba(245, 230, 225, 0.7)';
    ctx.fillText('IMPERIAL COMMAND · SUETONIUS', bx + 24, by + 40);

    ctx.font = '900 42px Inter, sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('WAR ON NEPTUNE', bx + 24, by + 96);

    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText('COLLECT THE SPOILS OF THE OCEAN', bx + 24, by + 126);

    ctx.font = '700 16px Inter, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('ASSAULTING THE CHANNEL SURF', bx + 24, by + 168);

    ctx.restore();
  }
}
