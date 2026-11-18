// Spieltyp „Zuordnen“: Karten per Tippen auswählen und einem Korb zuordnen. Keine Ziehgesten nötig.
import { h, knopf, leeren } from '../ui.js';
import { lesetext } from '../text.js';
import { zuordnenBild } from '../grafik/symbole.js';
import { rollenMarke } from '../ansichten/teile.js';

export function zuordnen(flaeche, s, api) {
  const lage = new Map(s.karten.map((k) => [k.id, 'stapel']));
  const richtig = new Set();
  let auswahl = null;
  let geloest = false;

  const stapel = h('ul', { class: 'stapel-karten', 'aria-label': 'Karten, die noch zugeordnet werden' });
  const korbListen = new Map();
  const korbKnoepfe = new Map();
  const pruefen = knopf({ text: 'Zuordnung prüfen', symbol: 'haken', klasse: 'knopf--gruen', onclick: pruefe });

  const koerbe = h('div', { class: 'koerbe' }, s.koerbe.map((k) => {
    const ul = h('ul', { 'aria-label': `Karten im Korb: ${k.name}` });
    const b = knopf({ text: 'Hierher legen', symbol: 'runter', klasse: 'knopf--klein', onclick: () => ablegen(k.id), 'aria-label': `Ausgewählte Karte hierher legen: ${k.name}` });
    korbListen.set(k.id, ul);
    korbKnoepfe.set(k.id, b);
    return h('section', { class: `korb korb--${k.id}`, 'aria-label': k.name },
      h('div', { class: 'korb__kopf' }, h('h3', {}, k.name), b), ul);
  }));

  flaeche.append(
    h('div', { class: 'karte-box stapel' }, lesetext(s.aufgabe, { gross: true }),
      h('p', { class: 'klein', style: { margin: 0 } }, 'Karten wählen und ablegen: ', rollenMarke('navigation'), ' · Prüfen: ', rollenMarke('protokoll'))),
    h('h2', { class: 'sr-only' }, 'Kartenstapel'),
    stapel, koerbe,
    h('div', { class: 'zeile' }, pruefen));

  function kartenKnopf(k) {
    const fest = richtig.has(k.id);
    const b = h('button', {
      type: 'button', class: 'zkarte' + (fest ? ' richtig' : ''),
      'aria-pressed': String(auswahl === k.id),
      'aria-label': fest ? `${k.name}, richtig zugeordnet` : k.name,
      disabled: fest,
      onclick: () => waehle(k.id),
    }, h('span', { svg: zuordnenBild(k.icon), 'aria-hidden': 'true' }), k.name, fest ? ' ✓' : '');
    b.dataset.karte = k.id;
    return b;
  }

  function zeichne(fokusKarte = null) {
    leeren(stapel);
    korbListen.forEach((ul) => leeren(ul));
    for (const k of s.karten) {
      const ort = lage.get(k.id);
      const li = h('li', {}, kartenKnopf(k));
      if (ort === 'stapel') stapel.append(li);
      else korbListen.get(ort).append(li);
    }
    if (!stapel.children.length) stapel.append(h('li', { class: 'klein' }, 'Alle Karten liegen in Körben. Jetzt prüfen!'));
    korbKnoepfe.forEach((b) => { b.disabled = !auswahl; });
    pruefen.disabled = s.karten.some((k) => lage.get(k.id) === 'stapel');
    if (fokusKarte) {
      const el = flaeche.querySelector(`[data-karte="${fokusKarte}"]`);
      if (el) el.focus();
    }
  }

  function waehle(id) {
    api.eingabe('navigation');
    auswahl = auswahl === id ? null : id;
    zeichne(id);
    if (auswahl) api.ansage(`${s.karten.find((k) => k.id === id).name} ausgewählt. Wählt jetzt einen Korb.`);
  }

  function ablegen(korbId) {
    if (!auswahl) return;
    api.eingabe('navigation');
    const karte = s.karten.find((k) => k.id === auswahl);
    lage.set(auswahl, korbId);
    auswahl = null;
    zeichne();
    api.ansage(`${karte.name} liegt jetzt im Korb „${s.koerbe.find((k) => k.id === korbId).name}“.`);
    const naechste = stapel.querySelector('button.zkarte');
    (naechste || (pruefen.disabled ? null : pruefen) || korbKnoepfe.get(korbId)).focus();
  }

  function pruefe() {
    api.eingabe('protokoll');
    const falsch = s.karten.filter((k) => !richtig.has(k.id) && lage.get(k.id) !== k.korb);
    s.karten.forEach((k) => { if (lage.get(k.id) === k.korb) richtig.add(k.id); });
    api.versuch(falsch.length === 0);
    if (!falsch.length) {
      geloest = true;
      zeichne();
      const weiter = knopf({ text: 'Weiter', symbol: 'weiter', klasse: 'knopf--gruen', onclick: () => { api.eingabe('protokoll'); api.fertig(); } });
      api.rueckmeldung(h('div', { class: 'stapel' }, h('p', { style: { fontWeight: 700, margin: 0 } }, 'Alles richtig zugeordnet!'), weiter), 'gut');
      weiter.focus();
      return;
    }
    falsch.forEach((k) => lage.set(k.id, 'stapel'));
    zeichne();
    api.rueckmeldung(h('div', { class: 'stapel' }, lesetext('zuordnen.teil'), ...falsch.map((k) => h('div', { class: 'hilfetext' }, h('p', { class: 'klein', style: { margin: '0 0 .2rem', fontWeight: 700 } }, k.name), lesetext(k.falsch)))), 'hinweis');
    const erste = stapel.querySelector('button.zkarte');
    if (erste) erste.focus();
  }

  zeichne();
  return {
    tipps: () => (geloest ? null : { t1: s.tipp1, t2: s.tipp2 }),
    loesung: () => {
      s.karten.forEach((k) => lage.set(k.id, k.korb));
      auswahl = null;
      zeichne();
      api.rueckmeldung(h('p', { style: { margin: 0 } }, 'Die Lösung ist eingetragen. Lest die Karten noch einmal und prüft dann mit dem Protokoll-Knopf.'), 'hinweis', false);
      pruefen.focus();
    },
  };
}
