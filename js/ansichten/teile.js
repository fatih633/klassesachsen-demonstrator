// Wiederkehrende Bausteine der Oberfläche.
import { h, icon } from '../ui.js';
import { lesetext } from '../text.js';
import { gurriSvg } from '../grafik/figur.js';
import { aktuelleGruppe, erfassungAktiv, ROLLEN_NAME } from '../daten.js';
import { rolleBild } from '../grafik/symbole.js';

export function gurriBlase(textId, stimmung = 'hallo', { auto = false, klein = false, hoch = false } = {}) {
  return h('div', { class: 'gurri' + (klein ? ' gurri--klein' : '') + (hoch ? ' gurri--hoch' : '') },
    h('div', { class: 'gurri__figur', svg: gurriSvg(stimmung) }),
    h('div', { class: 'gurri__blase' },
      h('p', { class: 'gurri__name', 'aria-hidden': 'true' }, 'Gurri sagt:'),
      h('span', { class: 'sr-only' }, 'Gurri, die Stadttaube, sagt: '),
      lesetext(textId, { auto, gross: true })));
}

export function seitenkopf(titel, { zurueck = null, extra = null, untertitel = null } = {}) {
  const links = h('div', {},
    zurueck ? h('a', { class: 'zurueck', href: zurueck.href }, h('span', { 'aria-hidden': 'true', svg: icon('zurueck'), style: { width: '1.3em', height: '1.3em', display: 'inline-flex' } }), zurueck.text) : null,
    untertitel ? h('p', { class: 'spiel__typ' }, untertitel) : null,
    h('h1', {}, titel));
  return h('div', { class: 'seitenkopf' }, links, extra);
}

export function profilHinweis() {
  const g = aktuelleGruppe();
  if (!g) return h('span', { class: 'abzeichen' }, 'Freies Spiel · keine Beobachtung');
  if (erfassungAktiv()) return h('span', { class: 'abzeichen abzeichen--blau' }, `Gruppe „${g.bezeichnung}“ · Beobachtung auf Gruppenebene`);
  return h('span', { class: 'abzeichen' }, `Gruppe „${g.bezeichnung}“ · keine Beobachtung`);
}

/** Item-SVG in ein anderes SVG einsetzen (Position und Größe). */
export function eingebettet(svgText, x, y, w, hoehe) {
  return svgText.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${hoehe}" `);
}

/** Kleine Rollenmarke: zeigt, welche Rolle diesen Knopf bedient. */
export function rollenMarke(rolle) {
  return h('span', { class: 'rollenmarke' }, h('span', { svg: rolleBild(rolle), 'aria-hidden': 'true', style: { width: '1.15rem', height: '1.15rem', display: 'inline-flex' } }), ROLLEN_NAME[rolle]);
}
