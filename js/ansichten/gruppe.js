import { h } from '../ui.js';
import { gurriBlase, seitenkopf } from './teile.js';
import { lesetext } from '../text.js';
import { gruppen, profilSetzen, freigegebeneOrte } from '../daten.js';
import { gehe } from '../router.js';
import { ort } from '../inhalt.js';

export function gruppeAnsicht(main) {
  const liste = gruppen().filter((g) => freigegebeneOrte(g).length);
  const waehle = (p) => { profilSetzen(p); gehe('/karte'); };

  const eintraege = liste.map((g) => h('li', {},
    h('button', { type: 'button', class: 'gruppenwahl', onclick: () => waehle({ typ: 'gruppe', id: g.id }) },
      h('span', { class: 'gruppenwahl__symbol', 'aria-hidden': 'true' }, g.bezeichnung.slice(0, 1).toUpperCase()),
      h('span', {}, `Gruppe „${g.bezeichnung}“`,
        h('br'), h('span', { class: 'klein' }, freigegebeneOrte(g).map((o) => ort(o).name).join(', '))))));

  main.append(
    seitenkopf('Wer spielt?', { zurueck: { href: '#/', text: 'Zur Startseite' } }),
    h('div', { class: 'stapel' },
      gurriBlase('gruppe.intro', 'hallo', { auto: true, klein: true }),
      liste.length
        ? h('section', { 'aria-labelledby': 'h-gruppen' },
          h('h2', { id: 'h-gruppen' }, 'Gruppen dieser Klasse'),
          h('ul', { class: 'gruppenliste' }, eintraege))
        : h('p', { class: 'karte-box karte-box--hinweis' }, 'Auf diesem Gerät hat noch keine Lehrkraft Gruppen angelegt. Das geht in der Lehrkräfte-Ansicht. Ihr könnt aber sofort frei spielen.'),
      h('section', { 'aria-labelledby': 'h-frei', class: 'karte-box' },
        h('h2', { id: 'h-frei' }, 'Freies Spiel'),
        lesetext('gruppe.frei'),
        h('button', { type: 'button', class: 'knopf knopf--gruen', onclick: () => waehle({ typ: 'frei' }) }, 'Frei spielen'))));
  return { titel: 'Wer spielt?' };
}
