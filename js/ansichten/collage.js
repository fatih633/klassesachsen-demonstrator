// Bildbeitrag „Item-Collage“: regelbasiert, deterministisch, ohne KI.
import { h, knopf, knopfLink, ansage, herunterladen, leeren } from '../ui.js';
import { seitenkopf, gurriBlase } from './teile.js';
import { lesetext } from '../text.js';
import { item as holeItem, alleItems } from '../inhalt.js';
import { fortschritt, reiseFertig, beitragSpeichern, beitraege, profil } from '../daten.js';
import { itemSvg } from '../grafik/items.js';
import { VORLAGEN, STIMMUNGEN, REGLER_GRENZEN, GENERATOR, standardParameter, zeichneCollage, pruefeParameter, beschreibung, seedFuer } from '../collage/generator.js';
import { webpBlob } from '../collage/webp.js';
import { lesen, schreiben } from '../speicher.js';

function zufallsKennung() {
  const z = new Uint8Array(6);
  crypto.getRandomValues(z);
  const d = new Date();
  const tag = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `bb-${tag}-${[...z].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

async function sha256(blob) {
  if (!window.crypto || !crypto.subtle) return null;
  const buf = await blob.arrayBuffer();
  const h2 = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h2)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function ortszeit(d = new Date()) {
  const off = -d.getTimezoneOffset();
  const vz = off >= 0 ? '+' : '-';
  const p = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${vz}${p(off / 60)}:${p(off % 60)}`;
}

export function metadaten(params, { kennung, zeitpunkt, pngHash, webpKodierung }) {
  return {
    schema: 'klassesachsen-bildbeitrag/1',
    kennung,
    zeitpunkt,
    erzeugungsart: 'regelbasiert',
    ki: false,
    generator: GENERATOR,
    items: params.items,
    vorlage: params.vorlage,
    regler: params.regler,
    seed: seedFuer(params),
    ausgabe: {
      png: { breite: 2048, hoehe: 2048, sha256: pngHash },
      webp: { breite: 512, hoehe: 512, kodierung: webpKodierung || null },
    },
    lizenz: 'CC BY-SA 4.0',
    hinweis: 'Enthält keine Namen und keine Gruppenbezeichnung. Das Bild lässt sich aus items, vorlage und regler jederzeit neu erzeugen.',
  };
}

export async function erzeugeDateien(params) {
  const gross = document.createElement('canvas');
  gross.width = 2048;
  gross.height = 2048;
  zeichneCollage(gross, params);
  const png = await new Promise((ok) => gross.toBlob(ok, 'image/png'));
  const klein = document.createElement('canvas');
  klein.width = 512;
  klein.height = 512;
  zeichneCollage(klein, params);
  const webp = await webpBlob(klein, { erzwingeEigen: new URLSearchParams(location.search).has('eigenes-webp') });
  return { png, webp, pngHash: await sha256(png) };
}

export function collageAnsicht(main) {
  const vorhanden = fortschritt().items;
  if (!reiseFertig()) {
    main.append(seitenkopf('Bildbeitrag', { zurueck: { href: '#/karte', text: 'Zur Karte' } }),
      h('div', { class: 'karte-box stapel' }, lesetext('collage.gesperrt'), h('p', {}, `Ihr habt ${vorhanden.length} von 6 Fundstücken.`), knopfLink({ href: '#/karte', text: 'Zur Karte', symbol: 'karte' })));
    return { titel: 'Bildbeitrag' };
  }
  const bekannt = alleItems().map((i) => i.id);
  let params = lesen('collage-entwurf', null);
  try { params = params ? pruefeParameter(params, vorhanden) : null; } catch { params = null; }
  if (!params) params = standardParameter(vorhanden);

  const canvas = h('canvas', { width: 1024, height: 1024, role: 'img' });
  const status = h('div', { 'aria-live': 'polite', class: 'stapel' });
  const zeichne = () => {
    zeichneCollage(canvas, params);
    canvas.setAttribute('aria-label', 'Vorschau: ' + beschreibung(params, (id) => holeItem(id).name));
    schreiben('collage-entwurf', params);
  };

  // Schritt 1: Items
  const itemWahl = h('div', { class: 'wahlgitter' }, vorhanden.map((id) => {
    const it = holeItem(id);
    const cb = h('input', { type: 'checkbox', name: 'items', value: id, checked: params.items.includes(id) });
    cb.addEventListener('change', () => {
      const gewaehlt = [...itemWahl.querySelectorAll('input:checked')].map((x) => x.value);
      if (gewaehlt.length < 2) { cb.checked = true; ansage('Mindestens zwei Fundstücke auswählen.'); return; }
      params = { ...params, items: vorhanden.filter((x) => gewaehlt.includes(x)) };
      zeichne();
    });
    return h('label', { class: 'wahlkachel' }, cb, h('span', { svg: itemSvg(id), 'aria-hidden': 'true' }), it.name);
  }));

  // Schritt 2: Vorlage
  const vorlagenWahl = h('div', { class: 'optionen-reihe', role: 'radiogroup', 'aria-label': 'Vorlage' }, Object.entries(VORLAGEN).map(([id, v]) => {
    const r = h('input', { type: 'radio', name: 'vorlage', value: id, checked: params.vorlage === id });
    r.addEventListener('change', () => { params = { ...params, vorlage: id }; zeichne(); });
    return h('label', { class: 'option option--chip' }, r, v.name);
  }));

  // Schritt 3: Regler
  const regler = (name, label, [min, max], einheit = '') => {
    const ausgabe = h('output', { id: `aus-${name}` }, `${params.regler[name]}${einheit}`);
    const r = h('input', { type: 'range', id: `regler-${name}`, min, max, step: 1, value: params.regler[name], 'aria-describedby': `aus-${name}` });
    r.addEventListener('input', () => {
      params = { ...params, regler: { ...params.regler, [name]: Number(r.value) } };
      ausgabe.textContent = `${r.value}${einheit}`;
      zeichne();
    });
    return h('div', { class: 'regler' }, h('label', { for: r.id }, label, ': ', ausgabe), r);
  };
  const stimmungWahl = h('div', { class: 'optionen-reihe', role: 'radiogroup', 'aria-label': 'Farbstimmung' }, Object.entries(STIMMUNGEN).map(([id, st]) => {
    const r = h('input', { type: 'radio', name: 'farbstimmung', value: id, checked: params.regler.farbstimmung === id });
    r.addEventListener('change', () => { params = { ...params, regler: { ...params.regler, farbstimmung: id } }; zeichne(); });
    return h('label', { class: 'option option--chip' }, r, h('span', { 'aria-hidden': 'true', style: { width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: st.grund, border: '3px solid ' + st.farben[1], display: 'inline-block' } }), st.name);
  }));

  // Ausgabe
  let letzteDateien = null;
  let letzteMeta = null;
  const bereite = async () => {
    status.textContent = 'Bild wird erzeugt …';
    const dateien = await erzeugeDateien(params);
    letzteDateien = dateien;
    letzteMeta = metadaten(params, { kennung: zufallsKennung(), zeitpunkt: ortszeit(), pngHash: dateien.pngHash, webpKodierung: dateien.webp.kodierung });
    status.textContent = '';
    return { dateien, meta: letzteMeta };
  };
  const json = (meta) => new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });

  const dlPng = knopf({ text: 'PNG (2048 × 2048) laden', symbol: 'download', klasse: 'knopf--klein', onclick: async () => { const { dateien, meta } = await bereite(); herunterladen(dateien.png, `${meta.kennung}.png`); ansage('PNG wird heruntergeladen.'); } });
  const dlWebp = knopf({ text: 'WebP-Vorschau laden', symbol: 'download', klasse: 'knopf--klein knopf--zweit', onclick: async () => { const { dateien, meta } = await bereite(); herunterladen(dateien.webp.blob, `${meta.kennung}-vorschau.webp`); ansage('WebP-Vorschau wird heruntergeladen.'); } });
  const dlJson = knopf({ text: 'Metadaten (JSON) laden', symbol: 'datei', klasse: 'knopf--klein knopf--zweit', onclick: async () => { const { meta } = letzteMeta ? { meta: letzteMeta } : await bereite(); herunterladen(json(meta), `${meta.kennung}.json`); ansage('Metadaten werden heruntergeladen.'); } });
  const alleDrei = knopf({ text: 'Alle drei Dateien erzeugen', symbol: 'download', klasse: 'knopf--klein', onclick: async () => {
    const { dateien, meta } = await bereite();
    herunterladen(dateien.png, `${meta.kennung}.png`);
    setTimeout(() => herunterladen(dateien.webp.blob, `${meta.kennung}-vorschau.webp`), 400);
    setTimeout(() => herunterladen(json(meta), `${meta.kennung}.json`), 800);
    leeren(status);
    status.append(h('p', { class: 'rueckmeldung rueckmeldung--gut' }, `Erzeugt: ${meta.kennung} · PNG ${Math.round(dateien.png.size / 1024)} KB · WebP ${Math.round(dateien.webp.blob.size / 1024)} KB (${dateien.webp.kodierung})`));
  } });

  const freigabe = knopf({ text: 'Zur Freigabe an die Lehrkraft geben', symbol: 'haken', klasse: 'knopf--gruen', onclick: async () => {
    const meta = metadaten(params, { kennung: zufallsKennung(), zeitpunkt: ortszeit(), pngHash: null, webpKodierung: null });
    beitragSpeichern({ kennung: meta.kennung, params, meta });
    leeren(status);
    status.append(h('div', { class: 'rueckmeldung rueckmeldung--gut' }, lesetext('collage.freigabe')));
    zeigeBeitraege();
  } });

  // Neu erzeugen aus JSON
  const datei = h('input', { type: 'file', id: 'json-laden', accept: 'application/json,.json' });
  const neuStatus = h('div', { 'aria-live': 'polite' });
  datei.addEventListener('change', async () => {
    leeren(neuStatus);
    const f = datei.files && datei.files[0];
    if (!f) return;
    try {
      const meta = JSON.parse(await f.text());
      params = pruefeParameter({ items: meta.items, vorlage: meta.vorlage, regler: meta.regler }, bekannt);
      zeichne();
      const dateien = await erzeugeDateien(params);
      const gleich = meta.ausgabe && meta.ausgabe.png && meta.ausgabe.png.sha256 && dateien.pngHash === meta.ausgabe.png.sha256;
      neuStatus.append(h('p', { class: 'rueckmeldung rueckmeldung--gut', 'data-gleich': gleich ? 'ja' : 'nein', id: 'neu-ergebnis' },
        `Aus den Metadaten „${meta.kennung || 'ohne Kennung'}“ neu erzeugt. ` + (gleich ? 'Prüfsumme des PNG ist identisch.' : 'Komposition aus denselben Werten; die Prüfsumme kann sich zwischen Browsern leicht unterscheiden.')));
      herunterladen(dateien.png, `${meta.kennung || 'bildbeitrag'}-neu.png`);
    } catch (fehler) {
      neuStatus.append(h('p', { class: 'rueckmeldung rueckmeldung--hinweis' }, `Die Datei konnte nicht gelesen werden: ${fehler.message}`));
    }
  });

  const beitragsListe = h('div', { 'aria-live': 'polite' });
  function zeigeBeitraege() {
    leeren(beitragsListe);
    const p = profil();
    const meine = beitraege().filter((b) => (p.typ === 'gruppe' ? b.gruppeId === p.id : !b.gruppeId));
    if (!meine.length) return;
    const text = { wartet: 'wartet auf Freigabe', freigegeben: 'freigegeben', abgelehnt: 'nicht freigegeben' };
    beitragsListe.append(h('h3', {}, 'Eure Bildbeiträge'), h('ul', {}, meine.map((b) => h('li', {}, `${b.kennung}: `, h('strong', {}, text[b.status] || b.status)))));
  }
  zeigeBeitraege();

  main.append(
    seitenkopf('Euer Bildbeitrag', { zurueck: { href: '#/album', text: 'Zum Album' } }),
    gurriBlase('collage.intro', 'freut', { auto: true, klein: true }),
    h('div', { class: 'collage' },
      h('div', { class: 'schritte' },
        h('section', { class: 'schritt karte-box' }, h('h2', {}, 'Fundstücke wählen'), itemWahl),
        h('section', { class: 'schritt karte-box' }, h('h2', {}, 'Vorlage wählen'), vorlagenWahl),
        h('section', { class: 'schritt karte-box' }, h('h2', {}, 'Regler einstellen'),
          regler('anordnung', 'Anordnung', REGLER_GRENZEN.anordnung),
          regler('groesse', 'Größe', REGLER_GRENZEN.groesse, ' %'),
          h('p', { style: { fontWeight: 700, margin: '.4rem 0 .2rem' } }, 'Farbstimmung'), stimmungWahl),
        h('section', { class: 'schritt karte-box' }, h('h2', {}, 'Speichern und freigeben'),
          h('div', { class: 'zeile' }, alleDrei, dlPng, dlWebp, dlJson),
          status,
          h('div', { class: 'zeile' }, freigabe),
          beitragsListe)),
      h('div', { class: 'collage__vorschau stapel' },
        canvas,
        h('div', { class: 'karte-box karte-box--hinweis' }, lesetext('collage.regel')),
        h('div', { class: 'karte-box stapel' },
          h('h2', { style: { fontSize: '1.15rem' } }, 'Bild aus Metadaten neu erzeugen'),
          h('div', { class: 'feld' }, h('label', { for: 'json-laden' }, 'JSON-Datei wählen'), datei),
          neuStatus))));
  zeichne();
  return { titel: 'Bildbeitrag' };
}
