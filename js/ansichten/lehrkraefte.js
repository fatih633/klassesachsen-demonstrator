// Lehrkräfte-Ansicht (Demo mit rein lokalen Daten) – Anlage 2, F1 bis F8.
// Grundsätze: nur Gruppenebene (G1), keine Einzelbewertung (G2), keine Noten/Punkte/Rangfolge (G3),
// Prozess vor Ergebnis (G4). Fester Hinweis „Beobachtung, keine Bewertung“.
import { h, knopf, knopfLink, icon, leeren, ansage, datum, dauerText } from '../ui.js';
import { alleSpiele, alleOrte, ort as holeOrt, item as holeItem, SPIELTYP, ORTE } from '../inhalt.js';
import {
  gruppen, gruppe as holeGruppe, gruppeAnlegen, gruppeUmbenennen, gruppeLoeschen, freigabeSetzen, istKern,
  VORSCHLAEGE, ROLLEN, ROLLEN_NAME, rasterSetzen, entwurfSetzen, beitraege, beitragStatus, loeschdatum,
  beispielGruppenAnlegen, alleItemsFreischalten, AUFBEWAHRUNG_TAGE, profil,
} from '../daten.js';
import { zeichneCollage } from '../collage/generator.js';

const QUEST = 'Was ist sächsisch?';
const STUFEN = [
  { id: 'start', name: 'erste Schritte' },
  { id: 'weg', name: 'auf dem Weg' },
  { id: 'sicher', name: 'sicher unterwegs' },
];
const RASTER = {
  team: {
    name: 'Teamleistung',
    start: 'Die Gruppe hat Stationen begonnen; gemeinsame Abschlüsse stehen noch aus.',
    weg: 'Die Gruppe hat einzelne Stationen gemeinsam abgeschlossen.',
    sicher: 'Die Gruppe hat alle begonnenen Stationen gemeinsam abgeschlossen.',
  },
  problem: {
    name: 'Problemlösung',
    start: 'Die Gruppe hat Aufgaben vor allem mithilfe der eingeblendeten Lösung abgeschlossen.',
    weg: 'Die Gruppe hat Tipps genutzt und Aufgaben ohne eingeblendete Lösung gelöst.',
    sicher: 'Nach Fehlversuchen hat die Gruppe ihr Vorgehen gewechselt und die Aufgaben selbstständig gelöst.',
  },
  beteiligung: {
    name: 'Beteiligung',
    start: 'Die Eingaben kamen überwiegend von einer Rollenposition.',
    weg: 'Alle drei Rollenpositionen haben Eingaben gemacht.',
    sicher: 'Alle Rollenpositionen waren beteiligt; die Gruppe hat gemeinsame Entscheidungen ausdrücklich bestätigt.',
  },
};
const STATUS = { offen: 'offen', laeuft: 'läuft', abgeschlossen: 'abgeschlossen', abgebrochen: 'abgebrochen' };

// ---------- Auswertung (regelbasiert, transparent) ----------
function kennzahlen(g) {
  const st = Object.entries(g.stationen || {});
  const begonnen = st.filter(([, s]) => s.beginn).length;
  const fertig = st.filter(([, s]) => s.status === 'abgeschlossen').length;
  const mitLoesung = st.filter(([, s]) => s.status === 'abgeschlossen' && s.hilfen.some((x) => x.stufe === 3)).length;
  const wechsel = st.filter(([, s]) => s.wechsel);
  const eingaben = { navigation: 0, protokoll: 0, recherche: 0 };
  let abstimmungen = 0;
  st.forEach(([, s]) => { ROLLEN.forEach((r) => { eingaben[r] += s.eingaben[r] || 0; }); abstimmungen += s.abstimmungen || 0; });
  return { st, begonnen, fertig, mitLoesung, wechsel, eingaben, abstimmungen };
}

export function vorschlaege(g) {
  const k = kennzahlen(g);
  const v = {};
  if (!k.begonnen) v.team = null;
  else if (!k.fertig) v.team = { stufe: 'start', grund: `${k.begonnen} Station(en) begonnen, noch keine abgeschlossen.` };
  else if (k.fertig === k.begonnen && k.fertig >= 2) v.team = { stufe: 'sicher', grund: `Alle ${k.fertig} begonnenen Stationen abgeschlossen.` };
  else v.team = { stufe: 'weg', grund: `${k.fertig} von ${k.begonnen} begonnenen Stationen abgeschlossen.` };

  if (!k.fertig) v.problem = null;
  else if (k.mitLoesung * 2 >= k.fertig) v.problem = { stufe: 'start', grund: `Bei ${k.mitLoesung} von ${k.fertig} abgeschlossenen Stationen wurde „Lösung zeigen“ genutzt.` };
  else if (k.wechsel.length) v.problem = { stufe: 'sicher', grund: `Vorgehen nach Fehlversuch gewechselt an ${k.wechsel.length} Station(en).` };
  else v.problem = { stufe: 'weg', grund: 'Aufgaben ohne eingeblendete Lösung abgeschlossen; kein Vorgehenswechsel beobachtet.' };

  const summe = ROLLEN.reduce((a, r) => a + k.eingaben[r], 0);
  if (!summe) v.beteiligung = null;
  else if (ROLLEN.some((r) => k.eingaben[r] === 0) || ROLLEN.some((r) => k.eingaben[r] > summe * 0.7)) v.beteiligung = { stufe: 'start', grund: 'Die Eingaben verteilen sich ungleich; eine Rollenposition überwiegt deutlich.' };
  else if (k.abstimmungen > 0) v.beteiligung = { stufe: 'sicher', grund: 'Alle Rollenpositionen mit Eingaben; gemeinsame Entscheidung bestätigt.' };
  else v.beteiligung = { stufe: 'weg', grund: 'Alle drei Rollenpositionen haben Eingaben gemacht.' };
  return v;
}

export function entwurfErzeugen(g) {
  const k = kennzahlen(g);
  const r = g.raster || {};
  const saetze = [];
  const letzte = k.st.map(([, s]) => s.ende || s.beginn).filter(Boolean).sort().pop();
  saetze.push(`Die Gruppe „${g.bezeichnung}“ hat${letzte ? ` am ${datum(letzte)}` : ''} an der Quest „${QUEST}“ gearbeitet.`);
  for (const zeile of ['team', 'problem', 'beteiligung']) {
    if (r[zeile]) saetze.push(RASTER[zeile][r[zeile]]);
  }
  const wechselStation = k.wechsel[0];
  if (wechselStation) {
    const s = alleSpiele().find((x) => x.id === wechselStation[0]);
    saetze.push(`An der Station „${s ? s.titel : wechselStation[0]}“ hat die Gruppe nach einem Fehlversuch ihr Vorgehen gewechselt.`);
  }
  const mitAbstimmung = k.st.filter(([, s]) => s.abstimmungen > 0).map(([id]) => alleSpiele().find((x) => x.id === id));
  if (mitAbstimmung.length) saetze.push(`Bei der Schätzfrage „${mitAbstimmung[0].titel}“ hat die Gruppe sich beraten und eine gemeinsame Schätzung bestätigt.`);
  if (!['team', 'problem', 'beteiligung'].some((z) => r[z])) saetze.push('(Noch keine Niveaustufen gewählt – bitte im Kompetenzraster auswählen.)');
  return saetze.join(' ');
}

// ---------- Teilansichten ----------
function hinweisband() {
  return h('div', { class: 'hinweisband', role: 'note' },
    h('span', { 'aria-hidden': 'true', svg: icon('info'), style: { width: '1.4rem', height: '1.4rem', display: 'inline-flex', flex: 'none' } }),
    'Beobachtung, keine Bewertung. Keine Noten, keine Punkte, keine Ranglisten.');
}

function reiter(aktiv) {
  const eintraege = [['gruppen', 'Gruppen und Freigabe'], ['uebersicht', 'Laufende Übersicht'], ['bildbeitraege', 'Bildbeiträge'], ['material', 'Material und Demo']];
  return h('nav', { 'aria-label': 'Bereiche der Lehrkräfte-Ansicht', class: 'nicht-drucken' },
    h('ul', { class: 'reiter' }, eintraege.map(([id, name]) => h('li', {},
      h('a', { href: `#/lehrkraefte/${id}`, 'aria-current': aktiv === id ? 'page' : null }, name)))));
}

function gruppenBereich(neuZeichnen) {
  const feld = h('input', { type: 'text', id: 'neue-gruppe', maxlength: 40, autocomplete: 'off', 'aria-describedby': 'gruppe-hinweis gruppe-warnung' });
  const bestaetigung = h('input', { type: 'checkbox', id: 'keine-namen' });
  const meldung = h('div', { 'aria-live': 'polite' });
  const vorschlag = h('ul', { class: 'vorschlaege', 'aria-label': 'Vorschläge für neutrale Bezeichnungen' },
    VORSCHLAEGE.map((v) => h('li', {}, h('button', { type: 'button', onclick: () => { feld.value = v; bestaetigung.checked = true; feld.focus(); } }, v))));
  const anlegen = (e) => {
    e.preventDefault();
    leeren(meldung);
    const name = feld.value.trim();
    if (!name) { meldung.append(h('p', { class: 'feld__warnung' }, 'Bitte eine Bezeichnung eingeben oder einen Vorschlag wählen.')); feld.focus(); return; }
    if (!VORSCHLAEGE.includes(name) && !bestaetigung.checked) {
      meldung.append(h('p', { class: 'feld__warnung', role: 'alert' }, 'Bitte bestätigen Sie vor dem Speichern, dass die Bezeichnung keine Namen oder Namensbestandteile von Kindern enthält.'));
      bestaetigung.focus();
      return;
    }
    const g = gruppeAnlegen(name);
    ansage(`Gruppe „${g.bezeichnung}“ angelegt. Jetzt die Quest freigeben.`);
    neuZeichnen(g.id);
  };

  const liste = gruppen();
  return h('div', { class: 'stapel' },
    h('section', { class: 'karte-box', 'aria-labelledby': 'h-neu' },
      h('h2', { id: 'h-neu' }, 'Gruppe anlegen (F1)'),
      h('form', { onsubmit: anlegen },
        h('div', { class: 'feld' },
          h('span', { class: 'feld__titel', id: 'vorschlag-titel' }, 'Neutrale Vorschläge'),
          vorschlag),
        h('div', { class: 'feld' },
          h('label', { for: 'neue-gruppe' }, 'Bezeichnung der Gruppe'),
          h('p', { class: 'feld__hinweis', id: 'gruppe-hinweis' }, 'Frei wählbar, zum Beispiel ein Tier, eine Farbe oder ein Gegenstand.'),
          feld,
          h('p', { class: 'feld__warnung', id: 'gruppe-warnung' },
            h('span', { 'aria-hidden': 'true', svg: icon('info'), style: { width: '1.3rem', height: '1.3rem', display: 'inline-flex', flex: 'none' } }),
            'Bitte keine echten Namen oder Namensbestandteile von Kindern eingeben. Die App speichert nicht, wer zu welcher Gruppe gehört.'),
          h('label', { class: 'option', for: 'keine-namen' }, bestaetigung, 'Die Bezeichnung enthält keine Namen von Kindern.')),
        meldung,
        h('button', { type: 'submit', class: 'knopf' }, 'Gruppe anlegen'))),
    h('section', { 'aria-labelledby': 'h-liste', class: 'stapel' },
      h('h2', { id: 'h-liste' }, `Gruppen auf diesem Gerät (${liste.length})`),
      liste.length ? null : h('p', {}, 'Noch keine Gruppen. Tipp: Unter „Material und Demo“ lassen sich Beispielgruppen mit synthetischen Daten anlegen.'),
      ...liste.map((g) => gruppenKarte(g, neuZeichnen))));
}

function gruppenKarte(g, neuZeichnen) {
  const fr = g.freigabe;
  const umbenennen = h('details', {},
    h('summary', { class: 'knopf knopf--klein knopf--zweit' }, 'Umbenennen'),
    h('form', { class: 'feld', style: { marginTop: '.6rem' }, onsubmit: (e) => { e.preventDefault(); const neu = e.target.elements.namedItem('neu').value.trim(); if (neu) { gruppeUmbenennen(g.id, neu); ansage('Gruppe umbenannt.'); neuZeichnen(g.id); } } },
      h('label', { for: `neu-${g.id}` }, 'Neue Bezeichnung (keine Namen von Kindern)'),
      h('input', { type: 'text', id: `neu-${g.id}`, name: 'neu', value: g.bezeichnung, maxlength: 40 }),
      h('button', { type: 'submit', class: 'knopf knopf--klein' }, 'Speichern')));

  // F2 Questfreigabe
  const orteFelder = alleOrte().map((o) => h('label', { class: 'option' },
    h('input', { type: 'checkbox', name: 'orte', value: o.id, checked: fr ? fr.orte.includes(o.id) : true }), `${o.name} – ${o.thema}`));
  const stufen = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
  const auswahl = h('select', { id: `stufe-${g.id}`, name: 'stufe' },
    h('option', { value: '' }, 'Bitte wählen'),
    stufen.map((s) => h('option', { value: s, selected: fr && fr.klassenstufe === s }, `Klasse ${s}`)),
    h('option', { value: 'keine', selected: fr && fr.klassenstufe === 'keine' }, 'Keine Schulklasse (z. B. Familie, Hort)'));
  const kernAnzeige = h('p', { class: 'klein', 'aria-live': 'polite' });
  const kernText = () => {
    const v = auswahl.value;
    kernAnzeige.textContent = !v ? '' : istKern(v)
      ? 'Kernzielgruppe (Klasse 4 bis 10): Beobachtungen werden auf Gruppenebene erfasst.'
      : 'Außerhalb der Kernzielgruppe: Es wird nichts erfasst – es entstehen keine Beobachtungsdatensätze.';
  };
  auswahl.addEventListener('change', kernText);
  kernText();
  const einwilligung = h('input', { type: 'checkbox', name: 'einwilligung', checked: fr ? fr.einwilligung : false });
  const frMeldung = h('div', { 'aria-live': 'polite' });
  const freigeben = h('form', { class: 'stapel', onsubmit: (e) => {
    e.preventDefault();
    leeren(frMeldung);
    const orte = [...e.target.querySelectorAll('input[name="orte"]:checked')].map((x) => x.value);
    if (!orte.length) { frMeldung.append(h('p', { class: 'feld__warnung' }, 'Bitte mindestens einen Ort freigeben.')); return; }
    if (!auswahl.value) { frMeldung.append(h('p', { class: 'feld__warnung' }, 'Bitte die Lerngruppe (Klassenstufe) wählen.')); auswahl.focus(); return; }
    if (istKern(auswahl.value) && !einwilligung.checked) { frMeldung.append(h('p', { class: 'feld__warnung' }, 'Bitte bestätigen, dass die Einwilligungen vorliegen (nur bis zur Schullogin-Anbindung nötig).')); return; }
    freigabeSetzen(g.id, { orte, klassenstufe: auswahl.value, einwilligung: einwilligung.checked });
    ansage(`Quest für Gruppe „${g.bezeichnung}“ freigegeben.`);
    neuZeichnen(g.id);
  } },
    h('fieldset', {}, h('legend', {}, 'Orte der Quest'), orteFelder),
    h('div', { class: 'feld' }, h('label', { for: `stufe-${g.id}` }, 'Lerngruppe (Klassenstufe)'), auswahl, kernAnzeige),
    h('label', { class: 'option' }, einwilligung, 'Einwilligungen der Eltern liegen vor (Pilotbetrieb bis zur Schullogin-Anbindung).'),
    frMeldung,
    h('button', { type: 'submit', class: 'knopf knopf--klein' }, fr ? 'Freigabe ändern' : 'Quest freigeben'));

  return h('article', { class: 'karte-box stapel', 'aria-labelledby': `gk-${g.id}`, id: `gruppe-${g.id}` },
    h('div', { class: 'zeile zeile--zwischen' },
      h('h3', { id: `gk-${g.id}`, style: { margin: 0 } }, `„${g.bezeichnung}“`, g.beispiel ? h('span', { class: 'abzeichen', style: { marginLeft: '.5rem' } }, 'synthetische Beispieldaten') : null),
      h('div', { class: 'zeile' },
        knopfLink({ href: `#/lehrkraefte/gruppe/${g.id}`, text: 'Gruppenansicht', klasse: 'knopf--klein' }),
        umbenennen)),
    h('p', { class: 'klein', style: { margin: 0 } },
      `Angelegt am ${datum(g.angelegt)} · `,
      fr ? `Freigegeben: ${fr.orte.map((o) => holeOrt(o).name).join(', ')} · ${fr.klassenstufe === 'keine' ? 'keine Schulklasse' : 'Klasse ' + fr.klassenstufe} · ${fr.kern ? 'Beobachtung aktiv' : 'keine Erfassung'}` : 'Noch nicht freigegeben',
      ` · Automatische Löschung spätestens am ${datum(loeschdatum(g))}`),
    h('details', { open: !fr || null }, h('summary', {}, 'Questfreigabe (F2)'), freigeben),
    loeschKnopf(g, () => neuZeichnen(null)));
}

function loeschKnopf(g, danach) {
  const huelle = h('div', { class: 'zeile' });
  const zeigeStart = () => {
    leeren(huelle);
    huelle.append(knopf({ text: 'Gruppendaten jetzt löschen (F8)', symbol: 'muell', klasse: 'knopf--klein knopf--zweit', onclick: frage }));
  };
  const frage = () => {
    leeren(huelle);
    const ja = knopf({ text: 'Ja, endgültig löschen', symbol: 'muell', klasse: 'knopf--klein knopf--rot', onclick: () => { gruppeLoeschen(g.id); ansage(`Gruppe „${g.bezeichnung}“ und alle Daten gelöscht.`); danach(); } });
    huelle.append(h('p', { style: { margin: 0, fontWeight: 700 } }, `Alle Daten der Gruppe „${g.bezeichnung}“ unwiderruflich löschen?`), ja,
      knopf({ text: 'Abbrechen', klasse: 'knopf--klein knopf--zweit', onclick: () => { zeigeStart(); huelle.querySelector('button').focus(); } }));
    ja.focus();
  };
  zeigeStart();
  return huelle;
}

function uebersichtBereich() {
  const spiele = alleSpiele();
  const liste = gruppen().filter((g) => g.freigabe);
  if (!liste.length) return h('p', { class: 'karte-box' }, 'Noch keine freigegebenen Gruppen.');
  return h('section', { class: 'stapel', 'aria-labelledby': 'h-ueb' },
    h('h2', { id: 'h-ueb' }, 'Laufende Übersicht (F3)'),
    h('p', { class: 'klein' }, 'Bearbeitungsstand je Gruppe und Station – ohne Niveaustufen. Aktualisiert sich automatisch.'),
    h('div', { class: 'tabelle-huelle', tabindex: 0, role: 'region', 'aria-label': 'Tabelle, bei Bedarf seitlich verschiebbar' }, h('table', {},
      h('caption', { class: 'sr-only' }, 'Status jeder Station je Gruppe'),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Gruppe'), spiele.map((s) => h('th', { scope: 'col' }, `${holeOrt(s.ort).name}: ${s.titel}`)))),
      h('tbody', {}, liste.map((g) => h('tr', {},
        h('th', { scope: 'row' }, h('a', { href: `#/lehrkraefte/gruppe/${g.id}` }, g.bezeichnung)),
        spiele.map((s) => {
          if (!g.freigabe.orte.includes(s.ort)) return h('td', {}, h('span', { class: 'klein' }, 'nicht freigegeben'));
          if (!g.freigabe.kern) return h('td', {}, h('span', { class: 'klein' }, 'keine Erfassung'));
          const st = (g.stationen || {})[s.id];
          const status = st ? st.status : 'offen';
          return h('td', {}, h('span', { class: `status status--${status}` }, STATUS[status]));
        })))))));
}

function zeitText(ts) { return ts ? datum(ts, true) : '–'; }

function gruppenAnsicht(g, neuZeichnen) {
  const spiele = alleSpiele().filter((s) => !g.freigabe || g.freigabe.orte.includes(s.ort));
  const k = kennzahlen(g);
  const v = vorschlaege(g);
  const st = (id) => (g.stationen || {})[id];

  const tab = (kopf, zeilen) => h('div', { class: 'tabelle-huelle', tabindex: 0, role: 'region', 'aria-label': 'Tabelle, bei Bedarf seitlich verschiebbar' }, h('table', {}, h('thead', {}, h('tr', {}, kopf.map((x, i) => h('th', { scope: 'col' }, x)))), h('tbody', {}, zeilen)));
  const stationName = (s) => h('th', { scope: 'row' }, `${s.titel}`, h('br'), h('span', { class: 'klein' }, `${holeOrt(s.ort).name} · ${SPIELTYP[s.typ].name}`));

  const team = tab(['Station', 'Status (E2)', 'Beginn und Abschluss (E1)', 'Aktive Zeit (E9)'], spiele.map((s) => {
    const x = st(s.id);
    return h('tr', {}, stationName(s), h('td', {}, h('span', { class: `status status--${x ? x.status : 'offen'}` }, STATUS[x ? x.status : 'offen'])),
      h('td', {}, x ? `${zeitText(x.beginn)} bis ${zeitText(x.ende)}` : '–'), h('td', {}, x ? dauerText(x.aktivMs) : '–'));
  }));
  const problem = tab(['Station', 'Lösungsversuche (E3)', 'Hilfen mit Zeitpunkt (E5)', 'Vorgehen nach Fehlversuch gewechselt (E6)', 'Lösungswege (E4)'], spiele.map((s) => {
    const x = st(s.id);
    return h('tr', {}, stationName(s),
      h('td', {}, x ? `${x.versuche}${x.fehlversuche ? `, davon ${x.fehlversuche} Fehlversuch(e)` : ''}` : '–'),
      h('td', {}, x && x.hilfen.length ? x.hilfen.map((hf) => `${hf.stufe === 3 ? 'Lösung gezeigt' : 'Tipp ' + hf.stufe} (${datum(hf.zeit, true).split(', ')[1] || ''})`).join(', ') : 'keine'),
      h('td', {}, x ? (x.fehlversuche ? (x.wechsel ? 'ja' : 'nein') : 'kein Fehlversuch') : '–'),
      h('td', {}, x && x.wege.length ? x.wege.join(' → ') : (s.typ === 'schaetzfrage' ? '–' : 'nicht vorgesehen')));
  }));
  const summe = ROLLEN.reduce((a, r) => a + k.eingaben[r], 0);
  const beteiligung = h('div', { class: 'stapel' },
    tab(['Rollenposition', 'Eingaben gesamt (E7)'], ROLLEN.map((r) => h('tr', {}, h('th', { scope: 'row' }, ROLLEN_NAME[r]), h('td', {}, String(k.eingaben[r]))))),
    h('p', {}, `Gemeinsame Entscheidungen bestätigt (E8): ${k.abstimmungen === 0 ? 'keine' : k.abstimmungen + '-mal'} · Eingaben insgesamt: ${summe}`),
    h('p', { class: 'klein' }, 'Rollen sind Positionen am Gerät, keine Personen. Wer welche Rolle hatte, wird nicht gespeichert.'));
  const offline = (g.offline || []);
  const technik = h('p', {}, offline.length ? `Offline-Phasen (E10): ${offline.map((o) => `${zeitText(o.von)} bis ${o.bis ? zeitText(o.bis) : 'jetzt'}`).join('; ')}` : 'Offline-Phasen (E10): keine', ' · Synchronisation: entfällt im Demonstrator (keine Server-Speicherung).');

  // F5 Kompetenzraster
  const rasterTab = h('div', { class: 'tabelle-huelle', tabindex: 0, role: 'region', 'aria-label': 'Tabelle, bei Bedarf seitlich verschiebbar' }, h('table', { class: 'raster-tabelle' },
    h('caption', { class: 'sr-only' }, 'Kompetenzraster mit Niveaustufen'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Indikatorgruppe'), STUFEN.map((s) => h('th', { scope: 'col' }, s.name)), h('th', { scope: 'col', class: 'nicht-drucken' }, 'Hinweis aus den Beobachtungen'))),
    h('tbody', {}, Object.entries(RASTER).map(([zeile, def]) => h('tr', {},
      h('th', { scope: 'row' }, def.name),
      STUFEN.map((s) => {
        const gewaehlt = (g.raster || {})[zeile] === s.id;
        const r = h('input', { type: 'radio', name: `raster-${zeile}`, value: s.id, checked: gewaehlt });
        r.addEventListener('change', () => { rasterSetzen(g.id, zeile, s.id); ansage(`${def.name}: ${s.name} gewählt.`); neuZeichnen(g.id, `raster-${zeile}`); });
        return h('td', { class: gewaehlt ? 'gewaehlt' : '' }, h('label', { class: 'option' }, h('span', { class: 'nicht-drucken', style: { display: 'inline-flex' } }, r), h('span', {}, h('span', { class: 'sr-only' }, `${s.name}: `), def[s.id])));
      }),
      h('td', { class: 'nicht-drucken' }, v[zeile] ? h('span', {}, h('strong', {}, STUFEN.find((s) => s.id === v[zeile].stufe).name), ' – ', v[zeile].grund) : h('span', { class: 'klein' }, 'Noch keine Grundlage.')))))));

  const uebernehmen = knopf({ text: 'Hinweise übernehmen', klasse: 'knopf--klein knopf--zweit', onclick: () => {
    Object.entries(v).forEach(([zeile, x]) => { if (x) rasterSetzen(g.id, zeile, x.stufe); });
    ansage('Hinweise ins Raster übernommen. Bitte prüfen.');
    neuZeichnen(g.id);
  } });

  // F7 Formulierungsentwurf
  const text = h('textarea', { id: `entwurf-${g.id}`, 'aria-describedby': `entwurf-hinweis-${g.id}` });
  text.value = g.entwurf || entwurfErzeugen(g);
  const druckText = h('p', { class: 'bericht-text nur-druck' }, text.value);
  text.addEventListener('input', () => { druckText.textContent = text.value; });
  const speichern = knopf({ text: 'Entwurf speichern', klasse: 'knopf--klein', onclick: () => { entwurfSetzen(g.id, text.value); ansage('Entwurf gespeichert.'); } });
  const neu = knopf({ text: 'Entwurf neu erzeugen', klasse: 'knopf--klein knopf--zweit', onclick: () => { text.value = entwurfErzeugen(g); druckText.textContent = text.value; entwurfSetzen(g.id, text.value); ansage('Entwurf neu erzeugt.'); } });

  const fr = g.freigabe;
  return h('div', { class: 'stapel bericht' },
    h('div', { class: 'nur-druck druck-kopf' },
      h('p', {}, 'klasseSachsen – Demonstrator · Gruppenbericht'),
      h('p', {}, `Quest: „${QUEST}“ · Gruppe: „${g.bezeichnung}“ · Datum: ${datum(Date.now())}`),
      h('p', {}, h('strong', {}, 'Beobachtung, keine Bewertung. Keine Ziffernnoten, keine Punkte.'))),
    h('div', { class: 'zeile zeile--zwischen nicht-drucken' },
      h('a', { class: 'zurueck', href: '#/lehrkraefte/gruppen' }, h('span', { 'aria-hidden': 'true', svg: icon('zurueck'), style: { width: '1.3em', height: '1.3em', display: 'inline-flex' } }), 'Zu den Gruppen'),
      knopf({ text: 'Gruppenbericht drucken oder als PDF sichern (F6)', symbol: 'drucken', onclick: () => { entwurfSetzen(g.id, text.value); window.print(); } })),
    h('h2', {}, `Gruppenansicht „${g.bezeichnung}“ (F4)`),
    h('p', { class: 'klein' }, `Quest „${QUEST}“ · ${fr ? `Freigabe am ${datum(fr.am)}, ${fr.kern ? 'Kernzielgruppe – Beobachtung aktiv' : 'außerhalb der Kernzielgruppe – keine Erfassung'}` : 'nicht freigegeben'} · Automatische Löschung spätestens am ${datum(loeschdatum(g))} (${AUFBEWAHRUNG_TAGE / 7} Wochen nach Abschluss oder zum Schuljahresende)`),
    g.freigabe && !g.freigabe.kern ? h('p', { class: 'karte-box karte-box--hinweis' }, 'Für diese Lerngruppe wird nichts erfasst. Es gibt deshalb keine Beobachtungen.') : null,
    h('section', { class: 'karte-box stapel', 'aria-labelledby': 'h-team' }, h('h3', { id: 'h-team' }, 'Teamleistung'), team),
    h('section', { class: 'karte-box stapel', 'aria-labelledby': 'h-problem' }, h('h3', { id: 'h-problem' }, 'Problemlösung'), problem),
    h('section', { class: 'karte-box stapel', 'aria-labelledby': 'h-bet' }, h('h3', { id: 'h-bet' }, 'Beteiligung'), beteiligung),
    h('section', { class: 'karte-box stapel nicht-drucken', 'aria-labelledby': 'h-tech' }, h('h3', { id: 'h-tech' }, 'Kontext und Technik'), technik,
      h('details', {}, h('summary', {}, 'So entstehen diese Angaben'),
        h('ul', {},
          h('li', {}, 'Erfasst werden nur Ereignisse der Gruppe am Gerät: Station begonnen/abgeschlossen, Versuche, Hilfen, Eingaben je Rollenposition, bestätigte Gruppenentscheidungen, aktive Zeit, Offline-Phasen.'),
          h('li', {}, '„Vorgehen gewechselt“ heißt: Nach einem Fehlversuch hat die Gruppe eine Hilfe geholt oder eine andere Lösung versucht und dann gelöst.'),
          h('li', {}, 'Nicht erfasst: Namen, Personen, Standorte, Ton- oder Bildaufnahmen, Freitexte, Geräte-Kennungen.')))),
    h('section', { class: 'karte-box stapel', 'aria-labelledby': 'h-raster' },
      h('div', { class: 'zeile zeile--zwischen' }, h('h3', { id: 'h-raster', style: { margin: 0 } }, 'Kompetenzraster (F5)'), h('span', { class: 'nicht-drucken' }, uebernehmen)),
      h('p', { class: 'klein nicht-drucken' }, 'Die Lehrkraft wählt die Niveaustufe. Die Hinweise aus den Beobachtungen sind nur eine Hilfe – regelbasiert und nachvollziehbar. Die Zuordnung der Stufen zum Lehrplan wird im Projekt mit der Fachdidaktik abgestimmt.'),
      rasterTab),
    h('section', { class: 'karte-box stapel entwurf', 'aria-labelledby': 'h-entwurf' },
      h('span', { class: 'entwurf__marke' }, 'Entwurf'),
      h('h3', { id: 'h-entwurf' }, 'Formulierungsentwurf für die Verbaleinschätzung (F7)'),
      h('p', { class: 'klein nicht-drucken', id: `entwurf-hinweis-${g.id}` }, 'Regelbasiert aus den gewählten Niveaustufen und Beobachtungen erzeugt – ohne KI. Bitte prüfen und frei bearbeiten.'),
      h('div', { class: 'feld nicht-drucken' }, h('label', { for: `entwurf-${g.id}` }, 'Entwurf (bearbeitbar)'), text),
      druckText,
      h('div', { class: 'zeile nicht-drucken' }, speichern, neu)),
    h('section', { class: 'karte-box stapel nicht-drucken', 'aria-labelledby': 'h-loeschen' },
      h('h3', { id: 'h-loeschen' }, 'Vorzeitige Löschung (F8)'),
      h('p', {}, 'Löscht die Gruppe mit allen Beobachtungen, Entwürfen und Bildbeiträgen sofort und unwiderruflich.'),
      loeschKnopf(g, () => { location.hash = '#/lehrkraefte/gruppen'; })));
}

function bildbeitraegeBereich(neuZeichnen) {
  const liste = beitraege();
  const text = { wartet: 'wartet auf Freigabe', freigegeben: 'freigegeben', abgelehnt: 'Freigabe verweigert' };
  const wartend = liste.filter((b) => b.status === 'wartet');
  return h('section', { class: 'stapel', 'aria-labelledby': 'h-bb' },
    h('h2', { id: 'h-bb' }, 'Bildbeiträge freigeben'),
    h('p', {}, 'Ohne Freigabe wird ein Bildbeitrag nicht bereitgestellt. Im Demonstrator verlässt nichts das Gerät – die Bereitstellung an die Ausstellung ist simuliert.'),
    wartend.length > 1 ? knopf({ text: `Alle ${wartend.length} wartenden freigeben`, klasse: 'knopf--gruen knopf--klein', onclick: () => { wartend.forEach((b) => beitragStatus(b.id, 'freigegeben')); ansage('Alle wartenden Bildbeiträge freigegeben.'); neuZeichnen(); } }) : null,
    liste.length ? null : h('p', { class: 'karte-box' }, 'Noch keine Bildbeiträge. Sie entstehen am Ende der Reise im Bereich „Bildbeitrag“.'),
    ...liste.map((b) => {
      const c = h('canvas', { width: 240, height: 240, role: 'img', 'aria-label': `Vorschau Bildbeitrag ${b.kennung}` });
      try { zeichneCollage(c, b.params); } catch { /* ignorieren */ }
      const g = b.gruppeId ? holeGruppe(b.gruppeId) : null;
      return h('article', { class: 'karte-box beitrag' }, c,
        h('div', { class: 'stapel' },
          h('h3', { style: { margin: 0, fontSize: '1.05rem' } }, b.kennung),
          h('p', { class: 'klein', style: { margin: 0 } }, `${g ? 'Gruppe „' + g.bezeichnung + '“' : 'freies Spiel'} · ${datum(b.zeit, true)} · Status: `, h('strong', {}, text[b.status])),
          h('p', { class: 'klein', style: { margin: 0 } }, `Gespeichert sind nur Item-Kennungen und Reglerwerte: ${b.params.items.length} Fundstücke, ${b.params.vorlage}, Anordnung ${b.params.regler.anordnung}, Größe ${b.params.regler.groesse} %, ${b.params.regler.farbstimmung}.`),
          h('div', { class: 'zeile' },
            knopf({ text: 'Freigeben', klasse: 'knopf--klein knopf--gruen', disabled: b.status === 'freigegeben', onclick: () => { beitragStatus(b.id, 'freigegeben'); ansage('Freigegeben.'); neuZeichnen(); } }),
            knopf({ text: 'Freigabe verweigern', klasse: 'knopf--klein knopf--zweit', disabled: b.status === 'abgelehnt', onclick: () => { beitragStatus(b.id, 'abgelehnt'); ansage('Freigabe verweigert.'); neuZeichnen(); } }))));
    }));
}

function materialBereich(neuZeichnen) {
  const meldung = h('div', { 'aria-live': 'polite' });
  return h('div', { class: 'stapel' },
    h('section', { class: 'karte-box stapel' },
      h('h2', {}, 'Material'),
      h('p', {}, 'QR-Codes für den Ortsbeweis zum Ausdrucken und Ausprobieren. Der QR-Code bestätigt nur „Station erreicht“.'),
      knopfLink({ href: '#/material/qr', text: 'QR-Codes öffnen', symbol: 'qr', klasse: 'knopf--klein' })),
    h('section', { class: 'karte-box stapel' },
      h('h2', {}, 'Werkzeuge für Prüfende'),
      h('p', {}, 'Damit sich alle Funktionen schnell ausprobieren lassen. Alle Daten bleiben auf diesem Gerät.'),
      h('div', { class: 'zeile' },
        knopf({ text: 'Drei Beispielgruppen anlegen (synthetische Daten)', klasse: 'knopf--klein', onclick: () => { beispielGruppenAnlegen(); leeren(meldung); meldung.append(h('p', { class: 'rueckmeldung rueckmeldung--gut' }, 'Beispielgruppen angelegt: Fuchs, Eule und Biber (synthetisch).')); } }),
        knopf({ text: 'Alle Fundstücke im aktuellen Spielprofil freischalten', klasse: 'knopf--klein knopf--zweit', onclick: () => { alleItemsFreischalten(); leeren(meldung); meldung.append(h('p', { class: 'rueckmeldung rueckmeldung--gut' }, `Alle sechs Fundstücke freigeschaltet (${profil().typ === 'gruppe' ? 'aktuelle Gruppe' : 'freies Spiel'}). Der Bildbeitrag ist jetzt erreichbar.`)); } })),
      meldung,
      h('p', {}, 'Alle Daten löschen: siehe ', h('a', { href: 'datenschutz.html#loeschen' }, 'Datenschutz – Daten auf diesem Gerät löschen'), '.')));
}

// ---------- Hauptansicht ----------
export function lehrkraefteAnsicht(main, { reiter: aktiv = 'gruppen', id = null }) {
  const inhalt = h('div', {});
  const zeichne = (fokusId = null, fokusName = null) => {
    leeren(inhalt);
    if (aktiv === 'gruppe' && id) {
      const g = holeGruppe(id);
      inhalt.append(g ? gruppenAnsicht(g, (gid, name) => { zeichne(gid, name); }) : h('p', {}, 'Diese Gruppe gibt es nicht mehr.'));
      if (fokusName) { const r = inhalt.querySelector(`input[name="${fokusName}"]:checked`); if (r) r.focus(); }
    } else if (aktiv === 'uebersicht') inhalt.append(uebersichtBereich());
    else if (aktiv === 'bildbeitraege') inhalt.append(bildbeitraegeBereich(() => zeichne()));
    else if (aktiv === 'material') inhalt.append(materialBereich(() => zeichne()));
    else {
      inhalt.append(gruppenBereich((gid) => zeichne(gid)));
      if (fokusId) { const el = inhalt.querySelector(`#gruppe-${fokusId} h3`); if (el) { el.setAttribute('tabindex', '-1'); el.focus(); } }
    }
  };
  const live = () => { if (aktiv === 'uebersicht') zeichne(); };
  document.addEventListener('ks:daten', live);
  const takt = setInterval(live, 5000);

  main.append(
    h('div', { class: 'seitenkopf nicht-drucken' },
      h('div', {},
        h('a', { class: 'zurueck', href: '#/' }, h('span', { 'aria-hidden': 'true', svg: icon('zurueck'), style: { width: '1.3em', height: '1.3em', display: 'inline-flex' } }), 'Zur Startseite'),
        h('h1', {}, 'Lehrkräfte-Ansicht')),
      h('span', { class: 'abzeichen' }, 'Demo ohne Anmeldung · Daten nur auf diesem Gerät')),
    hinweisband(),
    reiter(aktiv === 'gruppe' ? 'gruppen' : aktiv),
    inhalt);
  zeichne();
  return { titel: 'Lehrkräfte-Ansicht', aufraeumen: () => { document.removeEventListener('ks:daten', live); clearInterval(takt); } };
}
