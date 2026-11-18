// Spieltyp „Schätzfrage im Team“: Die Gruppe berät und gibt EINE gemeinsame Schätzung ab.
// Es gibt keine Einzeleingaben einzelner Kinder (Anlage 2, G1). Danach: Lösung und Lösungsweg.
import { h, knopf, leeren, zahl } from '../ui.js';
import { lesetext } from '../text.js';
import { rollenMarke } from '../ansichten/teile.js';

function zahlenstrahl(schaetzung, loesung, einheit) {
  const oben = Math.max(loesung * 1.6, (schaetzung ?? 0) * 1.15, 10);
  const x = (v) => 30 + (Math.min(v, oben) / oben) * 460;
  const anker = (v) => (x(v) < 110 ? 'start' : x(v) > 410 ? 'end' : 'middle');
  const tx = (v) => (anker(v) === 'start' ? x(v) - 12 : anker(v) === 'end' ? x(v) + 12 : x(v));
  const marke = (v, farbe, text, unten) => `<g><path d="M${x(v)} ${unten ? 84 : 46}V64" stroke="${farbe}" stroke-width="6" stroke-linecap="round"/><circle cx="${x(v)}" cy="64" r="11" fill="${farbe}" stroke="#1C2541" stroke-width="3"/><text x="${tx(v)}" y="${unten ? 116 : 30}" text-anchor="${anker(v)}" font-family="Atkinson Hyperlegible, sans-serif" font-weight="700" font-size="24" fill="#1C2541">${text}</text></g>`;
  const beschreibung = schaetzung === null
    ? `Zahlenstrahl: Lösung ${zahl(loesung)} ${einheit}.`
    : `Zahlenstrahl: Eure Schätzung ${zahl(schaetzung)} ${einheit}, Lösung ${zahl(loesung)} ${einheit}.`;
  return `<svg viewBox="0 0 520 130" xmlns="http://www.w3.org/2000/svg" role="img"><title>${beschreibung}</title>
    <path d="M30 64H490" stroke="#1C2541" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 54v20M490 54v20" stroke="#1C2541" stroke-width="4"/>
    ${marke(loesung, '#1E6B4F', `Lösung: ${zahl(loesung)}`, true)}
    ${schaetzung === null ? '' : marke(schaetzung, '#F2B23A', `Schätzung: ${zahl(schaetzung)}`, false)}
  </svg>`;
}

export function schaetzfrage(flaeche, s, api) {
  let wert = s.start;
  let fertig = false;
  const [klein, gross] = s.schritte;

  const eingabe = h('input', { type: 'number', id: `schaetzung-${s.id}`, inputmode: 'numeric', min: s.min, max: s.max, step: klein, value: wert, 'aria-describedby': `einheit-${s.id}` });
  const setze = (v) => {
    wert = Math.max(s.min, Math.min(s.max, Math.round(Number(v) || 0)));
    eingabe.value = String(wert);
  };
  eingabe.addEventListener('change', () => { api.eingabe('navigation'); setze(eingabe.value); });
  const stufe = (d) => knopf({
    text: (d > 0 ? '+' : '−') + zahl(Math.abs(d)), klasse: 'knopf--zweit knopf--klein',
    'aria-label': `${zahl(Math.abs(d))} ${s.einheit} ${d > 0 ? 'mehr' : 'weniger'}`,
    onclick: () => { api.eingabe('navigation'); setze(wert + d); api.ansage(`${zahl(wert)} ${s.einheit}`); },
  });

  const abgeben = knopf({ text: 'Gemeinsame Schätzung abgeben', symbol: 'haken', klasse: 'knopf--gruen', onclick: frageEinig });
  const bereich = h('div', { class: 'stapel' });
  flaeche.append(
    h('div', { class: 'karte-box stapel' }, lesetext(s.frage, { gross: true })),
    h('div', { class: 'karte-box karte-box--hinweis' }, lesetext('schaetz.beraten')),
    bereich);

  function beraten() {
    leeren(bereich);
    bereich.append(
      h('div', { class: 'schaetzer' },
        h('label', { for: eingabe.id, style: { fontWeight: 700 } }, 'Eure gemeinsame Schätzung'),
        h('div', { class: 'schaetzer__zahl' }, eingabe, h('span', { class: 'schaetzer__einheit', id: `einheit-${s.id}` }, s.einheit)),
        h('div', { class: 'schaetzer__stufen', role: 'group', 'aria-label': 'Schätzung verändern' }, stufe(-gross), stufe(-klein), stufe(klein), stufe(gross)),
        h('p', { class: 'klein', style: { margin: 0 } }, 'Einstellen: ', rollenMarke('navigation'), ' · Abgeben: ', rollenMarke('protokoll')),
        abgeben));
  }

  function frageEinig() {
    api.eingabe('protokoll');
    setze(eingabe.value);
    leeren(bereich);
    const ja = knopf({ text: 'Ja, wir sind uns einig', symbol: 'haken', klasse: 'knopf--gruen', onclick: () => { api.eingabe('protokoll'); api.abstimmung(); aufloesen(false); } });
    const nein = knopf({ text: 'Noch einmal beraten', klasse: 'knopf--zweit', onclick: () => { api.eingabe('protokoll'); beraten(); eingabe.focus(); } });
    bereich.append(h('div', { class: 'schaetzer' },
      h('p', { class: 'formel' }, `${zahl(wert)} ${s.einheit}`),
      lesetext('schaetz.einig', { gross: true }),
      h('div', { class: 'zeile', style: { justifyContent: 'center' } }, ja, nein)));
    ja.focus();
  }

  function aufloesen(loesungGezeigt) {
    if (fertig) return;
    fertig = true;
    const stufeHilfe = api.hilfeStufe();
    api.weg(loesungGezeigt ? 'Lösung angezeigt' : stufeHilfe >= 2 ? 'gerechnet mit Tipp 2' : stufeHilfe === 1 ? 'geschätzt mit Tipp 1' : 'geschätzt ohne Tipp');
    api.versuch(true);
    api.rueckmeldung(null);
    leeren(bereich);
    const schaetzung = loesungGezeigt ? null : wert;
    const weiter = knopf({ text: 'Weiter', symbol: 'weiter', klasse: 'knopf--gruen', onclick: () => { api.eingabe('protokoll'); api.fertig(); } });
    bereich.append(h('section', { class: 'karte-box stapel', 'aria-labelledby': `h-aufl-${s.id}` },
      h('h2', { id: `h-aufl-${s.id}` }, 'Die Auflösung'),
      h('div', { class: 'zahlenstrahl', svg: zahlenstrahl(schaetzung, s.loesung, s.einheit) }),
      schaetzung === null ? null : h('p', { style: { fontWeight: 700 } }, `Eure Schätzung: ${zahl(schaetzung)} ${s.einheit} · Lösung: ${s.loesungAnzeige}`),
      lesetext(s.aufloesung, { gross: true }),
      h('h3', {}, 'Der Lösungsweg'),
      h('p', { class: 'formel', 'aria-hidden': 'true' }, s.formel),
      lesetext(s.rechenweg),
      schaetzung === null ? null : lesetext('schaetz.vergleich'),
      weiter));
    const h2 = bereich.querySelector('h2');
    if (h2) { h2.setAttribute('tabindex', '-1'); h2.focus(); }
  }

  beraten();
  return {
    tipps: () => (fertig ? null : { t1: s.tipp1, t2: s.tipp2 }),
    loesung: () => aufloesen(true),
  };
}
