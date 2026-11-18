// Kleine DOM-Helfer, Bedien-Symbole und Bildschirmleser-Ansagen.

/**
 * Element bauen: h('button', { class: 'knopf', onclick: fn, 'aria-pressed': 'false' }, 'Text', kind)
 * Texte werden immer als Textknoten eingefügt (kein innerHTML für Inhalte).
 */
export function h(tag, attrs = {}, ...kinder) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'svg') el.innerHTML = v; // nur für eigene, statische SVG-Grafiken
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  anhaengen(el, kinder);
  return el;
}

function anhaengen(el, kinder) {
  for (const k of kinder.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}

export function leeren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

let ansageTimer = null;
/** Kurze Ansage für Bildschirmleser (aria-live="polite"). */
export function ansage(text) {
  const el = document.getElementById('ansage');
  if (!el) return;
  el.textContent = '';
  clearTimeout(ansageTimer);
  ansageTimer = setTimeout(() => { el.textContent = text; }, 60);
}

const P = (d) => `<path d="${d}"/>`;
const ICONS = {
  lautsprecher: P('M4 9.5h3.2L12 5.5v13l-4.8-4H4z') + P('M15.5 9a4 4 0 0 1 0 6') + P('M18 6.5a7.5 7.5 0 0 1 0 11'),
  stopp: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
  regler: P('M4 7h9') + P('M17 7h3') + '<circle cx="15" cy="7" r="2"/>' + P('M4 17h3') + P('M11 17h9') + '<circle cx="9" cy="17" r="2"/>',
  zurueck: P('M14.5 5.5 8 12l6.5 6.5') + P('M8.5 12H20'),
  weiter: P('M9.5 5.5 16 12l-6.5 6.5') + P('M15.5 12H4'),
  hoch: P('M12 19V5.5') + P('M6 11.5l6-6 6 6'),
  runter: P('M12 5v13.5') + P('M6 12.5l6 6 6-6'),
  haken: P('M5 12.5l4.5 4.5L19 7.5'),
  tipp: P('M9 18h6') + P('M10 21h4') + P('M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z'),
  schluessel: '<circle cx="8" cy="12" r="4"/>' + P('M12 12h9') + P('M18 12v3.5') + P('M15.5 12v2.5'),
  karte: P('M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5z') + P('M9 4v13.5') + P('M15 6.5V20'),
  liste: P('M9 6.5h11') + P('M9 12h11') + P('M9 17.5h11') + '<circle cx="4.8" cy="6.5" r="1.2"/><circle cx="4.8" cy="12" r="1.2"/><circle cx="4.8" cy="17.5" r="1.2"/>',
  album: P('M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z') + P('M5 18a2 2 0 0 1 2-2h11.5') + P('M9.5 8.5h5'),
  pinsel: P('M14.5 4.5l5 5-7.5 7.5-5-5z') + P('M7 12c-2.5 0-3.5 2-3.5 4.5 0 1.5-.5 2.5-1 3 3 .5 7-.5 7.5-3.5'),
  drucken: P('M7 9V4h10v5') + '<rect x="4" y="9" width="16" height="7.5" rx="2"/>' + P('M7 14h10v6H7z'),
  muell: P('M4.5 7h15') + P('M9.5 7V4.5h5V7') + P('M6.5 7l1 13h9l1-13') + P('M10 11v5.5') + P('M14 11v5.5'),
  download: P('M12 4v11') + P('M7 10.5l5 5 5-5') + P('M4.5 19.5h15'),
  schloss: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/>' + P('M8 10.5V8a4 4 0 0 1 8 0v2.5'),
  kompass: '<circle cx="12" cy="12" r="8.5"/>' + P('M14.8 9.2l-1.8 4.8-4.8 1.8 1.8-4.8z'),
  klemmbrett: '<rect x="5.5" y="5" width="13" height="16" rx="2"/>' + P('M9 5V3.5h6V5') + P('M8.5 10h7') + P('M8.5 13.5h7') + P('M8.5 17h4'),
  lupe: '<circle cx="10.5" cy="10.5" r="6"/>' + P('M15 15l5 5'),
  wlan: P('M3.5 9.5a12.5 12.5 0 0 1 17 0') + P('M6.5 12.8a8 8 0 0 1 11 0') + P('M9.5 16a3.6 3.6 0 0 1 5 0') + '<circle cx="12" cy="19" r="1"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/>' + P('M14 14h2.5v2.5H14z') + P('M18 18h2v2h-2z') + P('M14 19h1.5'),
  person: '<circle cx="12" cy="8" r="3.6"/>' + P('M5 20c.8-3.8 3.6-5.8 7-5.8s6.2 2 7 5.8'),
  stift: P('M15.5 4.5l4 4L9 19l-5 1 1-5z'),
  start: P('M8 5.5v13l10-6.5z'),
  pause: P('M8.5 5.5v13') + P('M15.5 5.5v13'),
  stern: P('M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z'),
  info: '<circle cx="12" cy="12" r="8.5"/>' + P('M12 11v5.5') + '<circle cx="12" cy="7.8" r=".6"/>',
  kreuz: P('M6.5 6.5l11 11') + P('M17.5 6.5l-11 11'),
  datei: P('M6 3.5h8l4 4V20.5H6z') + P('M14 3.5v4h4'),
};

/** SVG-Symbol als Zeichenkette (dekorativ, aria-hidden). */
export function icon(name, extra = '') {
  const inhalt = ICONS[name] || '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${inhalt}</svg>`;
}

/** Knopf mit Symbol: knopf({ text, icon, klasse, onclick, ... }) */
export function knopf({ text, symbol, klasse = '', ...rest }) {
  const b = h('button', { type: 'button', class: ('knopf ' + klasse).trim(), ...rest });
  if (symbol) b.append(h('span', { class: 'knopf__icon', 'aria-hidden': 'true', svg: icon(symbol) }));
  b.append(h('span', {}, text));
  return b;
}

/** Link im Knopf-Stil. */
export function knopfLink({ text, symbol, href, klasse = '', ...rest }) {
  const a = h('a', { href, class: ('knopf ' + klasse).trim(), ...rest });
  if (symbol) a.append(h('span', { class: 'knopf__icon', 'aria-hidden': 'true', svg: icon(symbol) }));
  a.append(h('span', {}, text));
  return a;
}

/** Datum lesbar auf Deutsch. */
export function datum(ts, mitZeit = false) {
  if (!ts) return '–';
  const d = new Date(ts);
  const opt = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (mitZeit) Object.assign(opt, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('de-DE', opt);
}

export function dauerText(ms) {
  if (!ms || ms < 1000) return 'unter 1 Minute';
  const min = Math.round(ms / 60000);
  if (min < 1) return 'unter 1 Minute';
  return min === 1 ? 'etwa 1 Minute' : `etwa ${min} Minuten`;
}

export function zahl(n) {
  return Number(n).toLocaleString('de-DE');
}

/** Datei im Browser herunterladen (ohne Server). */
export function herunterladen(blob, dateiname) {
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: dateiname, style: { display: 'none' } });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}
