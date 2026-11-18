// Spieltyp „Spurensuche“: Details in einem Wimmelbild finden – Klassenzimmer-Variante.
// Bedienung: Tippen, Tastatur (Tab/Enter) oder als Liste. Keine Ziehgesten.
import { h, knopf, leeren } from '../ui.js';
import { lesetext } from '../text.js';
import { szeneSvg } from '../grafik/szenen.js';
import { rollenMarke } from '../ansichten/teile.js';
import { lesen, schreiben } from '../speicher.js';

export function spurensuche(flaeche, s, api) {
  let nr = 0;
  let wartet = false;
  const gefunden = new Set();
  const knoepfe = new Map(); // id -> [bildKnopf, listenKnopf]
  let modus = lesen('spurensuche-modus', 'bild');

  const aufgabeBox = h('div', { class: 'karte-box stapel', 'aria-live': 'polite' });
  const szene = h('div', { class: 'szene', svg: szeneSvg(s.szene) });
  const ziele = h('ul', { class: 'szene__ziele', 'aria-label': 'Dinge im Bild' });
  const liste = h('ul', { class: 'vorschlaege', 'aria-label': 'Dinge im Bild als Liste' });
  for (const o of s.objekte) {
    const stil = { left: `${o.x / 10}%`, top: `${o.y / 6.4}%`, width: `${o.w / 10}%`, height: `${o.h / 6.4}%` };
    const b = h('button', { type: 'button', class: 'szene__ziel', 'aria-label': o.name, style: stil, onclick: () => tippe(o) });
    const bl = h('button', { type: 'button', onclick: () => tippe(o) }, o.name);
    knoepfe.set(o.id, [b, bl]);
    ziele.append(h('li', {}, b));
    liste.append(h('li', {}, bl));
  }
  szene.append(ziele);
  const scroller = h('div', { class: 'szene-scroller' }, szene);
  const listenBox = h('div', { class: 'karte-box' }, h('p', { class: 'klein' }, 'Alle Dinge aus dem Bild:'), liste);

  const wahlBild = h('button', { type: 'button' }, 'Bild');
  const wahlListe = h('button', { type: 'button' }, 'Liste');
  const zeige = () => {
    scroller.hidden = modus !== 'bild';
    listenBox.hidden = modus !== 'liste';
    wahlBild.setAttribute('aria-pressed', String(modus === 'bild'));
    wahlListe.setAttribute('aria-pressed', String(modus === 'liste'));
  };
  wahlBild.addEventListener('click', () => { modus = 'bild'; schreiben('spurensuche-modus', modus); zeige(); });
  wahlListe.addEventListener('click', () => { modus = 'liste'; schreiben('spurensuche-modus', modus); zeige(); });

  flaeche.append(
    aufgabeBox,
    h('div', { class: 'zeile zeile--zwischen' },
      h('p', { class: 'klein', style: { margin: 0 } }, 'Tippen: ', rollenMarke('navigation')),
      h('div', { class: 'ansicht-wahl', role: 'group', 'aria-label': 'Darstellung' }, wahlBild, wahlListe)),
    h('p', { class: 'klein nur-schmal', style: { margin: 0 } }, 'Das Bild lässt sich seitlich verschieben. Oder wählt oben „Liste“.'),
    scroller, listenBox,
    h('details', { class: 'bildbeschreibung' }, h('summary', {}, 'Bildbeschreibung lesen'), lesetext(s.bild)));
  zeige();

  function zeigeAufgabe() {
    leeren(aufgabeBox);
    const a = s.aufgaben[nr];
    aufgabeBox.append(
      h('div', { class: 'aufgabe' }, h('span', { class: 'aufgabe__nr' }, `Aufgabe ${nr + 1} von ${s.aufgaben.length}`)),
      lesetext(a.text, { gross: true }));
  }

  function markierungenEntfernen() {
    for (const [b, bl] of knoepfe.values()) { b.classList.remove('markiert'); bl.classList.remove('markiert'); }
  }

  function tippe(o) {
    if (wartet) return;
    const a = s.aufgaben[nr];
    if (!a) return;
    api.eingabe('navigation');
    if (o.id === a.ziel) {
      api.versuch(true);
      gefunden.add(o.id);
      markierungenEntfernen();
      const [b, bl] = knoepfe.get(o.id);
      b.classList.add('gefunden');
      b.setAttribute('aria-label', `${o.name} (gefunden)`);
      bl.textContent = `${o.name} ✓`;
      wartet = true;
      api.hilfenZuruecksetzen();
      const letzte = nr === s.aufgaben.length - 1;
      const weiter = knopf({
        text: letzte ? 'Alles gefunden – weiter' : 'Nächste Aufgabe', symbol: 'weiter', klasse: 'knopf--gruen',
        onclick: () => {
          api.eingabe('protokoll');
          wartet = false;
          api.rueckmeldung(null);
          if (letzte) { api.fertig(); return; }
          nr += 1;
          zeigeAufgabe();
          api.hilfenZuruecksetzen();
          const t = aufgabeBox.querySelector('.lesbar__text');
          if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
        },
      });
      api.rueckmeldung(h('div', { class: 'stapel' }, lesetext(a.fund, { gross: true }), h('div', { class: 'zeile' }, weiter, rollenMarke('protokoll'))), 'gut');
      weiter.focus();
      api.ansage('Richtig gefunden!');
    } else if (gefunden.has(o.id)) {
      api.rueckmeldung('feedback.schon');
    } else if (s.aufgaben.some((x) => x.ziel === o.id)) {
      api.versuch(false);
      api.rueckmeldung('feedback.spaeter');
    } else {
      api.versuch(false);
      api.rueckmeldung(o.antwort || 'feedback.schon');
    }
  }

  zeigeAufgabe();
  return {
    tipps: () => { const a = s.aufgaben[nr]; return a && !wartet ? { t1: a.tipp1, t2: a.tipp2 } : null; },
    loesung: () => {
      const a = s.aufgaben[nr];
      if (!a) return;
      const [b, bl] = knoepfe.get(a.ziel);
      b.classList.add('markiert');
      bl.classList.add('markiert');
      api.rueckmeldung('feedback.loesung_markiert');
      (modus === 'bild' ? b : bl).focus();
    },
  };
}
