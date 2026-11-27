// Moving Stormy Ocean Waves & Atmospheric Coastal Gale
// Authentic documentary cinematography:
// 1. High-resolution storm plate with Ken Burns atmospheric drift
// 2. Volumetric bronze sunbeams breaking through storm clouds
// 3. Gale-force sea spray mist blowing horizontally across the Channel
// 4. Camera lens rain droplets with realistic optical refraction
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class OceanWaves {
  constructor() {
    this.oceanImg = loadImage('assets/raging_storm_ocean.jpg');
    // Pre-generate gale sea spray particles
    this.spray = [];
    for (let i = 0; i < 60; i++) {
      this.spray.push({
        x: Math.random() * W,
        y: 600 + Math.random() * 1100,
        vx: 120 + Math.random() * 180,
        vy: (Math.random() - 0.5) * 25,
        r: 1.5 + Math.random() * 2.5,
        alpha: 0.25 + Math.random() * 0.45,
      });
    }
    // Pre-generate camera lens water droplets
    this.lensDroplets = [];
    for (let i = 0; i < 18; i++) {
      this.lensDroplets.push({
        x: 80 + Math.random() * (W - 160),
        y: 200 + Math.random() * (H - 400),
        r: 6 + Math.random() * 14,
        dripSpeed: 4 + Math.random() * 8,
      });
    }
  }

  draw(lt, d, t) {
    // 1. Full-frame Cinematic Ocean Plate with slow push-in
    ctx.save();
    const scale = lerp(1.12, 1.03, eio(clamp(lt / d)));
    ctx.translate(540, 960);
    ctx.scale(scale, scale);
    ctx.translate(-540, -960);

    if (this.oceanImg && this.oceanImg.complete && this.oceanImg.naturalWidth > 0) {
      const iw = this.oceanImg.naturalWidth, ih = this.oceanImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.oceanImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#121922'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // 2. Volumetric Bronze God-Rays (Sunlight piercing storm clouds)
    this.drawGodRays(t);

    // 3. Gale Wind Sea Spray Mist
    this.drawSeaSpray(t);

    // 4. Optical Water Droplets on Camera Lens
    this.drawLensDroplets(t);
  }

  drawGodRays(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i++) {
      const x = 180 + i * 220 + Math.sin(t * 0.7 + i * 1.5) * 45;
      const grad = ctx.createLinearGradient(x, 0, x + 100, 1200);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
      grad.addColorStop(0.4, 'rgba(180, 140, 50, 0.08)');
      grad.addColorStop(0.8, 'rgba(140, 100, 30, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 50, 0);
      ctx.lineTo(x + 50, 0);
      ctx.lineTo(x + 130 + Math.cos(t * 0.8 + i) * 50, 1200);
      ctx.lineTo(x - 30 + Math.sin(t * 0.8 + i) * 40, 1200);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawSeaSpray(t) {
    ctx.save();
    for (let p of this.spray) {
      const curX = (p.x + t * p.vx) % W;
      const curY = p.y + Math.sin(t * 3.5 + p.x) * 12;

      ctx.fillStyle = `rgba(220, 240, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(curX, curY, p.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawLensDroplets(t) {
    ctx.save();
    for (let d of this.lensDroplets) {
      const curY = d.y + (t * d.dripSpeed) % 80;

      // Refractive outer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(d.x, curY, d.r, 0, TAU);
      ctx.stroke();

      // Soft water droplet shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(d.x + 2, curY + 2, d.r - 2, 0, TAU);
      ctx.fill();

      // Specular highlight glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(d.x - d.r * 0.35, curY - d.r * 0.35, d.r * 0.3, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}
