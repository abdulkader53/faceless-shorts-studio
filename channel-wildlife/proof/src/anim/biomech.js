// 3D Biomechanical Spring-and-Latch Breakdown in Three.js
// Scientific documentary CAD visualization:
// 1. FEA (Finite Element Analysis) wireframe stress visualization
// 2. Hyperbolic paraboloid saddle spring flexure & mechanical stress heatmap (0 -> 420 MPa)
// 3. Extensor muscle contraction & sclerotized latch apodeme slip release
// 4. Ballistic 10,400 G dactyl club rotational strike
// 5. Studio lighting rig with technical caliper grid and live telemetry graph
import * as THREE from 'three';
import { ctx, W, H, TAU, lerp, clamp, eo, eio } from '../core/lib.js';

export class Biomech3D {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1080;
    this.canvas.height = 1920;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(1080, 1920);
    this.renderer.setPixelRatio(1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.1, 100);
    this.camera.position.set(0, 0.8, 8.2);

    this.setupLighting();
    this.buildStudioStage();
    this.buildArmAnatomy();
  }

  setupLighting() {
    const amb = new THREE.AmbientLight(0x0e1b24, 1.4);
    this.scene.add(amb);

    const key = new THREE.DirectionalLight(0x38bdf8, 2.8);
    key.position.set(6, 8, 7);
    this.scene.add(key);

    const warmFill = new THREE.DirectionalLight(0xf59e0b, 1.8);
    warmFill.position.set(-6, -3, 4);
    this.scene.add(warmFill);

    const rim = new THREE.DirectionalLight(0xffffff, 2.2);
    rim.position.set(0, 6, -6);
    this.scene.add(rim);
  }

  buildStudioStage() {
    // Technical floor measurement grid
    const grid = new THREE.GridHelper(12, 24, 0x38bdf8, 0x1e293b);
    grid.position.y = -3.2;
    this.scene.add(grid);

    // Subtle measurement ring
    const ringGeo = new THREE.RingGeometry(2.8, 2.85, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -3.18;
    this.scene.add(ring);
  }

  buildArmAnatomy() {
    this.armRoot = new THREE.Group();
    this.scene.add(this.armRoot);

    // 1. Merus (Rigid Arm Chitin Base Chassis)
    const merusMat = new THREE.MeshStandardMaterial({
      color: 0x1b2836,
      metalness: 0.45,
      roughness: 0.35,
    });
    const merusGeo = new THREE.CylinderGeometry(0.65, 0.85, 3.8, 24);
    this.merus = new THREE.Mesh(merusGeo, merusMat);
    this.merus.position.set(-1.1, 0.1, 0);
    this.merus.rotation.z = -0.42;
    this.armRoot.add(this.merus);

    // Gold reinforcement bands
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    for (let i = -1.3; i <= 1.3; i += 0.85) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.045, 12, 32), bandMat);
      band.position.set(-1.1 - i * 0.38, 0.1 + i * 0.9, 0);
      band.rotation.x = Math.PI / 2;
      this.armRoot.add(band);
    }

    // 2. Extensor Muscle Bundle (Striated contracting fibers)
    this.muscleGroup = new THREE.Group();
    this.muscleGroup.position.set(-0.7, 0.3, 0.35);
    this.muscleGroup.rotation.z = -0.42;
    this.armRoot.add(this.muscleGroup);

    const fiberMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.5,
      emissive: 0x881337,
      emissiveIntensity: 0.35,
    });
    for (let f = 0; f < 5; f++) {
      const ang = (f / 5) * Math.PI * 2;
      const r = 0.18;
      const fiber = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.8, 12), fiberMat);
      fiber.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      this.muscleGroup.add(fiber);
    }

    // 3. Hyperbolic Paraboloid Saddle Spring
    // Parametric curvature z = (x^2 / a^2) - (y^2 / b^2)
    const saddleGeo = new THREE.PlaneGeometry(2.1, 2.7, 32, 32);
    const pos = saddleGeo.attributes.position;
    this.originalSaddleZ = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = (x * x * 0.42) - (y * y * 0.32);
      pos.setZ(i, z);
      this.originalSaddleZ[i] = z;
    }
    saddleGeo.computeVertexNormals();

    this.saddleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.55,
      roughness: 0.28,
      side: THREE.DoubleSide,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
    });
    this.saddle = new THREE.Mesh(saddleGeo, this.saddleMat);
    this.saddle.position.set(0.15, 1.35, 0.2);
    this.saddle.rotation.y = 0.28;
    this.armRoot.add(this.saddle);

    // FEA Wireframe Overlay on Saddle Spring
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, wireframe: true, transparent: true, opacity: 0.4 });
    this.saddleWire = new THREE.Mesh(saddleGeo, wireMat);
    this.saddle.add(this.saddleWire);

    // 4. Carpus Joint & Sclerotized Latch
    this.carpusGroup = new THREE.Group();
    this.carpusGroup.position.set(0.55, 2.25, 0);
    this.armRoot.add(this.carpusGroup);

    const latchMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.75,
      roughness: 0.3,
      emissive: 0xb45309,
      emissiveIntensity: 0.2,
    });
    this.latch = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.45), latchMat);
    this.latch.position.set(-0.22, -0.18, 0.18);
    this.carpusGroup.add(this.latch);

    // 5. Dactyl Club (Impact weapon)
    this.dactylGroup = new THREE.Group();
    this.carpusGroup.add(this.dactylGroup);

    // Arm shaft
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      metalness: 0.3,
      roughness: 0.35,
    });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.5, 20), shaftMat);
    shaft.position.set(0, -1.15, 0);
    this.dactylGroup.add(shaft);

    // Mineralized hydroxyapatite impact hammer
    const hammerMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 0.6,
    });
    const hammer = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 24), hammerMat);
    hammer.scale.set(1.25, 0.95, 1.05);
    hammer.position.set(0.22, -2.3, 0);
    this.dactylGroup.add(hammer);
  }

  draw(lt, d, t) {
    const tRel = 2.45;
    let stressMpa = 0;
    let gForce = 0;

    if (lt < tRel) {
      // Loading phase (Muscle contracts, spring flexes)
      const p = clamp(lt / (tRel - 0.2));
      const eased = eio(p);
      stressMpa = eased * 420;
      gForce = eased * 180;

      // Saddle spring deformation
      const pos = this.saddle.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const origZ = this.originalSaddleZ[i];
        pos.setZ(i, origZ - eased * 0.42);
      }
      this.saddle.geometry.computeVertexNormals();
      pos.needsUpdate = true;

      // FEA Stress Heatmap (Cyan -> Amber -> Fiery Crimson)
      if (stressMpa < 180) {
        this.saddleMat.color.setHex(0x38bdf8);
        this.saddleMat.emissive.setHex(0x0284c7);
      } else if (stressMpa < 320) {
        this.saddleMat.color.setHex(0xfbbf24);
        this.saddleMat.emissive.setHex(0xd97706);
      } else {
        this.saddleMat.color.setHex(0xef4444);
        this.saddleMat.emissive.setHex(0xb91c1c);
      }

      // Muscle bulges
      this.muscleGroup.scale.set(1 + eased * 0.35, 1 - eased * 0.12, 1 + eased * 0.35);

      this.latch.rotation.z = eased * 0.08;
      this.dactylGroup.rotation.z = -eased * 0.12;
    } else {
      // Release phase (Latch slips, 10,400 G ballistic arc)
      const after = lt - tRel;
      const strikeP = clamp(after / 0.12);
      const strikeAngle = eo(strikeP) * 1.55;

      if (after < 0.15) {
        const spike = Math.sin((after / 0.15) * Math.PI);
        gForce = 180 + spike * 10220; // 10,400 G!
        stressMpa = 420 * (1 - strikeP);
      } else {
        const ring = Math.exp(-(after - 0.15) * 8) * Math.sin((after - 0.15) * 35);
        gForce = 80 + ring * 250;
        stressMpa = 20 + Math.abs(ring) * 35;
      }

      // Spring snaps flat
      const pos = this.saddle.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, this.originalSaddleZ[i]);
      }
      this.saddle.geometry.computeVertexNormals();
      pos.needsUpdate = true;

      this.saddleMat.color.setHex(0x0284c7);
      this.saddleMat.emissive.setHex(0x0369a1);

      this.latch.rotation.z = 0.85;
      this.latch.position.x = -0.52;
      this.dactylGroup.rotation.z = strikeAngle;
    }

    // Slow orbital rotation for 3D depth
    this.armRoot.rotation.y = Math.sin(t * 0.7) * 0.22;
    this.armRoot.rotation.x = 0.12 + Math.cos(t * 0.5) * 0.08;

    // Draw documentary studio background gradient
    const bgGrad = ctx.createRadialGradient(540, 960, 200, 540, 960, 1100);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.6, '#090d16');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
    ctx.drawImage(this.canvas, 0, 0);

    // Draw Scientific HUD & Live Dynamic Curve
    this.drawScientificHUD(lt, d, gForce, stressMpa, lt >= tRel);
  }

  drawScientificHUD(lt, d, gForce, stressMpa, released) {
    ctx.save();

    // 1. Sleek Technical Telemetry Card (Top Right)
    const bx = 600, by = 260, bw = 420, bh = 240;
    ctx.fillStyle = 'rgba(10, 16, 26, 0.86)';
    ctx.strokeStyle = released ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Corner brackets
    ctx.fillStyle = released ? '#ef4444' : '#38bdf8';
    ctx.fillRect(bx, by, 14, 3);
    ctx.fillRect(bx, by, 3, 14);
    ctx.fillRect(bx + bw - 14, by + bh - 3, 14, 3);
    ctx.fillRect(bx + bw - 3, by + bh - 14, 3, 14);

    // Title
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('BIOMECHANICAL TELEMETRY', bx + 24, by + 38);

    // G-Force Readout
    ctx.font = '900 46px Inter, sans-serif';
    ctx.fillStyle = released && gForce > 5000 ? '#ef4444' : '#facc15';
    ctx.fillText(`${Math.round(gForce).toLocaleString()} G`, bx + 24, by + 94);

    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('PEAK ACCELERATION (STRIKE)', bx + 24, by + 124);

    // Live Acceleration Curve Graph
    this.drawMiniGraph(bx + 24, by + 142, 370, 75, lt, released);

    // 2. 3D Anatomical Callout Pointers (All 4 functional components clearly annotated)
    this.drawCallout3D(this.saddle.position, 'SADDLE SPRING', 'ELASTIC CHITIN ENERGY STORAGE', -260, -90);
    this.drawCallout3D(this.latch.position, 'SCLEROTIZED LATCH', 'MECHANICAL APODEME LOCK', 110, -40);
    this.drawCallout3D(this.dactylGroup.children[1].position, 'DACTYL CLUB', 'IMPACT HAMMER', 80, 50);
    this.drawCallout3D(this.muscleGroup.position, 'EXTENSOR MUSCLE', 'FORCE LOADING SYSTEM', -260, 40);

    ctx.restore();
  }

  drawMiniGraph(gx, gy, gw, gh, lt, released) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(gx, gy, gw, gh);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let y = gy + 15; y < gy + gh; y += 20) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();
    }

    // Dynamic curve
    ctx.strokeStyle = released ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const tRel = 2.45;
    const pts = 40;
    for (let i = 0; i < pts; i++) {
      const ptT = (i / pts) * (lt);
      const x = gx + (i / pts) * gw;
      let val = 0;
      if (ptT < tRel) {
        val = eio(clamp(ptT / tRel)) * 0.15;
      } else {
        const after = ptT - tRel;
        if (after < 0.15) {
          val = 0.15 + Math.sin((after / 0.15) * Math.PI) * 0.8;
        } else {
          val = 0.08 + Math.exp(-(after - 0.15) * 6) * 0.25;
        }
      }
      const y = gy + gh - val * (gh - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current point dot
    const curX = gx + gw;
    const curY = gy + gh - (released ? 0.75 : 0.15) * (gh - 10) - 5;
    ctx.fillStyle = released ? '#ef4444' : '#facc15';
    ctx.beginPath(); ctx.arc(curX, curY, 4, 0, TAU); ctx.fill();

    ctx.restore();
  }

  drawCallout3D(pos3D, title, subtitle, offX, offY) {
    const v = pos3D.clone();
    this.armRoot.localToWorld(v);
    v.project(this.camera);

    const sx = ((v.x + 1) * 0.5) * 1080;
    const sy = ((-v.y + 1) * 0.5) * 1920;

    if (v.z < 0 || v.z > 1) return;

    const tx = clamp(sx + offX, 60, 760);
    const ty = clamp(sy + offY, 420, 1380);
    const boxW = 250, boxH = 48;

    ctx.save();
    // Leader line from 3D tracked joint to callout badge
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3D Anchor Dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, TAU); ctx.fill();

    // Callout Badge Box
    ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(tx, ty - boxH * 0.5, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Left accent pill on badge
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(tx, ty - boxH * 0.5 + 4, 3.5, boxH - 8);

    ctx.textAlign = 'left';
    ctx.font = '800 15px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, tx + 14, ty - 4);

    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitle, tx + 14, ty + 15);

    ctx.restore();
  }
}
