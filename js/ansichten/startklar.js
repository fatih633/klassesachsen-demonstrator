// Startklar-Check: Sind alle Questpakete und Vorlese-Audios auf dem Gerät?
import { h, knopf, leeren, ansage } from '../ui.js';
import { seitenkopf } from './teile.js';
import { lesetext } from '../text.js';

const NAMEN = {
  app: 'App, Karte, Grafiken und allgemeine Vorlesetexte',
  meissen: 'Questpaket Meißen (Spiele, Texte, Vorlese-Audio)',
  freiberg: 'Questpaket Freiberg (Spiele, Texte, Vorlese-Audio)',
  leipzig: 'Questpaket Leipzig (Spiele, Texte, Vorlese-Audio)',
};

async function pruefe() {
  const antwort = await fetch('precache.json', { cache: 'no-store' }).catch(() => null) || await caches.match('precache.json');
  if (!antwort) throw new Error('Paketliste nicht erreichbar');
  const liste = await antwort.json();
  const ergebnis = [];
  const cacheName = `ks-${liste.version}`;
  const vorhanden = 'caches' in window ? await caches.has(cacheName) : false;
  const cache = vorhanden ? await caches.open(cacheName) : null;
  for (const [paket, dateien] of Object.entries(liste.pakete)) {
    let da = 0;
    if (cache) {
      const treffer = await Promise.all(dateien.map((d) => cache.match(d, { ignoreSearch: true })));
      da = treffer.filter(Boolean).length;
    }
    ergebnis.push({ paket, gesamt: dateien.length, da, bytes: liste.groessen ? liste.groessen[paket] : null });
  }
  return { liste, ergebnis, cacheName };
}

export function startklarAnsicht(main) {
  const bereich = h('div', { class: 'stapel', 'aria-live': 'polite' });
  const laden = knopf({ text: 'Alles auf das Gerät laden', symbol: 'download', klasse: 'knopf--gross', onclick: allesLaden });
  let nachpruefen = null;
  let versuche = 0;

  async function zeige() {
    leeren(bereich);
    if (!('caches' in window) || !('serviceWorker' in navigator)) {
      bereich.append(h('p', { class: 'karte-box' }, 'Dieser Browser unterstützt keine Offline-Speicherung. Die App läuft nur mit Internet.'));
      return;
    }
    let daten;
    try { daten = await pruefe(); } catch { bereich.append(h('p', { class: 'karte-box' }, 'Prüfung nicht möglich. Bitte einmal mit Internet öffnen.')); return; }
    const { ergebnis } = daten;
    const alles = ergebnis.every((e) => e.da === e.gesamt);
    const sw = navigator.serviceWorker.controller ? 'aktiv' : 'wird eingerichtet';
    let dauerhaft = 'unbekannt';
    if (navigator.storage && navigator.storage.persisted) dauerhaft = (await navigator.storage.persisted()) ? 'ja' : 'nein';
    let speicher = '';
    if (navigator.storage && navigator.storage.estimate) {
      const s = await navigator.storage.estimate();
      if (s.usage) speicher = `${(s.usage / 1048576).toFixed(1)} MB belegt`;
    }
    bereich.append(
      h('div', { class: 'startklar-gross ' + (alles ? 'gruen' : 'offen'), id: 'startklar-status', 'data-status': alles ? 'gruen' : 'offen' },
        h('span', { 'aria-hidden': 'true', style: { fontSize: '2rem' } }, alles ? '✓' : '…'),
        alles ? 'Startklar! Alles ist auf dem Gerät.' : 'Noch nicht startklar – bitte alles laden.'),
      h('ul', { class: 'ampel', 'aria-label': 'Pakete' }, ergebnis.map((e) => h('li', {},
        h('span', { class: 'ampel__punkt ' + (e.da === e.gesamt ? 'gruen' : e.da ? 'grau' : 'rot'), 'aria-hidden': 'true' }, e.da === e.gesamt ? '✓' : '!'),
        h('span', {}, h('strong', {}, NAMEN[e.paket] || e.paket), ` – ${e.da} von ${e.gesamt} Dateien auf dem Gerät`, e.da === e.gesamt ? ' (grün)' : ' (fehlt noch)')))),
      h('p', { class: 'klein' }, `Offline-Dienst: ${sw} · Dauerhafter Speicher: ${dauerhaft}${speicher ? ' · ' + speicher : ''} · Version ${daten.liste.version}`));
    laden.hidden = alles;
    clearTimeout(nachpruefen);
    if (!alles && versuche++ < 48) nachpruefen = setTimeout(zeige, 2500);
  }

  async function allesLaden() {
    laden.disabled = true;
    leeren(bereich);
    bereich.append(h('p', {}, 'Lädt alle Pakete … bitte warten.'));
    try {
      if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
      const antwort = await fetch('precache.json', { cache: 'no-store' });
      const liste = await antwort.json();
      const cache = await caches.open(`ks-${liste.version}`);
      const alle = Object.values(liste.pakete).flat();
      for (let i = 0; i < alle.length; i += 20) await cache.addAll(alle.slice(i, i + 20));
      ansage('Alle Pakete sind geladen.');
    } catch {
      ansage('Laden fehlgeschlagen. Ist das Gerät online?');
    }
    laden.disabled = false;
    zeige();
  }

  main.append(
    seitenkopf('Startklar-Check', { zurueck: { href: '#/', text: 'Zur Startseite' } }),
    h('div', { class: 'stapel' }, lesetext('startklar.intro', { auto: true, gross: true }), bereich, h('div', { class: 'zeile' }, laden,
      knopf({ text: 'Erneut prüfen', klasse: 'knopf--zweit', onclick: zeige }))));
  zeige();
  return { titel: 'Startklar-Check', aufraeumen: () => clearTimeout(nachpruefen) };
}
