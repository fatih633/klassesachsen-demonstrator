import { h, knopfLink } from '../ui.js';
import { gurriBlase, eingebettet } from './teile.js';
import { lesetext } from '../text.js';
import { KARTE } from '../grafik/karte-daten.js';
import { itemSvg } from '../grafik/items.js';

function heldenbild() {
  const { breite, hoehe, umriss } = KARTE;
  const o = KARTE.orte;
  const item = (id, [x, y], g = 170) => eingebettet(itemSvg(id), x - g / 2, y - g / 2 - 10, g, g);
  return `<svg viewBox="0 0 ${breite} ${hoehe + 60}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="${umriss}" fill="#D9CFBD" transform="translate(10 14)"/>
    <path d="${umriss}" fill="#E3EAF8" stroke="#1C2541" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${o.leipzig[0]} ${o.leipzig[1]}Q 380 120 ${o.meissen[0]} ${o.meissen[1]}T ${o.freiberg[0]} ${o.freiberg[1]}" fill="none" stroke="#2350A8" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>
    ${item('leipzig-kerze', o.leipzig, 190)}${item('meissen-tasse', [o.meissen[0] + 30, o.meissen[1] - 40], 170)}${item('freiberg-lampe', [o.freiberg[0] - 40, o.freiberg[1] + 50], 170)}
  </svg>`;
}

export function startAnsicht(main) {
  const merkmale = ['Offline spielbar', 'Vorlesen in zwei Sprachstufen', 'Keine Punkte, keine Rangliste', 'Daten nur auf diesem Gerät', 'Open Source (EUPL-1.2)'];
  main.append(
    h('section', { class: 'start', 'aria-labelledby': 'start-titel' },
      h('div', {},
        h('p', {}, h('span', { class: 'abzeichen abzeichen--blau' }, 'Quest für Klasse 4 bis 10 · Gruppen spielen an einem Gerät')),
        h('h1', { class: 'start__titel', id: 'start-titel' }, 'Was ist ', h('span', {}, 'sächsisch?')),
        h('p', { class: 'start__unter' }, 'Drei Orte, sechs Minigames, ein gemeinsames Bild – ohne Punkte und ohne Zeitdruck.'),
        h('div', { class: 'start__aktionen' },
          knopfLink({ href: '#/gruppe', text: 'Los geht’s!', symbol: 'start', klasse: 'knopf--gross' }),
          knopfLink({ href: '#/lehrkraefte', text: 'Für Lehrkräfte', symbol: 'person', klasse: 'knopf--zweit' }),
          knopfLink({ href: '#/startklar', text: 'Startklar-Check', symbol: 'wlan', klasse: 'knopf--zweit' })),
        h('ul', { class: 'merkmale', 'aria-label': 'Merkmale des Demonstrators' }, merkmale.map((m) => h('li', { class: 'abzeichen' }, m)))),
      h('div', { class: 'start__bild', svg: heldenbild() })),
    h('section', { class: 'start__gurri stapel', 'aria-label': 'Begrüßung' },
      gurriBlase('start.gurri', 'hallo', { auto: true }),
      h('div', { class: 'karte-box karte-box--hinweis' }, lesetext('start.ablauf'))));
  return { titel: 'Start' };
}
