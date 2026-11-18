// Für die Textseiten (Barrierefreiheit, Datenschutz, Impressum): gespeicherte Anzeige-Einstellungen
// anwenden, Seite mit der Gerätestimme vorlesen, lokale Daten anzeigen und löschen.
import { lesen, alleEintraege, allesLoeschen } from './speicher.js';
import { gurriKopfSvg } from './grafik/figur.js';

const e = lesen('einstellungen', {}) || {};
const html = document.documentElement;
html.classList.toggle('kontrast', !!e.kontrast);
html.classList.toggle('ruhig', !!e.ruhig);
html.classList.toggle('schrift-gross', e.schrift === 'gross');
html.classList.toggle('schrift-sehr-gross', e.schrift === 'sehr-gross');
const marke = document.getElementById('marke-bild');
if (marke) marke.innerHTML = gurriKopfSvg();

// Vorlesen der ganzen Seite (Gerätestimme, Tempo aus den Einstellungen)
const vorlesen = document.getElementById('seite-vorlesen');
if (vorlesen) {
  if (!('speechSynthesis' in window)) vorlesen.hidden = true;
  vorlesen.addEventListener('click', () => {
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); vorlesen.setAttribute('aria-pressed', 'false'); return; }
    const text = document.getElementById('inhalt').innerText;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = Number(e.tempo) || 1;
    const stimmen = window.speechSynthesis.getVoices().filter((s) => (s.lang || '').toLowerCase().startsWith('de'));
    if (stimmen.length) u.voice = stimmen[0];
    u.onend = () => vorlesen.setAttribute('aria-pressed', 'false');
    vorlesen.setAttribute('aria-pressed', 'true');
    window.speechSynthesis.speak(u);
  });
}

// Datenschutz: Daten anzeigen und löschen
const anzeigen = document.getElementById('daten-anzeigen');
const ausgabe = document.getElementById('daten-ausgabe');
const status = document.getElementById('daten-status');
if (anzeigen && ausgabe) {
  anzeigen.addEventListener('click', () => {
    const daten = alleEintraege();
    ausgabe.hidden = false;
    ausgabe.textContent = Object.keys(daten).length ? JSON.stringify(daten, null, 2) : 'Auf diesem Gerät sind keine Spieldaten gespeichert.';
  });
}
const loeschen = document.getElementById('daten-loeschen');
if (loeschen) {
  loeschen.addEventListener('click', () => {
    allesLoeschen();
    if (ausgabe) { ausgabe.hidden = true; ausgabe.textContent = ''; }
    status.textContent = 'Alle Spieldaten, Gruppen, Beobachtungen und Einstellungen auf diesem Gerät wurden gelöscht.';
  });
}
const cacheLoeschen = document.getElementById('cache-loeschen');
if (cacheLoeschen) {
  cacheLoeschen.addEventListener('click', async () => {
    allesLoeschen();
    if ('caches' in window) {
      const namen = await caches.keys();
      await Promise.all(namen.filter((n) => n.startsWith('ks-')).map((n) => caches.delete(n)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    status.textContent = 'Alle Daten und alle Offline-Dateien wurden von diesem Gerät entfernt.';
  });
}
