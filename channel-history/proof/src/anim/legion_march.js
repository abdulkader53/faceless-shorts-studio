// Roman Legionary Column at Gesoriacum
// Authentic cinematic documentary motion:
// 1. Slow camera push-in and micro-parallax on the legionary column
// 2. Armor and helmet specular metallic light gleam sweeping across iron plates
// 3. Coastal gale driving rain streaks and drifting sea mist
// 4. Lens water beads with optical refraction
// 5. Historical Order of Battle metadata card
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class LegionMarch {
  constructor() {
    this.legionImg = loadImage('assets/roman_legion_shore.jpg');
    // Pre-generate slanted rain streaks
    this.rain = [];
    for (let i = 0; i < 90; i++) {
      this.rain.push({
        x: Math.random() * W,
        y: Math.random() * H,
        len: 30 + Math.random() * 35,
        speed: 750 + Math.random() * 350,
        alpha: 0.15 + Math.random() * 0.3,
      });
    }
  }

  draw(lt, d, t) {
    // 1. Photographic Legionary Plate with slow, tense push-in
    const progress = clamp(lt / d);
    const scale = lerp(1.10, 1.03, eio(progress));
    const breath = Math.sin(t * 3.0) * 0.005;

    ctx.save();
    ctx.translate(540, 960);
    ctx.scale(scale + breath, scale + breath);
    ctx.translate(-540, -960);

    if (this.legionImg && this.legionImg.complete && this.legionImg.naturalWidth > 0) {
      const iw = this.legionImg.naturalWidth, ih = this.legionImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.legionImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#181b20'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // 2. Specular Armor & Helmet Gleam (Light breaking through storm sweeping across metal)
    this.drawArmorGleam(t);

    // 3. Drifting Coastal Sea Fog
    this.drawSeaFog(t);

    // 4. Driving Slanted Rain Streaks
    this.drawSlantedRain(t);

    // 5. Order of Battle Telemetry Card
    this.drawOrderOfBattleCard(lt);
  }

  drawArmorGleam(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Gleam on armor plates (approx center [500, 1050])
    const gleamCycle = (t * 0.8) % 1;
    const gx = 250 + gleamCycle * 580;
    const gy = 950 + Math.sin(gleamCycle * Math.PI) * 120;

    const grad = ctx.createRadialGradient(gx, gy, 10, gx, gy, 180);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.25)');
    grad.addColorStop(0.7, 'rgba(148, 163, 184, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, 180, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  drawSeaFog(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const fx = ((t * 50 + i * 380) % (W + 400)) - 200;
      const fy = 1100 + i * 140;
      const grad = ctx.createRadialGradient(fx, fy, 40, fx, fy, 280);
      grad.addColorStop(0, 'rgba(200, 220, 235, 0.18)');
      grad.addColorStop(0.5, 'rgba(180, 205, 225, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, 280, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawSlantedRain(t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(220, 235, 250, 0.32)';
    ctx.lineWidth = 1.6;

    for (let r of this.rain) {
      const curY = (r.y + t * r.speed) % H;
      const curX = (r.x + t * r.speed * 0.32) % W;

      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX + r.len * 0.32, curY + r.len);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawOrderOfBattleCard(lt) {
    ctx.save();
    const bx = 600, by = 260, bw = 420, bh = 200;
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
    ctx.fillText('STATUS: PREPARED FOR MUTINY', bx + 24, by + 168);

    ctx.restore();
  }
}
