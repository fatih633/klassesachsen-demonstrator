// Ortsbilder, Kartensymbole und kleine Bildsymbole – eigene Vektorgrafiken (CC BY-SA 4.0).

const L = '#1C2541';
const svg = (vb, inhalt, titel) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${titel ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>${titel ? `<title>${titel}</title>` : ''}${inhalt}</svg>`;

// ---------- Ortsbilder ----------
const ORTSBILD = {
  meissen: `
    <rect width="240" height="160" rx="18" fill="#DCE6F7"/>
    <circle cx="196" cy="38" r="16" fill="#F2B23A"/>
    <path d="M0 108C40 86 70 70 112 66s86 14 128 30V160H0Z" fill="#7DB47C"/>
    <path d="M70 70V44l9-26 9 26v26ZM92 70V40l9-28 9 28v30Z" fill="#E9DDC7" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M79 18v-8M101 12V4" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
    <path d="M110 70V48h64v22Z" fill="#E9DDC7" stroke="${L}" stroke-width="3"/>
    <path d="M106 50l20-18h32l20 18Z" fill="#4A5568" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M140 32V20l8-8 8 8v12" fill="#4A5568" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M120 56h8v8h-8ZM136 56h8v8h-8ZM152 56h8v8h-8Z" fill="#2350A8"/>
    <path d="M77 46h4v8h-4ZM99 44h4v8h-4Z" fill="#2350A8"/>
    <path d="M0 128C50 118 90 136 140 128s70-10 100-4V160H0Z" fill="#3D7FC4"/>
    <path d="M30 138h22M120 142h26M190 136h20" stroke="#BFE0F7" stroke-width="3" stroke-linecap="round"/>`,
  freiberg: `
    <rect width="240" height="160" rx="18" fill="#E5EAF0"/>
    <path d="M0 112C50 92 96 96 140 104s70 2 100-10V160H0Z" fill="#8FA889"/>
    <path d="M0 132H240V160H0Z" fill="#6E5039"/>
    <path d="M128 120L148 26M188 120L168 26M136 84h44M140 60h36M144 40h28" stroke="#5B6472" stroke-width="6" stroke-linecap="round"/>
    <circle cx="158" cy="26" r="15" fill="#E5EAF0" stroke="${L}" stroke-width="3.5"/>
    <circle cx="158" cy="26" r="4" fill="${L}"/>
    <path d="M158 26V120" stroke="${L}" stroke-width="2.5" stroke-dasharray="4 4"/>
    <path d="M40 120V88h56v32Z" fill="#F2EADB" stroke="${L}" stroke-width="3"/>
    <path d="M34 90l34-28 34 28Z" fill="#B5563A" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M60 102h16v18H60Z" fill="#8A5A36" stroke="${L}" stroke-width="2.5"/>
    <path d="M206 64l5 11 11 5-11 5-5 11-5-11-11-5 11-5ZM24 40l3.5 8 8 3.5-8 3.5L24 63l-3.5-8-8-3.5 8-3.5Z" fill="#FFFFFF" stroke="${L}" stroke-width="2"/>`,
  leipzig: `
    <rect width="240" height="160" rx="18" fill="#FDF0D2"/>
    <circle cx="44" cy="36" r="14" fill="#FFFFFF" opacity=".9"/>
    <path d="M0 124H240V160H0Z" fill="#D9C7A4"/>
    <path d="M62 124V70h86v54Z" fill="#F2EADB" stroke="${L}" stroke-width="3"/>
    <path d="M56 72l14-18h70l14 18Z" fill="#4A5568" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 124v-26a10 10 0 0 1 20 0v26ZM112 124v-26a10 10 0 0 1 20 0v26Z" fill="#9CC9E8" stroke="${L}" stroke-width="2.5"/>
    <path d="M150 124V44h28v80Z" fill="#F2EADB" stroke="${L}" stroke-width="3"/>
    <path d="M146 46l18-14 18 14Z" fill="#4A5568" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M156 32c0-10 16-10 16 0v6h-16Z" fill="#3F8F5A" stroke="${L}" stroke-width="2.5"/>
    <path d="M164 22V8M159 12h10" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="164" cy="64" r="7" fill="#FFFFFF" stroke="${L}" stroke-width="2.5"/>
    <path d="M158 84h12v12h-12Z" fill="#9CC9E8" stroke="${L}" stroke-width="2.5"/>
    ${[22, 196, 214].map((x) => `<g><rect x="${x}" y="122" width="10" height="24" fill="#FFF7E3" stroke="${L}" stroke-width="2.5"/><path d="M${x + 5} 106c5 6 6 10 0 14-6-4-5-8 0-14Z" fill="#F2B23A" stroke="${L}" stroke-width="2"/></g>`).join('')}`,
};

export function ortBild(id, titel = null) {
  return svg('0 0 240 160', ORTSBILD[id] || '', titel);
}

// ---------- Kleine Ortssymbole für die Karte (Kreis 0 0 64 64) ----------
const MARKER = {
  meissen: `<path d="M18 46V28l5-12 5 12v18ZM30 46V30h18v16Z" fill="#E9DDC7" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/><path d="M28 31l6-7h10l6 7Z" fill="#4A5568" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>`,
  freiberg: `<path d="M22 48L30 16M42 48L34 16M25 36h14M27 26h10" stroke="#C9D1DB" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="16" r="7" fill="#C9D1DB" stroke="${L}" stroke-width="2.6"/>`,
  leipzig: `<path d="M20 48V30h14v18ZM34 48V22h10v26Z" fill="#F2EADB" stroke="${L}" stroke-width="2.6"/><path d="M33 23l6-8 6 8Z" fill="#4A5568" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>`,
};
export const markerInhalt = (id) => MARKER[id] || '';

// ---------- Karten im Spiel „Zuordnen“ ----------
const ZUORDNEN = {
  kaolin: `<path d="M10 46c0-14 10-24 22-24s22 10 22 24Z" fill="#FFFFFF" stroke="${L}" stroke-width="3"/><path d="M20 38c4-4 10-6 16-4" stroke="#C9CFDB" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  feldspat: `<path d="M14 40l8-20h22l8 12-10 18H20Z" fill="#F4C9B5" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M22 20l8 14h22M30 34l-8 16" stroke="#C98E74" stroke-width="2.5" fill="none"/>`,
  quarz: `<path d="M24 54V26l8-14 8 14v28Z" fill="#EAF2FA" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M14 54V34l6-10 6 10v20ZM38 54V36l6-9 6 9v18Z" fill="#DCE8F5" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/><path d="M32 12v42" stroke="#B9CDE6" stroke-width="2"/>`,
  gold: `<path d="M8 46l8-16h32l8 16Z" fill="#F2C94C" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M18 30l6-12h20l4 12" fill="#F7DA7A" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M28 24h8" stroke="#FFF6CF" stroke-width="3" stroke-linecap="round"/>`,
  silber: `<circle cx="32" cy="32" r="20" fill="#DCE2EA" stroke="${L}" stroke-width="3"/><circle cx="32" cy="32" r="13" fill="none" stroke="#9AA4B2" stroke-width="3"/><path d="M26 24c4-3 9-3 12 0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  mehl: `<path d="M16 54c-2-14 2-26 8-32l-2-8h20l-2 8c6 6 10 18 8 32Z" fill="#F7F1E3" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M26 34c0 4 4 8 6 8s6-4 6-8c-2 2-4 2-6 0-2 2-4 2-6 0Z" fill="#E2B04A"/><path d="M32 44v6" stroke="#E2B04A" stroke-width="3" stroke-linecap="round"/>`,
};
export const zuordnenBild = (id) => svg('0 0 64 64', ZUORDNEN[id] || '');

// ---------- Karten im Zeitstrahl ----------
const ZEIT = {
  kirche: `<path d="M14 54V30h22v24ZM36 54V18h14v36Z" fill="#F2EADB" stroke="${L}" stroke-width="3"/><path d="M35 19l8-10 8 10Z" fill="#4A5568" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/><path d="M12 31l13-10 13 10Z" fill="#4A5568" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/><path d="M21 54v-9a4 4 0 0 1 8 0v9Z" fill="#8A5A36"/>`,
  plakat: `<path d="M32 58V30" stroke="#8A5A36" stroke-width="4" stroke-linecap="round"/><rect x="10" y="10" width="44" height="26" rx="3" fill="#FFFFFF" stroke="${L}" stroke-width="3"/><path d="M17 19h30M17 27h22" stroke="#2350A8" stroke-width="3.5" stroke-linecap="round"/>`,
  menge: `${[[14, 36], [32, 32], [50, 36], [23, 44], [41, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y - 10}" r="6" fill="#E7B48C" stroke="${L}" stroke-width="2.4"/><path d="M${x - 8} ${y + 14}c0-10 4-16 8-16s8 6 8 16Z" fill="#5B6B80" stroke="${L}" stroke-width="2.4"/>`).join('')}<path d="M54 18c3 4 3 7 0 9-3-2-3-5 0-9Z" fill="#F2B23A" stroke="${L}" stroke-width="1.8"/>`,
  mauer: `<path d="M6 52V24h52v28Z" fill="#C9C4BA" stroke="${L}" stroke-width="3"/><path d="M6 33h52M6 43h52M19 24v9M35 24v9M51 24v9M12 33v10M28 33v10M44 33v10M20 43v9M36 43v9" stroke="#9A948A" stroke-width="2.4"/><path d="M26 24l6 10 4-6 4 24h-14Z" fill="#FDF0D2" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>`,
  einheit: `<path d="M8 22h20v8a5 5 0 1 0 0 8v8H8Z" fill="#2350A8" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M56 22H34v8a5 5 0 1 1 0 8v8h22Z" fill="#F2B23A" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>`,
};
export const zeitBild = (id) => svg('0 0 64 64', ZEIT[id] || '');

// ---------- Rollen ----------
const ROLLE_FARBE = { navigation: '#2350A8', protokoll: '#1E6B4F', recherche: '#B5402A' };
const ROLLE_ZEICHEN = {
  navigation: '<circle cx="32" cy="32" r="14" fill="none" stroke="#fff" stroke-width="4"/><path d="M38 26l-4 10-10 4 4-10Z" fill="#fff"/>',
  protokoll: '<rect x="22" y="18" width="20" height="28" rx="3" fill="none" stroke="#fff" stroke-width="4"/><path d="M27 28h10M27 35h10" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>',
  recherche: '<circle cx="29" cy="29" r="9" fill="none" stroke="#fff" stroke-width="4"/><path d="M36 36l8 8" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
};
export function rolleBild(rolle) {
  return svg('0 0 64 64', `<circle cx="32" cy="32" r="30" fill="${ROLLE_FARBE[rolle]}"/>${ROLLE_ZEICHEN[rolle]}`);
}
