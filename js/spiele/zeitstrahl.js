// Spieltyp „Zeitstrahl“: Ereignisse ordnen – mit Knöpfen „nach oben“/„nach unten“ (Tippen und Tastatur).
import { h, knopf, icon, leeren } from '../ui.js';
import { lesetext, t } from '../text.js';
import { zeitBild } from '../grafik/symbole.js';
import { rollenMarke } from '../ansichten/teile.js';

export function zeitstrahl(flaeche, s, api) {
  let reihe = [...s.start];
  const richtigeReihe = s.karten.map((k) => k.id);
  let geprueft = new Set();
  let geloest = false;
  const karte = (id) => s.karten.find((k) => k.id === id);

  const liste = h('ol', { class: 'zeitstrahl', 'aria-label': 'Zeitstrahl: oben das früheste Ereignis' });
  const pruefen = knopf({ text: 'Reihenfolge prüfen', symbol: 'haken', klasse: 'knopf--gruen', onclick: pruefe });
  const loesungBox = h('div', { class: 'stapel' });

  flaeche.append(
    h('div', { class: 'karte-box stapel' }, lesetext(s.aufgabe, { gross: true }),
      h('p', { class: 'klein', style: { margin: 0 } }, 'Verschieben: ', rollenMarke('navigation'), ' · Prüfen: ', rollenMarke('protokoll'))),
    h('p', { class: 'abzeichen abzeichen--blau' }, 'Oben: früher · Unten: später'),
    liste,
    h('div', { class: 'zeile' }, pruefen),
    loesungBox);

  function zeichne(fokus = null) {
    leeren(liste);
    reihe.forEach((id, i) => {
      const k = karte(id);
      const ok = geprueft.has(id) && richtigeReihe[i] === id;
      const hoch = h('button', { type: 'button', class: 'knopf knopf--zweit knopf--klein', 'aria-label': `„${k.titel}“ nach oben`, disabled: i === 0 || geloest, onclick: () => schiebe(i, -1) },
        h('span', { class: 'knopf__icon', 'aria-hidden': 'true', svg: icon('hoch') }), h('span', { 'aria-hidden': 'true' }, 'nach oben'));
      const runter = h('button', { type: 'button', class: 'knopf knopf--zweit knopf--klein', 'aria-label': `„${k.titel}“ nach unten`, disabled: i === reihe.length - 1 || geloest, onclick: () => schiebe(i, 1) },
        h('span', { class: 'knopf__icon', 'aria-hidden': 'true', svg: icon('runter') }), h('span', { 'aria-hidden': 'true' }, 'nach unten'));
      hoch.dataset.k = `${id}-hoch`;
      runter.dataset.k = `${id}-runter`;
      const li = h('li', { class: 'zskarte' + (ok || geloest ? ' richtig' : '') + (fokus && fokus.id === id ? ' bewegt' : '') },
        h('div', { class: 'zskarte__icon', svg: zeitBild(k.icon) }),
        h('div', {},
          h('h3', { class: 'zskarte__titel' }, k.titel, geloest ? h('span', { class: 'zskarte__datum' }, ` · ${k.datum}`) : null),
          lesetext(k.text),
          ok && !geloest ? h('p', { class: 'abzeichen abzeichen--gruen', style: { marginTop: '.4rem' } }, '✓ steht richtig') : null),
        h('div', { class: 'zskarte__knoepfe' }, hoch, runter));
      liste.append(li);
    });
    pruefen.disabled = geloest;
    if (fokus) {
      let ziel = liste.querySelector(`[data-k="${fokus.id}-${fokus.richtung}"]`);
      if (!ziel || ziel.disabled) ziel = liste.querySelector(`[data-k="${fokus.id}-${fokus.richtung === 'hoch' ? 'runter' : 'hoch'}"]`);
      if (ziel) ziel.focus();
    }
  }

  function schiebe(i, richtung) {
    const j = i + richtung;
    if (j < 0 || j >= reihe.length) return;
    api.eingabe('navigation');
    const id = reihe[i];
    [reihe[i], reihe[j]] = [reihe[j], reihe[i]];
    geprueft = new Set();
    zeichne({ id, richtung: richtung < 0 ? 'hoch' : 'runter' });
    api.ansage(`„${karte(id).titel}“ steht jetzt auf Platz ${j + 1} von ${reihe.length}.`);
  }

  function pruefe() {
    api.eingabe('protokoll');
    const alle = reihe.every((id, i) => richtigeReihe[i] === id);
    api.versuch(alle);
    geprueft = new Set(reihe);
    if (alle) {
      geloest = true;
      zeichne();
      leeren(loesungBox);
      const weiter = knopf({ text: 'Weiter', symbol: 'weiter', klasse: 'knopf--gruen', onclick: () => { api.eingabe('protokoll'); api.fertig(); } });
      loesungBox.append(h('div', { class: 'rueckmeldung rueckmeldung--gut stapel' }, h('h2', { style: { fontSize: '1.2rem', margin: 0 } }, 'Richtig sortiert!'), lesetext(s.loesungText, { gross: true }), weiter));
      api.rueckmeldung(null);
      weiter.focus();
      return;
    }
    const anzahl = reihe.filter((id, i) => richtigeReihe[i] === id).length;
    zeichne();
    api.rueckmeldung(h('div', { class: 'stapel' }, lesetext('zeitstrahl.teil'), h('p', { style: { margin: 0, fontWeight: 700 } }, `${anzahl} von ${reihe.length} Karten stehen schon richtig.`)), 'hinweis');
  }

  zeichne();
  return {
    tipps: () => (geloest ? null : { t1: s.tipp1, t2: s.tipp2 }),
    loesung: () => {
      reihe = [...richtigeReihe];
      geprueft = new Set();
      zeichne();
      api.rueckmeldung(h('p', { style: { margin: 0 } }, 'Die Karten stehen jetzt in der richtigen Reihenfolge. Lest sie noch einmal und prüft dann mit dem Protokoll-Knopf.'), 'hinweis', false);
      pruefen.focus();
    },
  };
}
