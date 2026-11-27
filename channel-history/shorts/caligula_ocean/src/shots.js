// Cinematic Illustrated Documentary Shot List: Caligula's Ocean War
// Combines archival museum imagery, cinematic historical photography,
// 2.5D Ken Burns camera drift, atmospheric particles, and scholarly annotations.
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

  // ── S01 · 40 AD: Caligula declared war on the God of the Sea ──
  add({
    id: 'S01',
    at: 0,
    note: 'Museum marble bust of young Emperor Caligula under dramatic chiaroscuro spotlight',
    draw(lt, d, t) {
      drawCinematicStill('assets/caligula_bust.jpg', lt, d, t, {
        mode: 'push_in',
        focus: [0.5, 0.38],
        zoomRange: [1.0, 1.12],
        vignette: 0.45,
        grain: 0.03,
      });
      drawAtmosphericParticles(22, t, 'rgba(245, 215, 140, 0.35)');
      drawEvidencePill('SUETONIUS: GAIUS 46', 'CHRONOLOGY OF ROME', 540, 180, eob(seg(lt, 0.1, 0.45)));
      drawDocumentaryCallout('40 A.D. · EMPEROR CALIGULA', 540, 300, eob(seg(lt, 0.4, 0.85)), {
        category: 'HISTORICAL PROFILE',
        accentColor: DOC_THEME.gold,
      });
    }
  });
  cue(0.1, 'whoosh');
  cue(Wd('40', 0), 'ding', { gain: 0.8 });
  cue(Wd('war', 0), 'stamp');

  // ── S02 · Not an invading army. The literal ocean. ──
  {
    const st = cut_(1), wo = Wd('ocean', 1) - st;
    add({
      id: 'S02',
      at: st,
      note: 'Violent tempest in the English Channel with towering green waves and frothing spray',
      draw(lt, d, t) {
        drawCinematicStill('assets/raging_storm_ocean.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.55],
          zoomRange: [1.0, 1.18],
          vignette: 0.5,
          grain: 0.04,
        });
        drawAtmosphericParticles(36, t, 'rgba(255, 255, 255, 0.5)');
        drawDocumentaryCallout('THE ENEMY: THE OCEAN', 540, 320, eob(seg(lt, 0.15, 0.55)), {
          category: 'MILITARY OBJECTIVE',
          accentColor: DOC_THEME.crimson,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wo, 'slam', { gain: 1.0 });
  }

  // ── S03 · Marched forty thousand legionaries all the way to France ──
  {
    const st = cut_(2), wsol = Wd('thousand', 2) - st;
    add({
      id: 'S03',
      at: st,
      note: 'Antique museum parchment map of Gaul with red expedition march line from Rome to Gesoriacum',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_campaign_map.jpg', lt, d, t, {
          mode: 'pan_right',
          focus: [0.5, 0.48],
          zoomRange: [1.05, 1.15],
          vignette: 0.35,
          grain: 0.03,
        });
        drawDocumentaryCallout('MARCH TO GESORIACUM', 540, 260, eob(seg(lt, 0.25, 0.65)), {
          category: 'EXPEDITION TO THE COAST',
          accentColor: DOC_THEME.gold,
        });
        drawEvidencePill('HISTORICAL REVISION', '40,000 LEGIONARIES (NOT 200,000)', 540, 380, eob(seg(lt, 0.7, 1.15)));
      }
    });
    cue(st, 'whoosh');
    cue(st + wsol, 'pop', { gain: 0.7 });
  }

  // ── S04 · Ready to cross the stormy English Channel and invade Britain ──
  {
    const st = cut_(3), wbrit = Wd('britain', 3) - st;
    add({
      id: 'S04',
      at: st,
      note: 'Roman legionaries in full armor in battle formation on the stormy coast gazing at the sea',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_legion_shore.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.5, 0.5],
          zoomRange: [1.16, 1.03],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(25, t, 'rgba(255, 255, 255, 0.4)');
        drawDocumentaryCallout('THE ENGLISH CHANNEL COAST', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'TARGET: BRITANNIA',
          accentColor: DOC_THEME.gold,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wbrit, 'ding');
  }

  // ── S05 · But when they reached the shore, Caligula suddenly changed his mind ──
  {
    const st = cut_(4), wch = Wd('changed', 4) - st;
    add({
      id: 'S05',
      at: st,
      note: 'Close crop on the grim, hesitant faces of the centurions on the beach refusing to cross',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_legion_shore.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.48, 0.42],
          zoomRange: [1.1, 1.25],
          vignette: 0.5,
          grain: 0.04,
        });
        drawEvidencePill('MILITARY CRISIS', 'LEGIONS REFUSED TO BOARD SHIPS', 540, 200, eob(seg(lt, 0.6, 1.1)));
        drawDocumentaryCallout('MUTINY AT THE WATER', 540, 320, eob(seg(lt, 0.25, 0.65)), {
          category: 'TACTICAL DISASTER',
          accentColor: DOC_THEME.crimson,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wch, 'thud', { gain: 0.9 });
  }

  // ── S06 · Declared Neptune, Lord of the Sea, Rome's mortal enemy ──
  {
    const st = cut_(5), wnep = Wd('neptune', 5) - st;
    add({
      id: 'S06',
      at: st,
      note: 'Emperor Caligula on the windswept chalk cliffs with billowing purple cloak and golden armor',
      draw(lt, d, t) {
        drawCinematicStill('assets/caligula_commanding.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.65, 0.35],
          zoomRange: [1.0, 1.14],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(20, t, 'rgba(255, 235, 190, 0.3)');
        drawDocumentaryCallout('NEPTUNE: MORTAL ENEMY', 540, 320, eob(seg(lt, 0.2, 0.6)), {
          category: 'IMPERIAL DECREE',
          accentColor: DOC_THEME.crimson,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wnep, 'slam', { gain: 1 });
  }

  // ── S07 · Ordered his legions to draw their iron swords ──
  {
    const st = cut_(6), wsw = Wd('swords', 6) - st;
    add({
      id: 'S07',
      at: st,
      note: 'Close dramatic shot of Roman iron gladius blades drawn in combat readiness',
      draw(lt, d, t) {
        drawCinematicStill('assets/legionaries_stabbing_surf.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.55, 0.45],
          zoomRange: [1.02, 1.16],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(30, t, 'rgba(255, 255, 255, 0.45)');
        drawDocumentaryCallout('DRAW IRON GLADII', 540, 280, eob(seg(lt, 0.15, 0.55)), {
          category: 'BATTLE LINE ORDERED',
          accentColor: DOC_THEME.gold,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wsw, 'stamp', { gain: 0.9 });
  }

  // ── S08 · Form a battle line and violently stab the waves ──
  {
    const st = cut_(7), wstab = Wd('stab', 7) - st;
    add({
      id: 'S08',
      at: st,
      note: 'Wide cinematic combat shot: Roman legionaries lunging into crashing surf driving swords into waves',
      draw(lt, d, t) {
        drawCinematicStill('assets/legionaries_stabbing_surf.jpg', lt, d, t, {
          mode: 'pan_left',
          focus: [0.5, 0.5],
          zoomRange: [1.0, 1.14],
          vignette: 0.45,
          grain: 0.04,
        });
        drawAtmosphericParticles(40, t, 'rgba(255, 255, 255, 0.6)');
        drawDocumentaryCallout('STABBING THE SURF', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'COMBAT WITH THE SEA',
          accentColor: DOC_THEME.crimson,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wstab, 'slam');
    cue(st + wstab + 0.15, 'splash');
  }

  // ── S09 · Catapults fired heavy boulders straight into the water ──
  {
    const st = cut_(8), wfire = Wd('fired', 8) - st;
    add({
      id: 'S09',
      at: st,
      note: 'Heavy Roman timber siege onagers hurling boulders into sea geysers on the rocky coast',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_catapult_siege.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.55, 0.48],
          zoomRange: [1.0, 1.16],
          vignette: 0.45,
          grain: 0.04,
        });
        drawAtmosphericParticles(30, t, 'rgba(255, 255, 255, 0.5)');
        drawDocumentaryCallout('BALLISTAE BOMBARDMENT', 540, 280, eob(seg(lt, 0.2, 0.6)), {
          category: 'COASTAL SIEGE ARTILLERY',
          accentColor: DOC_THEME.gold,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wfire, 'thud', { gain: 1 });
    cue(st + wfire + 0.5, 'splash');
  }

  // ── S10 · When the ocean refused to surrender ──
  {
    const st = cut_(9);
    add({
      id: 'S10',
      at: st,
      note: 'Caligula standing atop the chalk cliffs glaring down as the sea tide relentlessly rolls in',
      draw(lt, d, t) {
        drawCinematicStill('assets/caligula_commanding.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.65, 0.35],
          zoomRange: [1.15, 1.02],
          vignette: 0.5,
          grain: 0.03,
        });
        drawAtmosphericParticles(22, t, 'rgba(255, 235, 190, 0.3)');
        drawDocumentaryCallout('THE SEA WILL NOT YIELD', 540, 320, eob(seg(lt, 0.15, 0.55)), {
          category: 'DEADLOCK ON THE BEACH',
          accentColor: DOC_THEME.crimson,
        });
      }
    });
    cue(st, 'whoosh');
  }

  // ── S11 · Commanded every soldier to fill their helmets with seashells ──
  {
    const st = cut_(10), wseas = Wd('seashells', 10) - st;
    add({
      id: 'S11',
      at: st,
      note: 'Macro photograph of weathered Roman bronze helmet resting on wet sand overflowing with seashells',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_helmet_seashells.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.5],
          zoomRange: [1.0, 1.14],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(18, t, 'rgba(255, 240, 200, 0.35)');
        drawDocumentaryCallout('SEASHELLS AS PLUNDER', 540, 260, eob(seg(lt, 0.2, 0.6)), {
          category: 'ANCIENT ACCOUNTS',
          accentColor: DOC_THEME.gold,
        });
        drawEvidencePill('LATIN: CONCHAE', 'SEASHELLS... OR SAPPERS HUTS?', 540, 380, eob(seg(lt, 0.7, 1.15)));
      }
    });
    cue(st, 'whoosh');
    cue(st + wseas, 'pop', { gain: 0.8 });
    cue(st + wseas + 0.2, 'pop');
  }

  // ── S12 · Declaring them captured spoils of war from the sea ──
  {
    const st = cut_(11), wsp = Wd('spoils', 11) - st;
    add({
      id: 'S12',
      at: st,
      note: 'Macro photograph of golden imperial coin resting among wet seashells in Roman helmet',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_helmet_seashells.jpg', lt, d, t, {
          mode: 'pull_back',
          focus: [0.5, 0.52],
          zoomRange: [1.15, 1.02],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(20, t, 'rgba(255, 235, 180, 0.35)');
        drawDocumentaryCallout('SPOILS FROM NEPTUNE', 540, 300, eob(seg(lt, 0.2, 0.6)), {
          category: 'WAR BOOTY FOR ROME',
          accentColor: DOC_THEME.gold,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wsp, 'stamp', { gain: 1 });
  }

  // ── S13 · Returned to Rome in a grand triumph ──
  {
    const st = cut_(12), wtr = Wd('triumph', 12) - st;
    add({
      id: 'S13',
      at: st,
      note: 'Caligula in golden quadriga chariot under massive marble triumphal arch with laurel petal rain',
      draw(lt, d, t) {
        drawCinematicStill('assets/roman_triumph_parade.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.48],
          zoomRange: [1.0, 1.14],
          vignette: 0.4,
          grain: 0.03,
        });
        drawAtmosphericParticles(32, t, 'rgba(255, 215, 60, 0.45)');
        drawDocumentaryCallout('MOCK TRIUMPH IN ROME', 540, 260, eob(seg(lt, 0.2, 0.6)), {
          category: 'IMPERIAL PROCESSION',
          accentColor: DOC_THEME.gold,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wtr, 'sparkle', { gain: 0.8 });
  }

  // ── S14 · Celebrating the day Rome conquered the ocean (Scholarly Verdict) ──
  {
    const st = cut_(13), wconq = Wd('conquered', 13) - st;
    add({
      id: 'S14',
      at: st,
      note: 'Marble bust of Emperor Caligula delivering the modern historical insight: madness vs satirical punishment',
      draw(lt, d, t) {
        drawCinematicStill('assets/caligula_bust.jpg', lt, d, t, {
          mode: 'push_in',
          focus: [0.5, 0.38],
          zoomRange: [1.0, 1.15],
          vignette: 0.45,
          grain: 0.03,
        });
        drawAtmosphericParticles(25, t, 'rgba(245, 215, 140, 0.35)');
        drawEvidencePill('HISTORICAL VERDICT', 'SATIRICAL PUNISHMENT OF MUTINOUS LEGIONS', 540, 200, eob(seg(lt, 0.1, 0.5)));
        drawDocumentaryCallout('MADNESS OR MASTERCLASS?', 540, 320, eob(seg(lt, 0.4, 0.85)), {
          category: 'ROME CONQUERED THE OCEAN',
          accentColor: DOC_THEME.gold,
        });
      }
    });
    cue(st, 'whoosh');
    cue(st + wconq, 'ding', { gain: 1 });
  }

  return { shots: S, cues: CUES };
}
