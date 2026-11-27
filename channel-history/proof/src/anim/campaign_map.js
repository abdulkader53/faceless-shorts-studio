// Real-time Animated Military Campaign Map
// Features:
// 1. Point-by-point procedural march route tracing (Rome -> Alps -> Gesoriacum)
// 2. Dynamic imperial distance odometer (0 km -> 1,420 km / 960 Roman Miles)
// 3. Advancing golden SPQR Eagle standard icon with radar pulse
// 4. Historical waypoint callouts popping up along the imperial highway
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';
import { loadImage } from '../core/documentary.js';

export class CampaignMap {
  constructor() {
    this.mapImg = loadImage('assets/roman_campaign_map.jpg');
    // Historical march coordinates on 1080x1920 canvas
    this.waypoints = [
      { name: 'ROMA', sub: 'IMPERIAL CAPITAL', km: 0, x: 670, y: 1390 },
      { name: 'MEDIOLANUM', sub: 'CISALPINE GAUL', km: 580, x: 530, y: 1090 },
      { name: 'ALPES PENNINAE', sub: 'GREAT ST BERNARD PASS', km: 760, x: 440, y: 940 },
      { name: 'LUGDUNUM', sub: 'GALLIA LUGDUNENSIS', km: 990, x: 380, y: 790 },
      { name: 'GESORIACUM', sub: 'THE CHANNEL CLIFFS', km: 1420, x: 290, y: 530 },
    ];
  }

  getRoutePoint(progress) {
    const pts = this.waypoints;
    const totalSegs = pts.length - 1;
    const segIdx = Math.min(Math.floor(progress * totalSegs), totalSegs - 1);
    const segP = (progress * totalSegs) - segIdx;
    const easedSegP = eio(segP);

    const p0 = pts[segIdx];
    const p1 = pts[segIdx + 1];

    return {
      x: lerp(p0.x, p1.x, easedSegP),
      y: lerp(p0.y, p1.y, easedSegP),
      km: Math.round(lerp(p0.km, p1.km, easedSegP)),
      curIdx: segIdx,
    };
  }

  draw(lt, d, t) {
    // 1. Background Antique Map Plate with subtle camera follow
    const progress = clamp(lt / (d * 0.85));
    const curPt = this.getRoutePoint(progress);

    ctx.save();
    const mapScale = lerp(1.18, 1.08, eio(progress));
    ctx.translate(540, 960);
    ctx.scale(mapScale, mapScale);
    ctx.translate(-540, -960);

    if (this.mapImg && this.mapImg.complete && this.mapImg.naturalWidth > 0) {
      const iw = this.mapImg.naturalWidth, ih = this.mapImg.naturalHeight;
      const aspect = iw / ih;
      let dw = W, dh = dw / aspect;
      if (aspect > W / H) { dh = H; dw = dh * aspect; }
      ctx.drawImage(this.mapImg, (W - dw) * 0.5, (H - dh) * 0.45, dw, dh);
    } else {
      ctx.fillStyle = '#1c1712'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // 2. Real-time Glowing Red Military March Route Line
    this.drawRouteLine(progress, t);

    // 3. Waypoint City Markers & Historical Badges
    this.drawWaypoints(progress, t);

    // 4. Moving SPQR Eagle Standard Icon at Tip of Route
    this.drawSPQRStandard(curPt.x, curPt.y, t);

    // 5. Dynamic Odometer & Campaign Telemetry Card (Top Right)
    this.drawOdometerCard(curPt.km, progress);
  }

  drawRouteLine(progress, t) {
    const pts = this.waypoints;
    const totalSegs = pts.length - 1;

    ctx.save();
    // Shadow / glow behind line
    ctx.strokeStyle = 'rgba(185, 28, 28, 0.4)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.strokePathToProgress(progress);
    ctx.stroke();

    // Core crimson military route
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 6;
    this.strokePathToProgress(progress);
    ctx.stroke();

    // Dashed inner marching column trail
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -t * 24;
    this.strokePathToProgress(progress);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  strokePathToProgress(progress) {
    const pts = this.waypoints;
    const totalSegs = pts.length - 1;
    const curSeg = Math.min(Math.floor(progress * totalSegs), totalSegs - 1);
    const segP = (progress * totalSegs) - curSeg;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 0; i < curSeg; i++) {
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
    }

    const p0 = pts[curSeg];
    const p1 = pts[curSeg + 1];
    const curX = lerp(p0.x, p1.x, eio(segP));
    const curY = lerp(p0.y, p1.y, eio(segP));
    ctx.lineTo(curX, curY);
  }

  drawWaypoints(progress, t) {
    const pts = this.waypoints;
    const totalSegs = pts.length - 1;

    pts.forEach((wp, i) => {
      const reachedP = i / totalSegs;
      const isReached = progress >= reachedP - 0.05;

      ctx.save();
      // Waypoint circle
      ctx.fillStyle = isReached ? '#d4af37' : 'rgba(100, 116, 139, 0.6)';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(wp.x, wp.y, isReached ? 8 : 5, 0, TAU);
      ctx.fill();
      ctx.stroke();

      if (isReached) {
        // Pulse ring
        const ring = ((t * 2 + i) % 1);
        ctx.strokeStyle = `rgba(212, 175, 55, ${1 - ring})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 8 + ring * 18, 0, TAU);
        ctx.stroke();

        // City label
        ctx.font = '800 17px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 6;
        ctx.fillText(wp.name, wp.x + 16, wp.y - 4);

        ctx.font = '600 13px Inter, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(wp.sub, wp.x + 16, wp.y + 14);
      }
      ctx.restore();
    });
  }

  drawSPQRStandard(x, y, t) {
    ctx.save();
    ctx.translate(x, y);

    // Glowing golden standard disc
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.6, '#d4af37');
    grad.addColorStop(1, '#92400e');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // SPQR Eagle icon
    ctx.fillStyle = '#1e1b18';
    ctx.font = '900 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPQR', 0, 1);

    ctx.restore();
  }

  drawOdometerCard(km, progress) {
    ctx.save();
    const bx = 600, by = 260, bw = 420, bh = 220;
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

    // Title
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(245, 235, 230, 0.7)';
    ctx.fillText('MILITARY EXPEDITION ODOMETER', bx + 24, by + 40);

    // Dynamic Odometer readout
    ctx.font = '900 48px Inter, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(`${km.toLocaleString()} KM`, bx + 24, by + 98);

    const romanMiles = Math.round(km * 0.676);
    ctx.font = '700 17px Inter, sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText(`(${romanMiles.toLocaleString()} ROMAN MILES)`, bx + 24, by + 128);

    // March progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(bx + 24, by + 155, 370, 10);

    const barW = progress * 370;
    const pGrad = ctx.createLinearGradient(bx + 24, 0, bx + 24 + barW, 0);
    pGrad.addColorStop(0, '#d4af37');
    pGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = pGrad;
    ctx.fillRect(bx + 24, by + 155, barW, 10);

    ctx.font = '600 15px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('SPEED: 32 KM / DAY · FORCED MARCH', bx + 24, by + 195);

    ctx.restore();
  }
}
