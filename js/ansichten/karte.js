import { h, knopfLink, icon } from '../ui.js';
import { gurriBlase, seitenkopf, profilHinweis } from './teile.js';
import { lesetext } from '../text.js';
import { alleOrte, spiel } from '../inhalt.js';
import { spielGeschafft, spielbareOrte, reiseFertig, fortschritt } from '../daten.js';
import { karteSvg } from '../grafik/karte.js';
import { ortBild } from '../grafik/symbole.js';
import { itemSvg } from '../grafik/items.js';
import { lesen, schreiben } from '../speicher.js';

export function karteAnsicht(main) {
  const spielbar = spielbareOrte();
  const orte = alleOrte().map((o) => ({
    id: o.id, name: o.name, thema: o.thema,
    gesamt: o.spiele.length,
    geschafft: o.spiele.filter((s) => spielGeschafft(s)).length,
    spielbar: spielbar.includes(o.id),
  }));
  let modus = lesen('kartenmodus', 'karte');

  const kartenBox = h('div', { class: 'landkarte', svg: karteSvg(orte) });
  const liste = h('ul', { class: 'ortsliste' }, orte.map((o) => h('li', { class: `ortskarte ort-${o.id}` },
    h('div', { class: 'ortskarte__bild', svg: ortBild(o.id) }),
    h('div', {},
      h('h3', {}, o.name),
      h('p', {}, o.thema),
      h('p', { class: 'klein' },
        h('span', { class: 'fortschritt-punkte', 'aria-hidden': 'true' }, Array.from({ length: o.gesamt }, (_, i) => h('i', { class: i < o.geschafft ? 'voll' : '' }))),
        ` ${o.geschafft} von ${o.gesamt} Spielen geschafft`),
      o.spielbar
        ? knopfLink({ href: `#/ort/${o.id}`, text: `Nach ${o.name}`, klasse: 'knopf--klein' })
        : h('p', { class: 'klein' }, 'Noch nicht freigegeben')))));

  const wahlKarte = h('button', { type: 'button', 'aria-pressed': String(modus === 'karte') }, 'Karte');
  const wahlListe = h('button', { type: 'button', 'aria-pressed': String(modus === 'liste') }, 'Liste');
  const zeige = () => {
    kartenBox.hidden = modus !== 'karte';
    liste.hidden = modus !== 'liste';
    wahlKarte.setAttribute('aria-pressed', String(modus === 'karte'));
    wahlListe.setAttribute('aria-pressed', String(modus === 'liste'));
  };
  wahlKarte.addEventListener('click', () => { modus = 'karte'; schreiben('kartenmodus', modus); zeige(); });
  wahlListe.addEventListener('click', () => { modus = 'liste'; schreiben('kartenmodus', modus); zeige(); });
  zeige();

  const items = fortschritt().items;
  const fertig = reiseFertig();
  main.append(
    seitenkopf('Eure Reise durch Sachsen', {
      zurueck: { href: '#/gruppe', text: 'Gruppe wechseln' },
      extra: h('div', { class: 'ansicht-wahl', role: 'group', 'aria-label': 'Darstellung der Orte' }, wahlKarte, wahlListe),
    }),
    h('p', {}, profilHinweis()),
    h('div', { class: 'reise' },
      h('section', { 'aria-label': 'Orte' }, kartenBox, liste),
      h('aside', { class: 'stapel', 'aria-label': 'Begleitung und Sammelalbum' },
        gurriBlase(fertig ? 'karte.fertig' : 'karte.gurri', fertig ? 'freut' : 'denkt', { auto: true, hoch: true }),
        h('div', { class: 'karte-box stapel' },
          h('h2', {}, 'Sammelalbum'),
          h('p', {}, `${items.length} von 6 Fundstücken`),
          h('div', { class: 'zeile', 'aria-hidden': 'true' }, items.map((id) => h('span', { style: { width: '3rem', height: '3rem', display: 'inline-block' }, svg: itemSvg(id) }))),
          knopfLink({ href: '#/album', text: 'Album öffnen', symbol: 'album', klasse: 'knopf--zweit' })),
        h('div', { class: 'karte-box stapel' },
          h('h2', {}, 'Bildbeitrag'),
          fertig
            ? knopfLink({ href: '#/collage', text: 'Bildbeitrag gestalten', symbol: 'pinsel', klasse: 'knopf--gruen' })
            : lesetext('collage.gesperrt')))));
  return { titel: 'Karte' };
}
