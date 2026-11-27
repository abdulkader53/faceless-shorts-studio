// History & Lore Documentary Proof Shot List (Revised)
// Genuine Human Character Locomotion & Environmental Interaction:
// H01: Stormy Ocean & Coastal Gale (gale spray, lens water droplets, bronze sunbeams)
// H02: Real-time Animated Military Campaign Map (point-by-point route, SPQR standard, live distance odometer)
// H03: Marching Roman Legionary Column (full-body gait kinematics, body-weight transfer, scutum/pilum swing, sagum physics)
// H04: Wading Assault on the Surf (high-knee wading gait, independent gladius stabbing strokes, shield bracing, wave interaction)
import { L, Wd } from './core/timing.js';
import { eob, seg } from './core/lib.js';
import { drawEvidencePill, drawDocumentaryCallout } from './core/documentary.js';
import { OceanWaves } from './anim/ocean_waves.js';
import { CampaignMap } from './anim/campaign_map.js';
import { MarchingLegion } from './anim/marching_legion.js';
import { WadingAssault } from './anim/wading_assault.js';

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });

  const ocean = new OceanWaves();
  const map = new CampaignMap();
  const march = new MarchingLegion();
  const assault = new WadingAssault();

  // ── Shot 1: Moving Stormy Ocean Waves & Swells (0.00s -> 3.55s) ──
  add({
    id: 'S01',
    at: 0,
    note: 'Moving stormy ocean waves across the English Channel with gale sea spray, bronze God-rays, and optical lens water droplets',
    draw(lt, d, t) {
      ocean.draw(lt, d, t);
      drawEvidencePill('HISTORICAL EXPEDITION', 'AD 40 · GESORIACUM', 540, 160, eob(seg(lt, 0.1, 0.45)));
      drawDocumentaryCallout('THE EDGE OF THE KNOWN WORLD', 540, 1420, eob(seg(lt, 0.35, 0.8)), {
        category: 'THE ENGLISH CHANNEL',
        accentColor: '#D4AF37',
      });
    }
  });
  cue(0.1, 'whoosh');
  cue(0.8, 'pop');

  // ── Shot 2: Real-time Animated Military Campaign Map (3.55s -> 6.05s) ──
  add({
    id: 'S02',
    at: 3.55,
    note: 'Point-by-point route tracing from Rome across the Alps to Gesoriacum with dynamic real-time distance odometer',
    draw(lt, d, t) {
      map.draw(lt, d, t);
      drawEvidencePill('IMPERIAL ROAD NETWORK', 'VIA AURELIA & VIA CLAUDIA', 540, 160, eob(seg(lt, 0.15, 0.55)));
      drawDocumentaryCallout('FORCED MARCH: 1,420 KM', 540, 1420, eob(seg(lt, 0.3, 0.7)), {
        category: 'ROUTE THROUGH GAUL',
        accentColor: '#EF4444',
      });
    }
  });
  cue(3.6, 'whoosh');
  cue(4.8, 'pop');

  // ── Shot 3: Marching Roman Legionary Column (6.05s -> 9.15s) ──
  add({
    id: 'S03',
    at: 6.05,
    note: 'Articulated Roman legionary marching column with full-body walking gait, body-weight transfer, scutum/pilum swinging, and fluttering sagum cloaks',
    draw(lt, d, t) {
      march.draw(lt, d, t);
      drawEvidencePill('ORDER OF BATTLE', 'ROMAN IMPERIAL ARMY', 540, 160, eob(seg(lt, 0.15, 0.55)));
      drawDocumentaryCallout('40,000 LEGIONARIES', 540, 1420, eob(seg(lt, 0.3, 0.7)), {
        category: 'RHINE CORPS MUTINY',
        accentColor: '#D4AF37',
      });
    }
  });
  cue(6.1, 'whoosh');
  cue(7.4, 'slam', { gain: 0.9 });

  // ── Shot 4: Soldiers Advancing into Breaking Surf & Thrusting Gladii (9.15s -> 12.43s) ──
  add({
    id: 'S04',
    at: 9.15,
    note: 'Legionaries physically wading into breaking surf with high-knee gait, repeatedly thrusting gladii swords into crashing wave crests with wave parting',
    draw(lt, d, t) {
      assault.draw(lt, d, t);
      drawEvidencePill('SUETONIUS · LIFE OF CALIGULA', 'CHAPTER 46', 540, 160, eob(seg(lt, 0.15, 0.55)));
      drawDocumentaryCallout('WAR AGAINST NEPTUNE', 540, 1420, eob(seg(lt, 0.3, 0.7)), {
        category: 'SPOILS OF THE OCEAN',
        accentColor: '#EF4444',
      });
    }
  });
  cue(9.2, 'whoosh');
  cue(9.8, 'slam', { gain: 1.1 });

  return { shots: S, cues: CUES };
}
