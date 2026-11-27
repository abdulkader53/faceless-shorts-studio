// Wild Anatomy Documentary Shot List: The Mantis Shrimp Cavitation Strike
// Macro wildlife cinematography, fluid dynamics visualizations,
// biomechanical metrics, and scientific evidence badges.
import { L, Wd } from './core/timing.js';
import {
  DOC_THEME,
  drawCinematicStill,
  drawDocumentaryCallout,
  drawEvidencePill,
  drawAtmosphericParticles,
} from './core/documentary.js';
import { eob, seg, clamp } from './core/lib.js';

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut_ = (i) => (i === 0 ? 0 : L(i) - 0.08);

  // ── S01 · Fastest punch in animal kingdom ──
  add({
    id: 'S01',
    at: 0,
    note: 'Macro portrait of Peacock Mantis Shrimp on coral showing compound trinocular eyes and dactyl clubs',
    draw(lt, d, t) {
      drawCinematicStill('assets/mantis_shrimp_hero.jpg', lt, d, t, {
        mode: 'push_in',
        focus: [0.5, 0.45],
        zoomRange: [1.0, 1.14],
        vignette: 0.45,
        grain: 0.02,
      });
      drawAtmosphericParticles(25, t, 'rgba(120, 240, 220, 0.4)');
      drawEvidencePill('SPECIES PROFILE', 'ODONTODACTYLUS SCYLLARUS', 540, 180, eob(seg(lt, 0.1, 0.45)));
      drawDocumentaryCallout('FASTEST STRIKE IN NATURE', 540, 300, eob(seg(lt, 0.35, 0.8)), {
        category: 'BIOMECHANICAL WEAPON',
        accentColor: '#4FD1E8',
      });
    }
  });
  cue(0.1, 'whoosh');
  cue(Wd('fastest', 0), 'pop');

  // ── S02 · Accelerating faster than a bullet ──
  {
    const st = cut_(1), wbul = Wd('bullet', 1) - st;
    add({
      id: 'S02',
      at: st,
      note: 'Extreme macro zoom into the folded armored dactyl clubs',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_hero.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.58],
          zoomRange: [1.14, 1.28],
          vignette: 0.5,
          grain: 0.03,
        });
        drawAtmosphericParticles(30, t, 'rgba(100, 255, 230, 0.45)');
        drawDocumentaryCallout('ACCELERATION: 10,400 G', 540, 320, eob(seg(lt, 0.2, 0.6)), {
          category: 'BALLISTIC LAUNCH',
          accentColor: '#FFD43B',
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wbul, 'slam', { gain: 0.9 });
  }

  // ── S03 · Strike with over 10,000 Gs of acceleration ──
  {
    const st = cut_(2);
    add({
      id: 'S03',
      at: st,
      note: 'High-speed action: Mantis shrimp striking forward hitting crab shell with expanding bubble',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_strike.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.55, 0.48],
          zoomRange: [1.16, 1.04],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(35, t, 'rgba(180, 240, 255, 0.5)');
        drawEvidencePill('PATEK ET AL. (2004)', 'JOURNAL OF EXP. BIOLOGY', 540, 200, eob(seg(lt, 0.15, 0.55)));
        drawDocumentaryCallout('PEAK ACCELERATION: 10,400 G', 540, 320, eob(seg(lt, 0.4, 0.8)), {
          category: 'SPRING-LOADED SADDLE',
          accentColor: '#FFD43B',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S04 · 50 miles per hour in less than 3 milliseconds ──
  {
    const st = cut_(3);
    add({
      id: 'S04',
      at: st,
      note: 'Macro focus on the impact zone and luminous cavitation bubble',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_strike.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.62, 0.5],
          zoomRange: [1.06, 1.2],
          vignette: 0.5,
          grain: 0.03,
        });
        drawAtmosphericParticles(30, t, 'rgba(200, 255, 255, 0.5)');
        drawDocumentaryCallout('VELOCITY: 23 M/S (51 MPH)', 540, 300, eob(seg(lt, 0.2, 0.6)), {
          category: 'UNDERWATER SPEED',
          accentColor: '#4FD1E8',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S05 · Club moves so fast it rips water molecules apart ──
  {
    const st = cut_(4);
    add({
      id: 'S05',
      at: st,
      note: 'Macro shockwave ripples as water is vaporized by extreme negative pressure',
      draw(lt, d, t) {
        drawCinematicStill('assets/cavitation_bubble_collapse.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.5, 0.5],
          zoomRange: [1.18, 1.05],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(25, t, 'rgba(255, 255, 255, 0.5)');
        drawDocumentaryCallout('FLUID VAPORIZATION', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'HYDRODYNAMIC SHEAR',
          accentColor: '#4FD1E8',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S06 · Creating extreme low-pressure cavitation bubbles ──
  {
    const st = cut_(5);
    add({
      id: 'S06',
      at: st,
      note: 'Cavitation vapor bubble expanding at the strike locus',
      draw(lt, d, t) {
        drawCinematicStill('assets/cavitation_bubble_collapse.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.5],
          zoomRange: [1.05, 1.18],
          vignette: 0.45,
          grain: 0.03,
        });
        drawEvidencePill('HYDRODYNAMICS', 'VAPOR CAVITATION BUBBLE', 540, 200, eob(seg(lt, 0.1, 0.45)));
        drawDocumentaryCallout('CAVITATION ZONE', 540, 320, eob(seg(lt, 0.35, 0.75)), {
          category: 'SUB-ATMOSPHERIC PRESSURE',
          accentColor: '#4FD1E8',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S07 · When these vacuum bubbles instantly collapse ──
  {
    const st = cut_(6);
    add({
      id: 'S07',
      at: st,
      note: 'Violent inward collapse of the cavitation bubble under ocean hydrostatic pressure',
      draw(lt, d, t) {
        drawCinematicStill('assets/cavitation_bubble_collapse.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.5],
          zoomRange: [1.12, 1.28],
          vignette: 0.5,
          grain: 0.04,
        });
        drawAtmosphericParticles(35, t, 'rgba(255, 220, 150, 0.6)');
        drawDocumentaryCallout('IMPLOSION DYNAMICS', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'HYDROSTATIC COLLAPSE',
          accentColor: '#D62839',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S08 · They generate temperatures exceeding 8,000°F ──
  {
    const st = cut_(7), wtemp = Wd('thousand', 7) - st;
    add({
      id: 'S08',
      at: st,
      note: 'Core thermal plasma ignition: temperatures reach 4,700 Kelvin at the collapse center',
      draw(lt, d, t) {
        drawCinematicStill('assets/cavitation_bubble_collapse.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.5, 0.5],
          zoomRange: [1.25, 1.08],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(40, t, 'rgba(255, 240, 160, 0.65)');
        drawDocumentaryCallout('COLLAPSE TEMP: 8,000°F (4,700 K)', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'THERMAL FLASH',
          accentColor: '#FFD43B',
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wtemp, 'slam', { gain: 1.0 });
  }

  // ── S09 · Nearly as hot as the surface of the sun ──
  {
    const st = cut_(8);
    add({
      id: 'S09',
      at: st,
      note: 'Comparison with solar surface temperature: 5,778 K vs 4,700 K',
      draw(lt, d, t) {
        drawCinematicStill('assets/cavitation_bubble_collapse.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.5],
          zoomRange: [1.08, 1.22],
          vignette: 0.45,
          grain: 0.03,
        });
        drawEvidencePill('SOLAR COMPARISON', 'SURFACE OF SUN: ~9,900°F', 540, 200, eob(seg(lt, 0.1, 0.45)));
        drawDocumentaryCallout('SOLAR LEVEL THERMODYNAMICS', 540, 320, eob(seg(lt, 0.35, 0.75)), {
          category: 'EXTREME PHENOMENON',
          accentColor: '#FFD43B',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S10 · Releasing a shockwave and micro-flash of light ──
  {
    const st = cut_(9);
    add({
      id: 'S10',
      at: st,
      note: 'Sonoluminescence: light emission from acoustic cavitation bubble collapse',
      draw(lt, d, t) {
        drawCinematicStill('assets/cavitation_bubble_collapse.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.5, 0.5],
          zoomRange: [1.2, 1.05],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(30, t, 'rgba(180, 240, 255, 0.6)');
        drawEvidencePill('SONOLUMINESCENCE', 'EMISSION OF PICOPHOSPHORESCENCE', 540, 200, eob(seg(lt, 0.15, 0.55)));
        drawDocumentaryCallout('ACOUSTIC SHOCKWAVE', 540, 320, eob(seg(lt, 0.4, 0.8)), {
          category: 'LIGHT & SOUND WAVE',
          accentColor: '#4FD1E8',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S11 · Even if the shrimp misses the target completely ──
  {
    const st = cut_(10);
    add({
      id: 'S11',
      at: st,
      note: 'The shockwave radiates forward even on a near-miss',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_strike.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.6, 0.52],
          zoomRange: [1.02, 1.15],
          vignette: 0.5,
          grain: 0.03,
        });
        drawAtmosphericParticles(25, t, 'rgba(180, 240, 255, 0.4)');
        drawDocumentaryCallout('SECONDARY WEAPON', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'REMOTE BLAST RADIUS',
          accentColor: '#D62839',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S12 · Shockwave alone shatters heavy crab armor ──
  {
    const st = cut_(11);
    add({
      id: 'S12',
      at: st,
      note: 'Crab carapace cracking under hydrostatic blast pressure',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_strike.jpg', lt, d, t, {
          mode: 'pan_right',
          focus: [0.55, 0.5],
          zoomRange: [1.12, 1.22],
          vignette: 0.5,
          grain: 0.04,
        });
        drawAtmosphericParticles(35, t, 'rgba(255, 255, 255, 0.5)');
        drawDocumentaryCallout('CARAPACE SHATTERED', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'IMPACT OVERPRESSURE',
          accentColor: '#D62839',
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + 0.3, 'slam');
  }

  // ── S13 · Delivering two devastating impacts in a single strike ──
  {
    const st = cut_(12);
    add({
      id: 'S13',
      at: st,
      note: 'Impact 1: Dactyl club (1,500 N) + Impact 2: Cavitation collapse shockwave (500 N)',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_strike.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.5, 0.5],
          zoomRange: [1.18, 1.05],
          vignette: 0.45,
          grain: 0.03,
        });
        drawEvidencePill('DUAL IMPACT', '1. PHYSICAL STRIKE · 2. CAVITATION WAVE', 540, 200, eob(seg(lt, 0.15, 0.55)));
        drawDocumentaryCallout('TWO IMPACTS IN ONE', 540, 320, eob(seg(lt, 0.35, 0.75)), {
          category: 'LETHAL COMBINATION',
          accentColor: '#FFD43B',
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S14 · Nature's deadliest underwater boxer ──
  {
    const st = cut_(13);
    add({
      id: 'S14',
      at: st,
      note: 'Majestic macro hero view of the Peacock Mantis Shrimp in all its kaleidoscopic armor',
      draw(lt, d, t) {
        drawCinematicStill('assets/mantis_shrimp_hero.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.45],
          zoomRange: [1.0, 1.15],
          vignette: 0.45,
          grain: 0.02,
        });
        drawAtmosphericParticles(30, t, 'rgba(120, 240, 220, 0.45)');
        drawEvidencePill('APEX CRUSTACEAN', 'EVOLUTIONARY PEAK BIOMECHANICS', 540, 200, eob(seg(lt, 0.15, 0.55)));
        drawDocumentaryCallout('UNDERWATER HEAVYWEIGHT', 540, 320, eob(seg(lt, 0.35, 0.8)), {
          category: 'NATURE\'S DEADLIEST STRIKE',
          accentColor: '#4FD1E8',
        });
      }
    });
    cue(st, 'whoosh');
  }

  return { shots: S, cues: CUES };
}
