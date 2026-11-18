// Spielrahmen: Einstieg mit Rollenwechsel, gestufte Hilfen, Abschluss mit festem Fundstück.
import { h, knopf, knopfLink, icon, ansage, leeren } from '../ui.js';
import { gurriBlase, profilHinweis, rollenMarke } from './teile.js';
import { lesetext, t } from '../text.js';
import { spiel as holeSpiel, item as holeItem, ort as holeOrt, alleSpiele, SPIELTYP } from '../inhalt.js';
import { beobachtung, itemVergeben, spielbareOrte, reiseFertig, ROLLEN, ROLLEN_NAME } from '../daten.js';
import { itemSvg } from '../grafik/items.js';
import { rolleBild } from '../grafik/symbole.js';
import { bewegungReduziert, einstellungen } from '../einstellungen.js';
import { autoVorlesen, stoppeVorlesen } from '../vorlesen.js';
import { spurensuche } from '../spiele/spurensuche.js';
import { zuordnen } from '../spiele/zuordnen.js';
import { zeitstrahl } from '../spiele/zeitstrahl.js';
import { schaetzfrage } from '../spiele/schaetzfrage.js';

const SPIELE = { spurensuche, zuordnen, zeitstrahl, schaetzfrage };

export function spielAnsicht(main, { id }) {
  const s = holeSpiel(id);
  if (!s) { main.append(h('p', {}, 'Dieses Spiel gibt es nicht.')); return { titel: 'Nicht gefunden' }; }
  const o = holeOrt(s.ort);
  main.className = 'haupt ort-' + s.ort;
  if (!spielbareOrte().includes(s.ort)) {
    main.append(h('p', { class: 'karte-box' }, 'Dieser Ort ist für eure Gruppe noch nicht freigegeben.'), knopfLink({ href: '#/karte', text: 'Zur Karte' }));
    return { titel: s.titel };
  }

  let phase = 'einstieg';
  let fertig = false;
  let aktivSeit = null;
  let aktivMs = 0;
  const startAktiv = () => { if (aktivSeit === null && document.visibilityState === 'visible') aktivSeit = Date.now(); };
  const stoppAktiv = () => { if (aktivSeit !== null) { aktivMs += Date.now() - aktivSeit; aktivSeit = null; } };
  const sichtbarkeit = () => (document.visibilityState === 'visible' && phase === 'spiel' ? startAktiv() : stoppAktiv());
  document.addEventListener('visibilitychange', sichtbarkeit);

  const kopf = h('div', { class: 'spiel__kopf' },
    h('div', {},
      h('a', { class: 'zurueck', href: `#/ort/${s.ort}` }, h('span', { 'aria-hidden': 'true', svg: icon('zurueck'), style: { width: '1.3em', height: '1.3em', display: 'inline-flex' } }), `Spiel verlassen, zurück nach ${o.name}`),
      h('p', { class: 'spiel__typ' }, `${o.name} · ${SPIELTYP[s.typ].name}`),
      h('h1', { class: 'spiel__titel' }, s.titel)),
    profilHinweis());
  const buehne = h('div', { class: 'spiel' });
  main.append(kopf, buehne);

  // ---------- 1. Einstieg ----------
  function einstieg() {
    leeren(buehne);
    const nr = alleSpiele().findIndex((x) => x.id === id) + 1;
    buehne.append(
      gurriBlase(s.intro, 'hallo', { auto: true }),
      h('section', { class: 'karte-box stapel', 'aria-labelledby': 'h-rollen' },
        h('h2', { id: 'h-rollen' }, `Rollenwechsel (Spiel ${nr} von 6)`),
        lesetext('rollen.wechsel'),
        h('ul', { class: 'rollen' }, ROLLEN.map((r) => h('li', { class: 'rolle' },
          h('span', { class: 'rolle__icon', svg: rolleBild(r) }),
          lesetext(`rolle.${r}`))))),
      // natives append() schreibt null als Text „null“ – darum leere Zeichenkette
      s.klassenzimmer ? h('div', { class: 'karte-box karte-box--hinweis' }, lesetext(s.klassenzimmer)) : '',
      h('div', { class: 'zeile' },
        knopf({ text: 'Wir sind bereit – los geht’s!', symbol: 'start', klasse: 'knopf--gross', onclick: () => { beobachtung.eingabe(id, 'navigation'); spielen(); } })));
  }

  // ---------- 2. Spiel ----------
  let modul = null;
  let hilfeStufe = 0;
  const hilfeBereich = h('div', { 'aria-live': 'polite', class: 'stapel' });
  const rueckBereich = h('div', { 'aria-live': 'polite', class: 'stapel' });
  const b1 = knopf({ text: 'Tipp 1', symbol: 'tipp', klasse: 'knopf--warm knopf--klein' });
  const b2 = knopf({ text: 'Tipp 2', symbol: 'tipp', klasse: 'knopf--warm knopf--klein' });
  const b3 = knopf({ text: 'Lösung zeigen', symbol: 'schluessel', klasse: 'knopf--zweit knopf--klein' });

  function hilfeLeisteAktualisieren() {
    const moeglich = !!(modul && modul.tipps && modul.tipps());
    b1.disabled = !moeglich || hilfeStufe >= 1;
    b2.disabled = !moeglich || hilfeStufe !== 1;
    b3.disabled = !moeglich || hilfeStufe !== 2;
  }
  function hilfe(stufe) {
    const tipps = modul && modul.tipps ? modul.tipps() : null;
    if (!tipps) return;
    hilfeStufe = stufe;
    beobachtung.hilfe(id, stufe);
    beobachtung.eingabe(id, 'recherche');
    if (stufe === 3) {
      if (modul.loesung) modul.loesung();
    } else {
      leeren(hilfeBereich);
      hilfeBereich.append(h('div', { class: 'hilfetext' }, h('p', { class: 'klein', style: { margin: '0 0 .3rem', fontWeight: 700 } }, `Tipp ${stufe}`), lesetext(stufe === 1 ? tipps.t1 : tipps.t2)));
      const kn = hilfeBereich.querySelector('.vorlesen-knopf');
      if (kn && einstellungen().auto) kn.click();
    }
    hilfeLeisteAktualisieren();
  }
  b1.addEventListener('click', () => hilfe(1));
  b2.addEventListener('click', () => hilfe(2));
  b3.addEventListener('click', () => hilfe(3));

  const api = {
    id,
    eingabe: (rolle) => beobachtung.eingabe(id, rolle),
    versuch: (erfolg) => { beobachtung.versuch(id, erfolg); setTimeout(hilfeLeisteAktualisieren, 0); },
    abstimmung: () => beobachtung.abstimmung(id),
    weg: (name) => beobachtung.weg(id, name),
    rueckmeldung(inhalt, art = 'hinweis', vorlesen = true) {
      leeren(rueckBereich);
      if (!inhalt) return;
      const el = typeof inhalt === 'string' ? lesetext(inhalt) : inhalt;
      rueckBereich.append(h('div', { class: `rueckmeldung rueckmeldung--${art}` }, el));
      if (vorlesen && typeof inhalt === 'string' && einstellungen().auto) {
        const kn = rueckBereich.querySelector('.vorlesen-knopf');
        if (kn && document.body.contains(kn)) kn.click();
      }
    },
    hilfenZuruecksetzen() { hilfeStufe = 0; leeren(hilfeBereich); hilfeLeisteAktualisieren(); },
    hilfeStufe: () => hilfeStufe,
    fertig: () => abschluss(),
    ansage,
  };

  function spielen() {
    phase = 'spiel';
    beobachtung.start(id);
    startAktiv();
    leeren(buehne);
    hilfeStufe = 0;
    const flaeche = h('div', { class: 'stapel' });
    const leiste = h('div', { class: 'hilfeleiste', role: 'group', 'aria-label': 'Hilfen' },
      h('span', { class: 'hilfeleiste__titel' }, 'Feststecken? ', rollenMarke('recherche'), ' holt Hilfe:'), b1, b2, b3);
    buehne.append(flaeche, leiste, hilfeBereich, rueckBereich);
    modul = SPIELE[s.typ](flaeche, s, api);
    hilfeLeisteAktualisieren();
    const erster = flaeche.querySelector('.lesbar');
    if (erster) erster.dataset.auto = '1';
    autoVorlesen(flaeche);
  }

  // ---------- 3. Abschluss ----------
  function abschluss() {
    if (fertig) return;
    fertig = true;
    phase = 'fertig';
    stoppAktiv();
    beobachtung.aktiv(id, aktivMs);
    aktivMs = 0;
    beobachtung.ende(id);
    itemVergeben(s.item);
    stoppeVorlesen();
    const it = holeItem(s.item);
    leeren(buehne);
    const reise = reiseFertig();
    const anderes = holeOrt(s.ort).spiele.find((x) => x !== id);
    buehne.append(
      gurriBlase('fertig.gurri', 'freut', { klein: true }),
      h('section', { class: 'karte-box belohnung', 'aria-labelledby': 'h-fund' },
        h('div', { class: 'belohnung__item' + (bewegungReduziert() ? '' : ' erscheint'), svg: itemSvg(s.item, { titel: `Fundstück: ${it.name}` }) }),
        h('div', { class: 'stapel' },
          h('h2', { id: 'h-fund' }, `Euer Fundstück: ${it.name}`),
          lesetext(s.abschluss, { auto: true, gross: true }),
          h('p', { class: 'klein' }, 'Jedes Spiel hat ein festes Fundstück – nie Zufall.'))),
      h('div', { class: 'zeile' },
        reise ? knopfLink({ href: '#/collage', text: 'Bildbeitrag gestalten', symbol: 'pinsel', klasse: 'knopf--gruen knopf--gross' }) : null,
        anderes ? knopfLink({ href: `#/spiel/${anderes}`, text: 'Nächstes Spiel an diesem Ort', symbol: 'weiter', klasse: reise ? 'knopf--zweit' : '' }) : null,
        knopfLink({ href: '#/karte', text: 'Zur Karte', symbol: 'karte', klasse: 'knopf--zweit' }),
        knopfLink({ href: '#/album', text: 'Zum Album', symbol: 'album', klasse: 'knopf--zweit' })));
    const h2 = buehne.querySelector('h2');
    if (h2) { h2.setAttribute('tabindex', '-1'); h2.focus(); }
    autoVorlesen(buehne);
    ansage(`Geschafft! Fundstück: ${it.name}`);
  }

  einstieg();
  return {
    titel: s.titel,
    aufraeumen() {
      document.removeEventListener('visibilitychange', sichtbarkeit);
      main.className = 'haupt';
      if (phase === 'spiel' && !fertig) {
        stoppAktiv();
        beobachtung.aktiv(id, aktivMs);
        beobachtung.abbruch(id);
      }
      if (modul && modul.aufraeumen) modul.aufraeumen();
    },
  };
}
