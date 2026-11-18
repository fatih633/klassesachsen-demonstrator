import { h } from '../ui.js';
import { seitenkopf } from './teile.js';

export function ueberAnsicht(main) {
  const zeile = (a, b, c) => h('tr', {}, h('th', { scope: 'row' }, a), h('td', {}, b), h('td', {}, c));
  main.append(
    seitenkopf('Offener Quellcode und Lizenzen', { zurueck: { href: '#/', text: 'Zur Startseite' } }),
    h('div', { class: 'textseite stapel' },
      h('p', {}, 'Dieser Demonstrator ist Open Source. Der Quellcode steht unter der Europäischen Union Public Licence ', h('strong', {}, 'EUPL-1.2'), '. Texte, Illustrationen, Erzählfigur, Fundstücke und Vorlese-Audio stehen unter ', h('strong', {}, 'CC BY-SA 4.0'), ' (Namensnennung: N.A.I.L.A. UG (haftungsbeschränkt)).'),
      h('p', {}, 'Lizenztexte: ', h('a', { href: 'LICENSE', type: 'text/plain' }, 'LICENSE (EUPL-1.2)'), ' · ', h('a', { href: 'LICENSE-CONTENT.md', type: 'text/markdown' }, 'LICENSE-CONTENT.md (CC BY-SA 4.0)'), ' · ', h('a', { href: 'README.md', type: 'text/markdown' }, 'README.md'), ' · ', h('a', { href: 'QUELLEN.md', type: 'text/markdown' }, 'QUELLEN.md (Faktenbelege)')),
      h('h2', {}, 'Verwendete Fremdbausteine'),
      h('div', { class: 'tabelle-huelle', tabindex: 0, role: 'region', 'aria-label': 'Tabelle, bei Bedarf seitlich verschiebbar' }, h('table', {},
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Baustein'), h('th', { scope: 'col' }, 'Zweck'), h('th', { scope: 'col' }, 'Lizenz'))),
        h('tbody', {},
          zeile('Atkinson Hyperlegible (Braille Institute)', 'Lesefreundliche Grundschrift', 'SIL Open Font License 1.1'),
          zeile('Fredoka', 'Überschriften', 'SIL Open Font License 1.1'),
          zeile('qrcode-generator (Kazuhiko Arase)', 'QR-Codes für den Ortsbeweis, lokal erzeugt', 'MIT'),
          zeile('Piper TTS mit Stimme „thorsten“ (de_DE-thorsten-medium)', 'Vorproduziertes Vorlese-Audio (nur beim Bauen, nicht in der App)', 'Stimmdaten CC0, Modell MIT; Piper GPL-3.0 (nur Werkzeug)'),
          zeile('Natural Earth', 'Umriss der Sachsen-Karte (vereinfacht)', 'gemeinfrei'),
          zeile('axe-core, Playwright', 'Prüfwerkzeuge (nicht Teil der App)', 'MPL-2.0, Apache-2.0')))),
      h('p', {}, 'Es gibt keine Laufzeit-Abhängigkeiten von Online-Diensten: keine Schriften, Skripte oder Karten aus dem Netz, kein Tracking, keine Cookies.')));
  return { titel: 'Offener Quellcode und Lizenzen' };
}
