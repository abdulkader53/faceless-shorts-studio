// Wild Anatomy Documentary Proof Shot List (Revised)
// Genuine Animal Locomotion & Appendage Articulation:
// S01: Articulated Peacock Mantis Shrimp (locomotion, 6 segmented somites, 3 leg pairs, pleopods, eyes)
// S02: 3D Biomechanical Breakdown in Three.js (hyperbolic saddle spring, stress heatmap, latch release, 10,400 G whip)
// S03: Coordinated Strike Event (animal lunges, dactyl whips, crab prey recoils, cavitation bubble nucleates)
// S04: Progressive Bubble Collapse (expansion -> hypersonic collapse -> 4,700 K sonoluminescence -> shockwaves & fracture)
import { L, Wd } from './core/timing.js';
import { eob, seg } from './core/lib.js';
import { drawEvidencePill, drawDocumentaryCallout } from './core/documentary.js';
import { ArticulatedMantis } from './anim/creature_rig.js';
import { Biomech3D } from './anim/biomech.js';
import { StrikeEvent } from './anim/strike_event.js';
import { ProgressiveImplosion } from './anim/progressive_implosion.js';

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });

  const creature = new ArticulatedMantis();
  const biomech = new Biomech3D();
  const strike = new StrikeEvent();
  const implosion = new ProgressiveImplosion();

  // ── S01: Genuinely Moving Peacock Mantis Shrimp (0.00s -> 3.65s) ──
  add({
    id: 'S01',
    at: 0,
    note: 'Articulated Peacock Mantis Shrimp with segmented abdominal locomotion, 3 pairs of stepping walking legs, flaring antennal scales, and peduncle eye saccades',
    draw(lt, d, t) {
      creature.draw(lt, d, t);
      drawEvidencePill('SPECIES PROFILE', 'ODONTODACTYLUS SCYLLARUS', 540, 160, eob(seg(lt, 0.1, 0.45)));
      drawDocumentaryCallout('FASTEST STRIKE IN NATURE', 540, 1420, eob(seg(lt, 0.35, 0.8)), {
        category: 'BIOMECHANICAL WEAPON',
        accentColor: '#4FD1E8',
      });
    }
  });
  cue(0.1, 'whoosh');
  cue(0.8, 'pop');

  // ── S02: 3D Anatomical Spring & Latch Mechanism (3.65s -> 7.52s) ──
  add({
    id: 'S02',
    at: 3.65,
    note: '3D Biomechanical Breakdown: Saddle spring flexes under extensor muscle strain, stress shifts to 420 MPa, latch slips open with 10,400 G whip',
    draw(lt, d, t) {
      biomech.draw(lt, d, t);
      drawEvidencePill('PATEK ET AL. (2004)', 'JOURNAL OF EXP. BIOLOGY', 540, 160, eob(seg(lt, 0.15, 0.55)));
      drawDocumentaryCallout('SPRING-LOADED SADDLE', 540, 1420, eob(seg(lt, 0.3, 0.7)), {
        category: 'ELASTIC ENERGY STORAGE',
        accentColor: '#FACC15',
      });
    }
  });
  cue(3.7, 'whoosh');
  cue(6.1, 'slam', { gain: 1.0 });

  // ── S03: Coordinated Strike Event (7.52s -> 10.45s) ──
  add({
    id: 'S03',
    at: 7.52,
    note: 'Mantis shrimp lunges forward, dactyl whips through 120-degree arc, crab prey recoils backward, and cavitation vapor bubble nucleates at contact',
    draw(lt, d, t) {
      strike.draw(lt, d, t);
      drawEvidencePill('FLUID DYNAMICS', 'HYDRODYNAMIC CAVITATION', 540, 160, eob(seg(lt, 0.15, 0.55)));
      drawDocumentaryCallout('WATER VAPORIZATION', 540, 1420, eob(seg(lt, 0.3, 0.7)), {
        category: 'PRESSURE DROP < PVAP',
        accentColor: '#38BDF8',
      });
    }
  });
  cue(7.6, 'whoosh');
  cue(8.5, 'pop');

  // ── S04: Progressive Bubble Collapse & Sonoluminescence (10.45s -> 14.47s) ──
  add({
    id: 'S04',
    at: 10.45,
    note: 'Progressive cavitation collapse: maximum expansion -> hypersonic collapse -> 4,700 K sonoluminescence flash -> 1,500 m/s shockwaves & shell fracture',
    draw(lt, d, t) {
      implosion.draw(lt, d, t);
      drawEvidencePill('SONOLUMINESCENCE', 'ACOUSTIC CAVITATION COLLAPSE', 540, 160, eob(seg(lt, 0.15, 0.55)));
      drawDocumentaryCallout('8,000°F THERMAL BURST', 540, 1420, eob(seg(lt, 0.3, 0.7)), {
        category: 'PLASMA FLASH & SHOCKWAVE',
        accentColor: '#EF4444',
      });
    }
  });
  cue(10.5, 'whoosh');
  cue(10.9, 'slam', { gain: 1.2 });

  return { shots: S, cues: CUES };
}
