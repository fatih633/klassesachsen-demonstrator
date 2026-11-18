// Datenmodell des Demonstrators – ausschließlich auf Gruppenebene (Anlage 2, G1).
// Es gibt keine Datensätze zu einzelnen Kindern, keine Namen, keine Geräte-IDs, keine Standorte.
// Erfasst werden je Gruppe nur grobe Ereignisse (E1–E10 in Demo-Form), und nur dann,
// wenn die Lehrkraft die Quest für eine Lerngruppe der Kernzielgruppe (Klasse 4–10) freigegeben hat.

import { lesen, schreiben } from './speicher.js';
import { alleSpiele, spiel as holeSpiel, ORTE } from './inhalt.js';

const TAG = 24 * 60 * 60 * 1000;
export const AUFBEWAHRUNG_TAGE = 84; // 12 Wochen nach Abschluss (Anlage 2, 4.4 Abs. 1)
export const ROLLEN = ['navigation', 'protokoll', 'recherche'];
export const ROLLEN_NAME = { navigation: 'Navigation', protokoll: 'Protokoll', recherche: 'Recherche' };

export const VORSCHLAEGE = ['Fuchs', 'Eule', 'Dachs', 'Biber', 'Luchs', 'Igel', 'Specht', 'Otter',
  'Kobaltblau', 'Silbergrau', 'Kerzengelb', 'Tannengrün', 'Kompass', 'Laterne', 'Fernrohr', 'Anker'];

function neueId(praefix) {
  const z = new Uint32Array(2);
  (window.crypto || window.msCrypto).getRandomValues(z);
  return `${praefix}-${z[0].toString(36)}${z[1].toString(36)}`.slice(0, 16);
}

function schuljahrEnde(jetzt = new Date()) {
  const jahr = jetzt.getMonth() >= 7 ? jetzt.getFullYear() + 1 : jetzt.getFullYear();
  return new Date(jahr, 6, 31, 23, 59, 59).getTime();
}

// ---------- Gruppen (F1) ----------
export function gruppen() { return lesen('gruppen', []) || []; }
function speichereGruppen(liste) { schreiben('gruppen', liste); melde(); }
export function gruppe(id) { return gruppen().find((g) => g.id === id) || null; }

function aendereGruppe(id, fn) {
  const liste = gruppen();
  const g = liste.find((x) => x.id === id);
  if (!g) return null;
  fn(g);
  speichereGruppen(liste);
  return g;
}

export function gruppeAnlegen(bezeichnung, extra = {}) {
  const g = {
    id: neueId('g'),
    bezeichnung: String(bezeichnung).trim().slice(0, 40),
    angelegt: Date.now(),
    schuljahrEnde: schuljahrEnde(),
    freigabe: null,
    stationen: {},
    offline: [],
    fortschritt: { items: [], beweise: {} },
    raster: { team: null, problem: null, beteiligung: null },
    entwurf: null,
    abgeschlossenAm: null,
    ...extra,
  };
  speichereGruppen([...gruppen(), g]);
  return g;
}

export function gruppeUmbenennen(id, neu) {
  return aendereGruppe(id, (g) => { g.bezeichnung = String(neu).trim().slice(0, 40); });
}

/** Vorzeitige Löschung (F8). Entfernt die Gruppe mit allen Beobachtungen und Bildbeiträgen. */
export function gruppeLoeschen(id) {
  speichereGruppen(gruppen().filter((g) => g.id !== id));
  schreiben('beitraege', beitraege().filter((b) => b.gruppeId !== id));
  const p = profil();
  if (p.typ === 'gruppe' && p.id === id) profilSetzen({ typ: 'frei' });
}

// ---------- Freigabe (F2) ----------
export const KERN_STUFEN = ['4', '5', '6', '7', '8', '9', '10'];
export function istKern(klassenstufe) { return KERN_STUFEN.includes(String(klassenstufe)); }

export function freigabeSetzen(id, { orte, klassenstufe, einwilligung }) {
  return aendereGruppe(id, (g) => {
    g.freigabe = {
      orte: ORTE.filter((o) => orte.includes(o)),
      klassenstufe: String(klassenstufe),
      kern: istKern(klassenstufe),
      einwilligung: !!einwilligung,
      am: Date.now(),
    };
    if (!g.freigabe.kern) { g.stationen = {}; g.offline = []; }
  });
}

export function freigegebeneOrte(g) {
  return g && g.freigabe ? g.freigabe.orte : [];
}

// ---------- Profil (wer spielt gerade?) ----------
export function profil() { return lesen('profil', { typ: 'frei' }) || { typ: 'frei' }; }
export function profilSetzen(p) { schreiben('profil', p); melde(); }

export function aktuelleGruppe() {
  const p = profil();
  return p.typ === 'gruppe' ? gruppe(p.id) : null;
}

/** Wird beobachtet? Nur bei freigegebener Gruppe der Kernzielgruppe. */
export function erfassungAktiv() {
  const g = aktuelleGruppe();
  return !!(g && g.freigabe && g.freigabe.kern);
}

/** Orte, die das aktuelle Profil spielen darf (freies Spiel: alle). */
export function spielbareOrte() {
  const g = aktuelleGruppe();
  return g ? freigegebeneOrte(g) : [...ORTE];
}

// ---------- Fortschritt (Album, Stationen) ----------
export function fortschritt() {
  const g = aktuelleGruppe();
  if (g) return g.fortschritt || { items: [], beweise: {} };
  return lesen('frei', { items: [], beweise: {} }) || { items: [], beweise: {} };
}

function aendereFortschritt(fn) {
  const p = profil();
  if (p.typ === 'gruppe' && gruppe(p.id)) {
    aendereGruppe(p.id, (g) => { g.fortschritt = g.fortschritt || { items: [], beweise: {} }; fn(g.fortschritt); });
  } else {
    const f = lesen('frei', { items: [], beweise: {} }) || { items: [], beweise: {} };
    fn(f);
    schreiben('frei', f);
    melde();
  }
}

export function itemVergeben(itemId) {
  aendereFortschritt((f) => { if (!f.items.includes(itemId)) f.items.push(itemId); });
}

export function hatItem(itemId) { return fortschritt().items.includes(itemId); }

export function spielGeschafft(spielId) {
  const s = holeSpiel(spielId);
  return !!(s && hatItem(s.item));
}

export function ortsbeweisSetzen(ortId) {
  aendereFortschritt((f) => { f.beweise = f.beweise || {}; f.beweise[ortId] = true; });
}

/** Finale Quest geschafft? = alle spielbaren Orte vollständig. */
export function reiseFertig() {
  const orte = spielbareOrte();
  if (!orte.length) return false;
  return alleSpiele().filter((s) => orte.includes(s.ort)).every((s) => spielGeschafft(s.id));
}

// ---------- Beobachtungen E1–E10 (nur Gruppenebene) ----------
function station(g, spielId) {
  g.stationen[spielId] = g.stationen[spielId] || {
    status: 'offen', beginn: null, ende: null, versuche: 0, fehlversuche: 0, hilfen: [],
    wechsel: false, letzterFehler: false, eingaben: { navigation: 0, protokoll: 0, recherche: 0 },
    abstimmungen: 0, wege: [], aktivMs: 0,
  };
  return g.stationen[spielId];
}

function erfasse(spielId, fn) {
  if (!erfassungAktiv()) return; // keine Erfassung = kein Datensatz (Anlage 2, Abschnitt 2)
  const g = aktuelleGruppe();
  aendereGruppe(g.id, (gg) => fn(station(gg, spielId), gg));
}

export const beobachtung = {
  start(spielId) {
    erfasse(spielId, (st) => {
      if (!st.beginn) st.beginn = Date.now();
      if (st.status !== 'abgeschlossen') st.status = 'laeuft';
    });
  },
  ende(spielId) {
    erfasse(spielId, (st, g) => {
      st.status = 'abgeschlossen';
      st.ende = Date.now();
      const orte = freigegebeneOrte(g);
      const alle = alleSpiele().filter((s) => orte.includes(s.ort));
      if (alle.every((s) => (g.stationen[s.id] || {}).status === 'abgeschlossen')) g.abgeschlossenAm = Date.now();
    });
  },
  abbruch(spielId) {
    erfasse(spielId, (st) => { if (st.status === 'laeuft') st.status = 'abgebrochen'; });
  },
  versuch(spielId, erfolg) {
    erfasse(spielId, (st) => {
      st.versuche += 1;
      if (!erfolg) { st.fehlversuche += 1; st.letzterFehler = true; }
      else if (st.letzterFehler) { st.wechsel = true; st.letzterFehler = false; }
    });
  },
  hilfe(spielId, stufe) {
    erfasse(spielId, (st) => {
      st.hilfen.push({ stufe, zeit: Date.now() });
      if (st.letzterFehler) st.wechsel = true;
    });
  },
  eingabe(spielId, rolle) {
    erfasse(spielId, (st) => { st.eingaben[rolle] = (st.eingaben[rolle] || 0) + 1; });
  },
  abstimmung(spielId) {
    erfasse(spielId, (st) => { st.abstimmungen += 1; });
  },
  weg(spielId, name) {
    erfasse(spielId, (st) => { if (st.wege[st.wege.length - 1] !== name) st.wege.push(name); });
  },
  aktiv(spielId, ms) {
    if (ms <= 0) return;
    erfasse(spielId, (st) => { st.aktivMs += Math.round(ms); });
  },
};

/** E10: Offline-Phasen der Gruppe (ohne Ortsbezug, nur Zeitpunkte). */
export function offlinePhase(art) {
  if (!erfassungAktiv()) return;
  const g = aktuelleGruppe();
  aendereGruppe(g.id, (gg) => {
    gg.offline = gg.offline || [];
    if (art === 'beginn') gg.offline.push({ von: Date.now(), bis: null });
    else {
      const offen = gg.offline.find((o) => !o.bis);
      if (offen) offen.bis = Date.now();
    }
  });
}

// ---------- Kompetenzraster (F5) und Entwürfe (F7) ----------
export function rasterSetzen(id, zeile, stufe) {
  return aendereGruppe(id, (g) => { g.raster = { ...(g.raster || {}), [zeile]: stufe }; });
}
export function entwurfSetzen(id, text) {
  return aendereGruppe(id, (g) => { g.entwurf = text; });
}

// ---------- Bildbeiträge ----------
export function beitraege() { return lesen('beitraege', []) || []; }
export function beitragSpeichern(eintrag) {
  const p = profil();
  const b = { id: neueId('b'), gruppeId: p.typ === 'gruppe' ? p.id : null, zeit: Date.now(), status: 'wartet', ...eintrag };
  schreiben('beitraege', [...beitraege(), b]);
  melde();
  return b;
}
export function beitragStatus(id, status) {
  schreiben('beitraege', beitraege().map((b) => (b.id === id ? { ...b, status, entschieden: Date.now() } : b)));
  melde();
}

// ---------- Aufbewahrung und Löschung (Anlage 2, 4.4) ----------
export function loeschdatum(g) {
  const kandidaten = [g.schuljahrEnde];
  if (g.abgeschlossenAm) kandidaten.push(g.abgeschlossenAm + AUFBEWAHRUNG_TAGE * TAG);
  return Math.min(...kandidaten.filter(Boolean));
}

export function automatischLoeschen() {
  const jetzt = Date.now();
  const abgelaufen = gruppen().filter((g) => loeschdatum(g) < jetzt);
  abgelaufen.forEach((g) => gruppeLoeschen(g.id));
  return abgelaufen.length;
}

// ---------- Beispieldaten (synthetisch, für Prüfende) ----------
export function beispielGruppenAnlegen() {
  const jetzt = Date.now();
  const spiele = alleSpiele();
  const vorlage = [
    { name: 'Fuchs (Beispiel)', fertig: 6, hilfen: 1, fehler: 2, wechsel: true, rollen: [9, 7, 6], abst: 2 },
    { name: 'Eule (Beispiel)', fertig: 3, hilfen: 3, fehler: 3, wechsel: false, rollen: [14, 2, 1], abst: 1 },
    { name: 'Biber (Beispiel)', fertig: 1, hilfen: 0, fehler: 0, wechsel: false, rollen: [4, 2, 0], abst: 0 },
  ];
  for (const v of vorlage) {
    const stationen = {};
    spiele.forEach((s, i) => {
      if (i > v.fertig) return;
      const fertig = i < v.fertig;
      const beginn = jetzt - (90 - i * 12) * 60000;
      stationen[s.id] = {
        status: fertig ? 'abgeschlossen' : 'laeuft', beginn, ende: fertig ? beginn + (6 + (i % 3)) * 60000 : null,
        versuche: 1 + (i % 2) + (v.fehler > i ? 1 : 0), fehlversuche: v.fehler > i ? 1 : 0,
        hilfen: i < v.hilfen ? [{ stufe: 1, zeit: beginn + 120000 }, ...(v.hilfen > 2 && i === 0 ? [{ stufe: 3, zeit: beginn + 240000 }] : [])] : [],
        wechsel: v.wechsel && v.fehler > i, letzterFehler: false,
        eingaben: { navigation: v.rollen[0], protokoll: v.rollen[1], recherche: v.rollen[2] },
        abstimmungen: s.typ === 'schaetzfrage' ? v.abst : 0, wege: s.typ === 'schaetzfrage' ? [i % 2 ? 'geschätzt ohne Tipp' : 'geschätzt mit Tipp 1'] : [],
        aktivMs: (5 + (i % 4)) * 60000,
      };
    });
    gruppeAnlegen(v.name, {
      beispiel: true,
      freigabe: { orte: [...ORTE], klassenstufe: '6', kern: true, einwilligung: true, am: jetzt - 2 * 3600000 },
      stationen,
      fortschritt: { items: spiele.slice(0, v.fertig).map((s) => s.item), beweise: {} },
      abgeschlossenAm: v.fertig === spiele.length ? jetzt - 30 * 60000 : null,
    });
  }
}

/** Für Prüfende: alle Items im aktuellen Profil freischalten (Collage ausprobieren). */
export function alleItemsFreischalten() {
  aendereFortschritt((f) => { f.items = alleSpiele().map((s) => s.item); });
}

// ---------- Änderungen melden (Übersicht aktualisiert sich live, auch in anderen Tabs) ----------
function melde() { document.dispatchEvent(new CustomEvent('ks:daten')); }
window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith('ks.')) melde(); });
