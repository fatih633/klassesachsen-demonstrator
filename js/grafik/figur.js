// Erzählfigur „Gurri“, eine Stadttaube – eigene Vektorgrafik (CC BY-SA 4.0).
// Stimmungen: 'hallo' (winkt), 'denkt', 'freut'.

const L = '#1C2541';

export function gurriSvg(stimmung = 'hallo', { titel = null } = {}) {
  const freut = stimmung === 'freut';
  const denkt = stimmung === 'denkt';
  const kopfDreh = denkt ? 'rotate(-10 132 70)' : '';
  const auge = freut
    ? `<path d="M131 66q6-7 12 0" fill="none" stroke="${L}" stroke-width="3.6" stroke-linecap="round"/>`
    : `<circle cx="137" cy="66" r="9" fill="#F28C28" stroke="${L}" stroke-width="3"/><circle cx="138.5" cy="66" r="4.4" fill="${L}"/><circle cx="140.4" cy="63.6" r="1.6" fill="#fff"/>`;
  const flHinten = (stimmung === 'hallo' || freut)
    ? `<path d="M84 100C62 92 46 70 46 42c18 4 34 22 44 50Z" fill="#7D879C" stroke="${L}" stroke-width="3.4" stroke-linejoin="round"/><path d="M60 60c6 4 10 8 14 14M56 72c6 3 10 6 14 11" stroke="${L}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`
      + (freut ? `<path d="M120 96c4-24 18-42 40-50 2 20-8 40-30 56Z" fill="#7D879C" stroke="${L}" stroke-width="3.4" stroke-linejoin="round"/>` : '')
    : '';
  const fluegel = (stimmung === 'hallo' || freut)
    ? `<path d="M74 118c8-10 22-14 38-10 2 10-4 20-16 24-10 2-18-4-22-14Z" fill="#7D879C" stroke="${L}" stroke-width="3.4" stroke-linejoin="round"/>`
    : `<g><path d="M70 112c4-20 22-30 46-26 6 14 0 32-18 40-12 4-24-2-28-14Z" fill="#7D879C" stroke="${L}" stroke-width="3.4" stroke-linejoin="round"/><path d="M84 104c8-3 16-3 24 0M86 116c7-3 14-3 20 0" stroke="${L}" stroke-width="5" stroke-linecap="round" fill="none"/></g>`;
  const gedanke = denkt
    ? `<g fill="#fff" stroke="${L}" stroke-width="2.6"><circle cx="168" cy="40" r="4"/><circle cx="178" cy="26" r="6"/><circle cx="188" cy="10" r="8"/></g>`
    : '';
  const t = titel ? `<title>${titel}</title>` : '';
  const aria = titel ? 'role="img"' : 'aria-hidden="true" focusable="false"';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" ${aria}>${t}
  <ellipse cx="100" cy="186" rx="58" ry="8" fill="${L}" opacity=".12"/>
  ${flHinten}
  <path d="M40 132L10 150l8 6 34-8Z" fill="#59627A" stroke="${L}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M14 150l8 6 8-2" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round"/>
  <path d="M86 168l-4 14M82 182l-7 2M82 182l4 3M112 168l3 14M115 182l-6 2M115 182l6 2" stroke="#E07A7A" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <path d="M44 128C42 98 66 78 102 78c30 0 50 18 52 44 2 30-24 50-58 50-30 0-50-18-52-44Z" fill="#9AA3B5" stroke="${L}" stroke-width="3.4"/>
  <path d="M92 168c-22-6-32-22-28-38 22 6 44 4 62-6 8 24-8 44-34 44Z" fill="#C9CFDB"/>
  <g transform="${kopfDreh}">
    <path d="M104 96c-4-26 8-50 30-52 20-2 32 12 32 30 0 14-8 26-20 34Z" fill="#3E9C7E" stroke="${L}" stroke-width="3.4"/>
    <path d="M108 96c4-8 12-12 22-12 6 0 12 4 16 10-8 10-24 14-38 2Z" fill="#7A5BA6" opacity=".85"/>
    <circle cx="134" cy="64" r="24" fill="#8D97AB" stroke="${L}" stroke-width="3.4"/>
    ${auge}
    <path d="M155 70l17 4-16 6Z" fill="#59627A" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M152 68c3-3 6-3 8 0" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
    ${freut ? '<circle cx="146" cy="78" r="4.5" fill="#F4A3A3" opacity=".8"/>' : ''}
  </g>
  <path d="M98 100c14 8 32 8 48-2l3 10c-16 10-36 10-52 2Z" fill="#FFFFFF" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M108 104l4 8M120 106l2 8M132 105l-1 8" stroke="#1E6B4F" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M104 106c-6 10-6 20-2 30l8-4c-2-8-2-16 2-24Z" fill="#1E6B4F" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
  ${fluegel}
  ${gedanke}
</svg>`;
}

/** Kleines Kopfbild für Marke und App-Symbol. */
export function gurriKopfSvg() {
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="30" fill="#2350A8"/>
  <path d="M14 52c0-12 8-18 18-18s18 6 18 18Z" fill="#3E9C7E" stroke="${L}" stroke-width="2.4"/>
  <circle cx="31" cy="28" r="14" fill="#8D97AB" stroke="${L}" stroke-width="2.4"/>
  <circle cx="34.5" cy="26" r="5" fill="#F28C28" stroke="${L}" stroke-width="2"/>
  <circle cx="35.3" cy="26" r="2.4" fill="${L}"/>
  <circle cx="36.4" cy="24.6" r=".9" fill="#fff"/>
  <path d="M44 30l10 2.4-9.4 3.4Z" fill="#59627A" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M42.5 29c1.6-1.6 3.4-1.6 4.6 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`;
}
