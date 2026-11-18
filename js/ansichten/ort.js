import { h, knopfLink, icon, ansage } from '../ui.js';
import { seitenkopf, profilHinweis } from './teile.js';
import { lesetext, t } from '../text.js';
import { ort as holeOrt, spiel as holeSpiel, item as holeItem, SPIELTYP } from '../inhalt.js';
import { spielGeschafft, spielbareOrte, fortschritt, ortsbeweisSetzen } from '../daten.js';
import { ortBild } from '../grafik/symbole.js';
import { itemSvg } from '../grafik/items.js';

export function ortAnsicht(main, { id }) {
  const o = holeOrt(id);
  if (!o) { main.append(h('p', {}, 'Diesen Ort gibt es nicht.')); return { titel: 'Nicht gefunden' }; }
  main.className = 'haupt ort-' + id;
  const spielbar = spielbareOrte().includes(id);

  const karten = o.spiele.map((sid) => {
    const s = holeSpiel(sid);
    const it = holeItem(s.item);
    const geschafft = spielGeschafft(sid);
    return h('article', { class: 'karte-box karte-box--ort spielkarte', 'aria-labelledby': `t-${sid}` },
      h('div', { class: 'spielkarte__kopf' },
        h('div', { class: 'spielkarte__item' + (geschafft ? '' : ' offen'), svg: itemSvg(s.item) }),
        h('div', {},
          h('p', { class: 'spiel__typ' }, SPIELTYP[s.typ].name),
          h('h2', { id: `t-${sid}`, style: { fontSize: '1.3rem', margin: 0 } }, s.titel))),
      h('p', { class: 'klein' }, `Dauer etwa 5 bis 10 Minuten · Kompetenz: ${s.kompetenz}`),
      h('p', {}, geschafft
        ? h('span', { class: 'abzeichen abzeichen--gruen' }, `Geschafft – Fundstück: ${it.name}`)
        : h('span', { class: 'abzeichen' }, `Fundstück: ${it.name}`)),
      spielbar
        ? knopfLink({ href: `#/spiel/${sid}`, text: geschafft ? 'Noch einmal spielen' : 'Spielen', symbol: 'start', klasse: geschafft ? 'knopf--zweit' : '' })
        : h('p', { class: 'klein' }, 'Dieser Ort ist für eure Gruppe noch nicht freigegeben.'));
  });

  // Ortsbeweis (optional): QR-Code am Ort oder Code eintippen. Gespeichert wird nur „Station erreicht“.
  const beweisOk = !!(fortschritt().beweise || {})[id];
  const meldung = h('div', { 'aria-live': 'polite' });
  const feld = h('input', { type: 'text', id: `code-${id}`, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-describedby': `code-hinweis-${id}` });
  const pruefen = (e) => {
    e.preventDefault();
    const eingabe = feld.value.trim().toUpperCase().replace(/\s+/g, '-');
    meldung.textContent = '';
    if (eingabe === o.beweis.code) {
      ortsbeweisSetzen(id);
      meldung.append(h('div', { class: 'rueckmeldung rueckmeldung--gut' }, lesetext('beweis.ok')));
      ansage('Ortsbeweis erbracht.');
    } else {
      meldung.append(h('div', { class: 'rueckmeldung rueckmeldung--hinweis' }, lesetext('beweis.falsch')));
    }
  };
  const beweis = h('details', { class: 'beweis' },
    h('summary', {}, beweisOk ? 'Ortsbeweis erbracht ✓' : 'Ihr seid wirklich vor Ort? Ortsbeweis (freiwillig)'),
    h('div', { class: 'stapel' },
      lesetext(o.beweis.text),
      h('form', { class: 'feld', onsubmit: pruefen },
        h('label', { for: `code-${id}` }, 'Code vom Schild'),
        h('p', { class: 'feld__hinweis', id: `code-hinweis-${id}` }, 'Zum Ausprobieren: Die QR-Codes und Codes liegen im Lehrkräfte-Bereich unter „Material“.'),
        h('div', { class: 'zeile' }, feld, h('button', { type: 'submit', class: 'knopf knopf--klein' }, 'Prüfen'))),
      meldung));

  main.append(
    seitenkopf(o.name, { zurueck: { href: '#/karte', text: 'Zur Karte' }, untertitel: o.thema }),
    h('section', { class: 'ort-kopf', 'aria-label': `Über ${o.name}` },
      h('div', { class: 'stapel' },
        lesetext(o.intro, { auto: true, gross: true }),
        h('div', { class: 'karte-box karte-box--warm' }, lesetext(o.facette)),
        h('p', {}, profilHinweis())),
      h('div', { class: 'ort-kopf__bild', svg: ortBild(id) })),
    h('h2', {}, 'Zwei Spiele an diesem Ort'),
    h('div', { class: 'raster-2' }, karten),
    h('div', { style: { marginTop: '1.25rem' } }, beweis));
  return { titel: o.name, aufraeumen: () => { main.className = 'haupt'; } };
}
