// Marching Roman Legionary Column: Authentic 2.5D Cinematic Documentary Animation
// 1. Photographic Column Plate with Natural Marching Gait Cadence & Body-Weight Transfer
// 2. Dynamic Specular Light Sweep across Lorica Segmentata Steel Cuirasses & Galea Helmets
// 3. Billowing Red Sagum Cloak Wind Highlights & Organic Fabric Waves
// 4. Atmospheric Gale-Force Driving Rain & Low Drifting Coastal Sea Fog
// 5. Imperial Order of Battle Telemetry HUD (40,000 Troops · Legio I Germanica & Legio V Alaudae)
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class MarchingLegion {
  constructor() {
    this.bgImg = loadImage('assets/roman_legion_shore.jpg');
    // Pre-seed sand disturbance particles
    this.sandPuffs = [];
    for (let i = 0; i < 40; i++) {
      this.sandPuffs.push({
        x: Math.random() * W,
        y: 1680 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 35,
        r: 1.5 + Math.random() * 3.0,
        life: 0.4 + Math.random() * 0.5,
      });
    }
  }

  draw(lt, d, t) {
    // March cadence: 1.8 paces per second (~110 steps/min)
    const marchFreq = 3.6; // Step frequency
    const marchPhase = t * marchFreq;

    // 1. Natural Marching Gait Kinematics applied to the Legionary Column
    // Sinusoidal vertical pelvic bounce: drops slightly on heel strike
    const pelvicBounce = -Math.abs(Math.sin(marchPhase)) * 6.5;
    // Subtle lateral weight transfer roll (alternating left / right foot support)
    const weightRoll = Math.sin(marchPhase * 0.5) * 0.012;
    // Slow cinematic push-in
    const zoomScale = lerp(1.10, 1.03, eio(clamp(lt / d)));

    ctx.save();
    ctx.translate(540, 1200);
    ctx.rotate(weightRoll);
    ctx.translate(0, pelvicBounce);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-540, -1200);

    if (this.bgImg && this.bgImg.complete && this.bgImg.naturalWidth > 0) {
      const iw = this.bgImg.naturalWidth, ih = this.bgImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.bgImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#161a22'; ctx.fillRect(0, 0, W, H);
    }

    // 2. Dynamic Specular Light Sweep across Steel & Bronze Armor
    this.drawArmorSpecularSweeps(marchPhase, t);

    // 3. Billowing Sagum Cloaks & Wind Sheen
    this.drawCloakWindHighlights(t);

    ctx.restore();

    // 4. Wet Sand / Shingle Disturbance along Beach Footline
    this.drawCoastalFootPuffs(marchPhase, t);

    // 5. Gale Rain Streaks & Coastal Sea Fog
    this.drawAtmosphere(t);

    // 6. Imperial Order of Battle Telemetry HUD (Top Right)
    this.drawTelemetry(lt);
  }

  drawArmorSpecularSweeps(phase, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Armor coordinates for the 4 foreground legionaries in the photographic plate
    const armorPositions = [
      { x: 280, y: 920, r: 85, color: 'rgba(254, 240, 138, 0.35)' }, // Left soldier helmet/shoulders
      { x: 535, y: 880, r: 105, color: 'rgba(255, 255, 255, 0.45)' }, // Center commander steel cuirass
      { x: 740, y: 910, r: 90, color: 'rgba(254, 240, 138, 0.35)' }, // Right-center helmet & lorica
      { x: 920, y: 900, r: 85, color: 'rgba(255, 255, 255, 0.35)' }, // Far-right soldier
    ];

    for (let i = 0; i < armorPositions.length; i++) {
      const pos = armorPositions[i];
      // Specular glint shifts with gait and wind
      const shiftX = Math.sin(phase + i * 1.4) * 16;
      const shiftY = Math.cos(phase + i * 1.4) * 8;
      const sweep = Math.sin(t * 2.2 + i * 0.8) * 0.5 + 0.5;

      const grad = ctx.createRadialGradient(pos.x + shiftX, pos.y + shiftY, 5, pos.x + shiftX, pos.y + shiftY, pos.r);
      grad.addColorStop(0, pos.color);
      grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pos.x + shiftX, pos.y + shiftY, pos.r, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCloakWindHighlights(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';

    // Red wool sagum fluttering highlights in gale wind
    const cloakPositions = [
      { x: 230, y: 1100, w: 90, h: 220 },
      { x: 440, y: 1080, w: 100, h: 240 },
      { x: 670, y: 1120, w: 85, h: 220 },
      { x: 860, y: 1100, w: 90, h: 230 },
    ];

    for (let i = 0; i < cloakPositions.length; i++) {
      const c = cloakPositions[i];
      const windWave = Math.sin(t * 8.5 + i * 1.8) * 14;

      const grad = ctx.createLinearGradient(c.x, c.y, c.x + c.w + windWave, c.y + c.h);
      grad.addColorStop(0, 'rgba(220, 38, 38, 0.25)');
      grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
      grad.addColorStop(1, 'rgba(153, 27, 27, 0.15)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x + windWave * 0.5, c.y + c.h * 0.5, c.w * 0.5, c.h * 0.5, 0.1, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCoastalFootPuffs(phase, t) {
    ctx.save();
    // Wet gravel / sand kicked up in cadence
    if (Math.abs(Math.cos(phase)) > 0.8) {
      ctx.fillStyle = 'rgba(140, 125, 110, 0.35)';
      for (let i = 0; i < 4; i++) {
        const x = 240 + i * 220 + Math.sin(phase) * 15;
        const y = 1750 + (i % 2) * 30;
        ctx.beginPath();
        ctx.ellipse(x, y, 42, 12, 0, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawAtmosphere(t) {
    ctx.save();
    // Driving coastal rain streaks
    ctx.strokeStyle = 'rgba(220, 235, 250, 0.32)';
    ctx.lineWidth = 1.6;

    for (let i = 0; i < 75; i++) {
      const rx = ((i * 41.7 + t * 480) % W);
      const ry = ((i * 63.3 + t * 880) % H);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 12, ry + 36);
      ctx.stroke();
    }

    // Drifting coastal sea fog between ranks and shoreline
    ctx.globalCompositeOperation = 'screen';
    for (let f = 0; f < 3; f++) {
      const fx = ((t * 45 + f * 380) % (W + 400)) - 200;
      const fy = 1250 + f * 110;
      const grad = ctx.createRadialGradient(fx, fy, 40, fx, fy, 280);
      grad.addColorStop(0, 'rgba(200, 220, 235, 0.18)');
      grad.addColorStop(0.6, 'rgba(180, 205, 225, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, 280, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTelemetry(lt) {
    ctx.save();
    const bx = 580, by = 260, bw = 440, bh = 200;
    ctx.fillStyle = 'rgba(18, 14, 11, 0.88)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Corner brackets
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(bx, by, 14, 3);
    ctx.fillRect(bx, by, 3, 14);
    ctx.fillRect(bx + bw - 14, by + bh - 3, 14, 3);
    ctx.fillRect(bx + bw - 3, by + bh - 14, 3, 14);

    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(245, 235, 230, 0.7)';
    ctx.fillText('IMPERIAL FORCES AT GESORIACUM', bx + 24, by + 40);

    ctx.font = '900 44px Inter, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('40,000 TROOPS', bx + 24, by + 96);

    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('LEGIO I GERMANICA & LEGIO V ALAUDAE', bx + 24, by + 126);

    ctx.font = '700 16px Inter, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('STATUS: ADVANCING TO THE CLIFFS', bx + 24, by + 168);

    ctx.restore();
  }
}
