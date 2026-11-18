// Vorlesefunktion: vorproduziertes Audio (Piper TTS, Stimme „thorsten“) mit Wortmarkierung,
// Tempo 0,75- bis 1,5-fach. Rückfall: Web Speech API (Gerätestimme), wenn kein Audio vorliegt,
// die Gerätestimme gewählt ist oder es sich um Texte ohne Aufnahme handelt.

import { einstellungen } from './einstellungen.js';
import { paketVon, text as holeText } from './inhalt.js';
import { zerlegeVoll } from './zerlegung.js';
import { ansage } from './ui.js';

const audio = new Audio();
audio.preload = 'auto';
const zeitenCache = new Map();

let aktiv = null; // { p, knopf, art: 'audio'|'sprache', zeiten, raf, letzte }
let warteschlange = [];
let entsperrt = false;

function leiste() { return document.getElementById('vorleser'); }

// Nur lesender Zugriff für automatische Tests (keine Daten, kein Netz).
window.ksVorleser = () => ({ quelle: audio.currentSrc || audio.src, tempo: audio.playbackRate, zeit: audio.currentTime, pausiert: audio.paused, art: aktiv ? aktiv.art : null });
function status(text) { const s = document.getElementById('vorleser-status'); if (s) s.textContent = text; }

async function zeitenFuer(paket) {
  if (!zeitenCache.has(paket)) {
    zeitenCache.set(paket, fetch(`audio/${paket}/zeiten.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  }
  return zeitenCache.get(paket);
}

export function istAktiv(p) {
  return !!aktiv && aktiv.p === p;
}

/** iOS/iPadOS: Audio darf erst nach einer Berührung starten – einmal still „entsperren“. */
export function initVorlesen() {
  const entsperren = () => {
    if (entsperrt) return;
    entsperrt = true;
    if (!aktiv) {
      audio.src = 'audio/stille.mp3';
      audio.play().then(() => audio.pause()).catch(() => {});
    }
    window.removeEventListener('pointerdown', entsperren, true);
    window.removeEventListener('keydown', entsperren, true);
  };
  window.addEventListener('pointerdown', entsperren, true);
  window.addEventListener('keydown', entsperren, true);

  document.getElementById('vorleser-pause').addEventListener('click', pauseUmschalten);
  document.getElementById('vorleser-stopp').addEventListener('click', () => stoppeVorlesen());
  document.addEventListener('ks:einstellungen', (e) => {
    if (e.detail.geaendert.includes('tempo') && aktiv && aktiv.art === 'audio') setzeTempo(audio);
    if (e.detail.geaendert.includes('markierung') && aktiv) markiere(-1);
  });
  audio.addEventListener('ended', () => { if (aktiv && aktiv.art === 'audio') fertig(); });
  audio.addEventListener('error', () => {
    if (aktiv && aktiv.art === 'audio' && !audio.src.endsWith('stille.mp3')) {
      const { p, knopf, roh } = aktiv;
      aufraeumen(false);
      sprechen(p, roh, knopf);
    }
  });
}

function setzeTempo(a) {
  const tempo = Number(einstellungen().tempo) || 1;
  a.playbackRate = tempo;
  a.defaultPlaybackRate = tempo;
  if ('preservesPitch' in a) a.preservesPitch = true;
  if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = true;
}

function markiere(i) {
  if (!aktiv) return;
  if (aktiv.letzte === i) return;
  const spans = aktiv.p.querySelectorAll('.w');
  if (aktiv.letzte >= 0 && spans[aktiv.letzte]) spans[aktiv.letzte].classList.remove('aktiv');
  aktiv.letzte = -1;
  if (i >= 0 && einstellungen().markierung && spans[i]) {
    spans[i].classList.add('aktiv');
    aktiv.letzte = i;
  }
}

function schleife() {
  if (!aktiv || aktiv.art !== 'audio') return;
  const t = audio.currentTime;
  const w = aktiv.zeiten.w;
  let treffer = -1;
  for (let i = 0; i < w.length; i++) {
    const z = w[i];
    if (!z) continue;
    if (t >= z[0] - 0.02 && t < z[1] + 0.06) { treffer = i; break; }
    if (z[0] > t) break;
  }
  markiere(treffer);
  aktiv.raf = requestAnimationFrame(schleife);
}

function rohtext(p) {
  const id = p.dataset.textId;
  const tx = holeText(id);
  if (!tx) return p.textContent;
  return tx[p.dataset.variante || 'n'] || tx.n;
}

/** Einen Textbaustein vorlesen (Umschalten: erneuter Druck stoppt). */
export async function vorlesen(p, id, knopf, ausWarteschlange = false) {
  if (aktiv && aktiv.p === p) { stoppeVorlesen(); return; }
  if (!ausWarteschlange) warteschlange = [];
  aufraeumen(false);
  const v = p.dataset.variante || 'n';
  const roh = rohtext(p);
  const paket = id ? paketVon(id) : null;
  aktiv = { p, knopf, roh, art: 'laden', letzte: -1 };
  if (knopf) knopf.setAttribute('aria-pressed', 'true');
  leiste().hidden = false;
  status('Liest vor …');
  document.getElementById('vorleser-pause').textContent = 'Pause';

  const zeiten = id && !einstellungen().geraetestimme ? await zeitenFuer(paket) : null;
  if (!aktiv || aktiv.p !== p) return;
  const eintrag = zeiten && zeiten.texte && zeiten.texte[`${id}.${v}`];
  if (eintrag) {
    aktiv.art = 'audio';
    aktiv.zeiten = eintrag;
    audio.src = `audio/${paket}/${id}.${v}.mp3`;
    setzeTempo(audio);
    try {
      await audio.play();
      setzeTempo(audio);
      aktiv.raf = requestAnimationFrame(schleife);
    } catch {
      // Abspielen blockiert (z. B. ohne vorherige Berührung): Gerätestimme versuchen
      if (aktiv && aktiv.p === p) { aufraeumen(false); sprechen(p, roh, knopf); }
    }
  } else {
    aufraeumen(false);
    sprechen(p, roh, knopf);
  }
}

/** Freier Text (z. B. Lehrkräfte-Seiten): Gerätestimme. */
export function sprechen(p, roh, knopf) {
  if (!('speechSynthesis' in window)) {
    ansage('Vorlesen ist auf diesem Gerät nicht verfügbar.');
    if (knopf) knopf.setAttribute('aria-pressed', 'false');
    leiste().hidden = true;
    return;
  }
  const tokens = zerlegeVoll(roh || p.textContent);
  const anfaenge = [];
  let txt = '';
  tokens.forEach((tk, i) => { if (i) txt += ' '; anfaenge.push(txt.length); txt += tk.s; });
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'de-DE';
  u.rate = Number(einstellungen().tempo) || 1;
  const stimmen = window.speechSynthesis.getVoices().filter((s) => (s.lang || '').toLowerCase().startsWith('de'));
  if (stimmen.length) u.voice = stimmen.find((s) => s.localService) || stimmen[0];
  aktiv = { p, knopf, roh, art: 'sprache', letzte: -1 };
  if (knopf) knopf.setAttribute('aria-pressed', 'true');
  leiste().hidden = false;
  status('Liest vor (Gerätestimme) …');
  u.onboundary = (e) => {
    if (!aktiv || aktiv.art !== 'sprache' || e.name === 'sentence') return;
    let i = 0;
    while (i + 1 < anfaenge.length && anfaenge[i + 1] <= e.charIndex) i++;
    markiere(i);
  };
  u.onend = () => { if (aktiv && aktiv.art === 'sprache') fertig(); };
  u.onerror = () => { if (aktiv && aktiv.art === 'sprache') fertig(); };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function pauseUmschalten() {
  if (!aktiv) return;
  const b = document.getElementById('vorleser-pause');
  if (aktiv.art === 'audio') {
    if (audio.paused) { audio.play().catch(() => {}); b.textContent = 'Pause'; status('Liest vor …'); }
    else { audio.pause(); b.textContent = 'Weiter'; status('Pausiert'); }
  } else if (aktiv.art === 'sprache') {
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); b.textContent = 'Pause'; status('Liest vor …'); }
    else { window.speechSynthesis.pause(); b.textContent = 'Weiter'; status('Pausiert'); }
  }
}

function aufraeumen(leisteAus = true) {
  if (!aktiv) return;
  cancelAnimationFrame(aktiv.raf);
  markiere(-1);
  if (aktiv.knopf) aktiv.knopf.setAttribute('aria-pressed', 'false');
  if (aktiv.art === 'audio') { audio.pause(); }
  if (aktiv.art === 'sprache' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  aktiv = null;
  if (leisteAus) leiste().hidden = true;
}

function fertig() {
  aufraeumen(true);
  const naechster = warteschlange.shift();
  if (naechster && document.body.contains(naechster.p)) vorlesen(naechster.p, naechster.id, naechster.knopf, true);
}

export function stoppeVorlesen(leisteAus = true) {
  warteschlange = [];
  aufraeumen(leisteAus);
}

/** Automatisch vorlesen (Einstellung „Neue Texte automatisch vorlesen“). */
export function autoVorlesen(wurzel) {
  if (!einstellungen().auto) return;
  const bloecke = [...wurzel.querySelectorAll('.lesbar[data-auto="1"]')];
  if (!bloecke.length) return;
  const eintraege = bloecke.map((b) => ({ p: b.querySelector('[data-text-id]'), id: b.querySelector('[data-text-id]').dataset.textId, knopf: b.querySelector('.vorlesen-knopf') }));
  const erster = eintraege.shift();
  warteschlange = eintraege;
  vorlesen(erster.p, erster.id, erster.knopf, true);
}
