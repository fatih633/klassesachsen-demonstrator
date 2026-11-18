// Einfacher Hash-Router mit Fokus- und Titelverwaltung (für Bildschirmleser wichtig).
import { leeren } from './ui.js';
import { stoppeVorlesen, autoVorlesen } from './vorlesen.js';

const routen = [];
let aufraeumen = null;
let ersterAufruf = true;

export function route(muster, ansicht) {
  const namen = [...muster.matchAll(/:(\w+)/g)].map((m) => m[1]);
  const re = new RegExp('^' + muster.replace(/:(\w+)/g, '([^/]+)') + '$');
  routen.push({ re, namen, ansicht });
}

export function gehe(pfad) {
  if (location.hash === '#' + pfad) navigiere();
  else location.hash = pfad;
}

export async function navigiere() {
  const pfad = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  stoppeVorlesen();
  if (typeof aufraeumen === 'function') { try { aufraeumen(); } catch { /* ignorieren */ } }
  aufraeumen = null;
  const main = document.getElementById('inhalt');
  for (const r of routen) {
    const m = pfad.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.namen.map((n, i) => [n, m[i + 1]]));
    leeren(main);
    let ergebnis = null;
    try {
      ergebnis = await r.ansicht(main, params);
    } catch (fehler) {
      console.error(fehler);
      main.textContent = 'Diese Ansicht konnte nicht geladen werden.';
    }
    if (ergebnis && typeof ergebnis.aufraeumen === 'function') aufraeumen = ergebnis.aufraeumen;
    const titel = (ergebnis && ergebnis.titel) || 'klasseSachsen';
    document.title = `${titel} – klasseSachsen – Demonstrator`;
    document.querySelectorAll('[data-nav]').forEach((a) => a.removeAttribute('aria-current'));
    if (!ersterAufruf) {
      window.scrollTo(0, 0);
      const h1 = main.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
    ersterAufruf = false;
    autoVorlesen(main);
    return;
  }
  gehe('/');
}

export function startRouter() {
  window.addEventListener('hashchange', navigiere);
  navigiere();
}
