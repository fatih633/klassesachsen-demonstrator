import { h, knopfLink } from '../ui.js';
import { seitenkopf, gurriBlase } from './teile.js';
import { lesetext } from '../text.js';
import { alleSpiele, item as holeItem, ort as holeOrt, SPIELTYP } from '../inhalt.js';
import { hatItem, reiseFertig } from '../daten.js';
import { itemSvg } from '../grafik/items.js';

export function albumAnsicht(main) {
  const spiele = alleSpiele();
  const anzahl = spiele.filter((s) => hatItem(s.item)).length;
  const faecher = spiele.map((s) => {
    const it = holeItem(s.item);
    const da = hatItem(s.item);
    const o = holeOrt(s.ort);
    return h('li', { class: `album__fach ort-${s.ort}` + (da ? '' : ' leer') },
      h('div', { class: 'album__bild', svg: itemSvg(s.item) }),
      h('h3', {}, da ? it.name : 'Noch nicht gefunden'),
      h('p', { class: 'klein', style: { margin: 0 } }, `${o.name} · ${SPIELTYP[s.typ].name}: „${s.titel}“`),
      da ? lesetext(it.text) : h('p', { class: 'klein', style: { margin: 0 } }, `Hier kommt ein festes Fundstück hinein: ${it.name}.`));
  });
  main.append(
    seitenkopf('Sammelalbum', { zurueck: { href: '#/karte', text: 'Zur Karte' } }),
    h('div', { class: 'stapel' },
      gurriBlase(anzahl === 6 ? 'album.sachsen' : 'album.intro', anzahl === 6 ? 'freut' : 'hallo', { auto: true, klein: true }),
      h('p', { class: 'abzeichen abzeichen--blau' }, `${anzahl} von 6 Fundstücken gesammelt`),
      h('ul', { class: 'album', 'aria-label': 'Fundstücke' }, faecher),
      reiseFertig()
        ? knopfLink({ href: '#/collage', text: 'Bildbeitrag gestalten', symbol: 'pinsel', klasse: 'knopf--gruen knopf--gross' })
        : h('div', { class: 'karte-box karte-box--hinweis' }, lesetext('collage.gesperrt'))));
  return { titel: 'Sammelalbum' };
}
