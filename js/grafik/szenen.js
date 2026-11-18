// Wimmelbilder für die Spurensuche – eigene Vektorgrafiken (CC BY-SA 4.0).
// Koordinatensystem 1000 × 640; die anklickbaren Bereiche stehen in inhalt/<ort>.json.

const L = '#1C2541';

function ziegel(x0, y0, x1, y1, h = 26, w = 52, farbe = '#9C4630') {
  let s = '';
  for (let y = y0, r = 0; y < y1; y += h, r++) {
    s += `<path d="M${x0} ${y}H${x1}"/>`;
    for (let x = x0 + (r % 2 ? w / 2 : 0); x < x1; x += w) s += `<path d="M${x} ${y}v${Math.min(h, y1 - y)}"/>`;
  }
  return `<g stroke="${farbe}" stroke-width="3" fill="none">${s}</g>`;
}

function tasseKlein(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -22H14V-8C14 0 7 4 0 4S-14 0-14-8Z" fill="#fff" stroke="${L}" stroke-width="3"/><path d="M14 -16c8 0 8 10 0 10" fill="none" stroke="${L}" stroke-width="3"/><path d="M-14 -16H14" stroke="#2350A8" stroke-width="4"/></g>`;
}

const MEISSEN = () => `<svg viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <rect width="1000" height="640" fill="#E9DDC7"/>
  <g stroke="#D3C2A2" stroke-width="3" fill="none">
    ${[110, 170, 230, 290, 350, 410, 470, 530].map((y, i) => `<path d="M0 ${y}H1000"/>` + Array.from({ length: 11 }, (_, k) => `<path d="M${k * 100 + (i % 2 ? 50 : 0)} ${y}v60"/>`).join('')).join('')}
  </g>
  <path d="M0 0H1000V54C860 120 640 122 500 56 360 122 140 120 0 54Z" fill="#D8C6A6"/>
  <path d="M0 54C140 120 360 122 500 56 640 122 860 120 1000 54" fill="none" stroke="#B9A27C" stroke-width="8"/>
  <path d="M250 104L250 0M750 104L750 0" stroke="#B9A27C" stroke-width="6"/>
  <rect y="600" width="1000" height="40" fill="#B98B5E"/>
  <path d="M0 600H1000M140 600v40M380 600v40M620 600v40M860 600v40" stroke="#8C6440" stroke-width="3"/>

  <!-- Fenster mit Blick auf die Elbe -->
  <path d="M422 252V132C422 86 452 62 495 62S568 86 568 132V252Z" fill="#A9D4EE"/>
  <path d="M422 200C450 176 480 172 506 184S552 196 568 186V252H422Z" fill="#7DB47C"/>
  <path d="M422 214C470 206 520 222 568 210V232C520 244 470 228 422 236Z" fill="#3D7FC4"/>
  <path d="M440 214l8 6M480 222l10 4M520 226l8 3" stroke="#BFE0F7" stroke-width="3" stroke-linecap="round"/>
  <path d="M470 186l8-16 8 16Z M500 182l6-12 6 12Z" fill="#5E8F5C"/>
  <path d="M495 62V252M422 160H568" stroke="#8C7A5C" stroke-width="7"/>
  <path d="M422 252V132C422 86 452 62 495 62S568 86 568 132V252Z" fill="none" stroke="#8C7A5C" stroke-width="12"/>
  <rect x="408" y="248" width="174" height="16" rx="4" fill="#C9B590" stroke="#8C7A5C" stroke-width="3"/>

  <!-- Regal mit Tassen -->
  <g>
    <rect x="48" y="176" width="236" height="13" rx="3" fill="#8A5A36" stroke="${L}" stroke-width="3"/>
    <rect x="48" y="256" width="236" height="13" rx="3" fill="#8A5A36" stroke="${L}" stroke-width="3"/>
    <path d="M70 189l14 18M262 189l-14 18M70 269l14 18M262 269l-14 18" stroke="${L}" stroke-width="5" stroke-linecap="round"/>
    ${tasseKlein(84, 176)}${tasseKlein(134, 176)}${tasseKlein(184, 176)}${tasseKlein(240, 176)}
    <ellipse cx="96" cy="234" rx="30" ry="22" fill="#fff" stroke="${L}" stroke-width="3"/><circle cx="96" cy="234" r="11" fill="#2350A8"/>
    ${tasseKlein(160, 256)}${tasseKlein(212, 256)}${tasseKlein(258, 256, .8)}
  </g>

  <!-- Säcke mit Kaolin (Porzellanerde) -->
  <g>
    <path d="M44 600C34 540 44 480 74 456l-8-18 36 8 30-10-6 22c28 26 34 92 22 142Z" fill="#E2D2B3" stroke="${L}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M66 438l36 8 30-10" fill="none" stroke="#8A6A45" stroke-width="5"/>
    <path d="M150 600C140 554 150 506 176 488l-6-16 32 6 26-8-4 18c24 22 28 76 18 112Z" fill="#D9C7A4" stroke="${L}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M70 470c10 4 40 4 54-2M176 500c10 4 36 4 48-2" stroke="#BCA77E" stroke-width="3" fill="none"/>
    <path d="M96 600c8-34 30-50 56-50s46 18 52 50Z" fill="#FFFFFF" stroke="${L}" stroke-width="3"/>
    <path d="M116 576c10-8 22-10 34-8M168 584c8-4 18-4 26 0" stroke="#D9DEE8" stroke-width="3" fill="none"/>
    <path d="M136 452c10-2 18 2 22 8-8 4-18 2-22-8Z" fill="#fff" stroke="${L}" stroke-width="2.5"/>
  </g>

  <!-- Katze Mitzi -->
  <g>
    <path d="M286 604c-6-30 18-52 52-52 30 0 50 18 48 42-1 6-4 10-10 10Z" fill="#E59A4A" stroke="${L}" stroke-width="3.5"/>
    <path d="M300 604c-8-16 4-30 22-30" fill="none" stroke="#B86F2C" stroke-width="5" stroke-linecap="round"/>
    <circle cx="300" cy="582" r="20" fill="#E59A4A" stroke="${L}" stroke-width="3.5"/>
    <path d="M286 568l-4-16 14 8ZM306 562l8-12 4 16Z" fill="#E59A4A" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M290 584q4 4 8 0M302 584q4 4 8 0" stroke="${L}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M384 594c10 2 14-10 6-16" fill="none" stroke="#E59A4A" stroke-width="9" stroke-linecap="round"/>
    <text x="330" y="548" font-family="Fredoka, sans-serif" font-size="22" fill="${L}" opacity=".7">z z</text>
  </g>

  <!-- Maltisch und Malerin -->
  <g>
    <path d="M500 470c-6-60 6-110 46-118 44-8 66 40 62 118Z" fill="#9E4A3A" stroke="${L}" stroke-width="3.5"/>
    <path d="M528 470c0-46 8-80 28-86 20 4 26 40 26 86Z" fill="#FFFFFF" stroke="${L}" stroke-width="3"/>
    <circle cx="552" cy="318" r="34" fill="#E7B48C" stroke="${L}" stroke-width="3.5"/>
    <path d="M518 316c-2-28 18-44 40-42 22 2 34 20 30 40-10-14-26-20-44-16-10 2-18 8-26 18Z" fill="#5A3A28" stroke="${L}" stroke-width="3"/>
    <circle cx="578" cy="278" r="15" fill="#5A3A28" stroke="${L}" stroke-width="3"/>
    <path d="M540 322q4 4 8 0M560 322q4 4 8 0" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M546 338q6 4 12 0" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M600 420c22 6 40 20 46 38" fill="none" stroke="#9E4A3A" stroke-width="22" stroke-linecap="round"/>
    <path d="M600 420c22 6 40 20 46 38" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <path d="M646 456l26-44" stroke="#8A5A36" stroke-width="6" stroke-linecap="round"/>
    <path d="M672 412l6-10" stroke="#2350A8" stroke-width="8" stroke-linecap="round"/>
    <rect x="430" y="468" width="262" height="18" rx="4" fill="#8A5A36" stroke="${L}" stroke-width="3.5"/>
    <path d="M450 486v112M672 486v112" stroke="${L}" stroke-width="10" stroke-linecap="round"/>
    <path d="M450 486v112M672 486v112" stroke="#8A5A36" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="500" cy="462" rx="44" ry="10" fill="#fff" stroke="${L}" stroke-width="3"/>
    <path d="M478 460c8-6 16-6 22 0s14 6 22 0" stroke="#2350A8" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="612" cy="462" rx="34" ry="9" fill="#fff" stroke="${L}" stroke-width="3"/>
    <circle cx="612" cy="461" r="5" fill="#2350A8"/>
    <rect x="652" y="436" width="22" height="30" rx="4" fill="#2350A8" stroke="${L}" stroke-width="3"/>
    <path d="M658 436l-6-24M666 436l2-26" stroke="#8A5A36" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Brennofen -->
  <g>
    <rect x="826" y="118" width="48" height="80" fill="#9C4630" stroke="${L}" stroke-width="3.5"/>
    <path d="M834 112c4-14 26-16 32-2" fill="#C8C4BC" opacity=".8"/>
    <path d="M742 602V330C742 232 798 186 850 186S958 232 958 330V602Z" fill="#B5563A" stroke="${L}" stroke-width="4"/>
    ${ziegel(746, 330, 956, 600)}
    <path d="M770 330C770 260 806 222 850 222" fill="none" stroke="#D27A5A" stroke-width="7" stroke-linecap="round" opacity=".7"/>
    <path d="M796 600V500C796 462 820 440 850 440S904 462 904 500V600Z" fill="#3A1E14" stroke="${L}" stroke-width="4"/>
    <path d="M812 600C808 566 826 552 830 528c10 18 18 22 20 40 6-18 14-30 12-52 16 22 28 46 22 84Z" fill="#F28C28"/>
    <path d="M832 600c-2-18 8-28 12-40 6 12 10 18 10 28 4-8 8-14 8-22 8 12 10 22 6 34Z" fill="#FFD24A"/>
    <path d="M760 616c40 10 140 10 180 0" stroke="#F2B23A" stroke-width="6" opacity=".45" stroke-linecap="round"/>
  </g>
</svg>`;

const FREIBERG = () => `<svg viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <rect width="1000" height="640" fill="#6E5039"/>
  <path d="M0 160C200 140 360 190 560 170S860 130 1000 150V250H0Z" fill="#7C5C43"/>
  <path d="M0 420C220 400 420 450 640 430S900 400 1000 410V640H0Z" fill="#5F4432"/>
  <g fill="#86664C" opacity=".8"><circle cx="40" cy="300" r="10"/><circle cx="960" cy="210" r="12"/><circle cx="620" cy="140" r="9"/><circle cx="420" cy="150" r="7"/><circle cx="250" cy="620" r="9"/><circle cx="980" cy="620" r="8"/></g>
  <rect width="1000" height="72" fill="#BFE3F2"/>
  <path d="M0 72C120 60 220 78 330 70S560 60 700 72 900 66 1000 70V96H0Z" fill="#6BA368"/>
  <!-- Förderturm über dem Schacht -->
  <g stroke="${L}" stroke-width="4" stroke-linecap="round">
    <path d="M96 92L126 18M174 92L144 18M110 58H160M100 82H170" stroke="#8A5A36" stroke-width="7"/>
    <circle cx="135" cy="18" r="13" fill="#4A5568" stroke="${L}" stroke-width="3.5"/>
  </g>
  <!-- Schacht mit Fahrt (Leiter) -->
  <rect x="80" y="92" width="112" height="548" fill="#2C211A"/>
  <g stroke="#7A5A3A" stroke-width="9">${[150, 260, 370, 480, 590].map((y) => `<path d="M80 ${y}H192"/>`).join('')}</g>
  <g stroke="${L}" stroke-width="3">${[150, 260, 370, 480, 590].map((y) => `<path d="M80 ${y - 4.5}H192M80 ${y + 4.5}H192" opacity=".35"/>`).join('')}</g>
  <path d="M110 110V636M164 110V636" stroke="#D6A86E" stroke-width="10"/>
  <path d="M110 110V636M164 110V636" stroke="${L}" stroke-width="2.5" opacity=".4"/>
  <g stroke="#D6A86E" stroke-width="8">${Array.from({ length: 13 }, (_, i) => `<path d="M110 ${130 + i * 40}H164"/>`).join('')}</g>
  <!-- Stolln (Gang im Berg) -->
  <path d="M192 236H1000V604H192Z" fill="#A98464"/>
  <path d="M192 236H1000V262C800 250 500 270 192 256Z" fill="#8F6E52"/>
  <path d="M192 604H1000V640H192Z" fill="#7A5C44"/>
  <!-- Erzgang (glitzerndes Band) -->
  <path d="M664 382L700 340 760 300 820 252 880 214 942 168 958 196 900 242 840 290 780 336 718 378 690 400Z" fill="#D9D3C5" stroke="${L}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M690 372L736 340M770 318L812 284M846 262L896 222M918 200L944 182" stroke="#9AA4B2" stroke-width="6" stroke-linecap="round"/>
  <g fill="#F4F7FB" stroke="${L}" stroke-width="2">
    <path d="M724 344l5 12 12 5-12 5-5 12-5-12-12-5 12-5Z"/>
    <path d="M820 272l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/>
    <path d="M904 214l5 11 11 5-11 5-5 11-5-11-11-5 11-5Z"/>
  </g>
  <!-- Türstöcke (Holzausbau) -->
  <g stroke="${L}" stroke-width="3">
    <path d="M214 238V604M620 238V604M986 238V604" stroke="#8A6440" stroke-width="16"/>
    <path d="M196 246H1000" stroke="#8A6440" stroke-width="18"/>
    <path d="M500 292H660" stroke="#8A6440" stroke-width="12"/>
  </g>
  <!-- Schlägel und Eisen -->
  <g stroke-linecap="round">
    <path d="M262 352L344 270" stroke="#8A5A36" stroke-width="10"/>
    <path d="M330 262l22 22 10-10-22-22Z" fill="#5B6472" stroke="${L}" stroke-width="3"/>
    <path d="M262 270L344 352" stroke="#8A5A36" stroke-width="10"/>
    <path d="M250 270l18-18 10 14-12 12Z" fill="#5B6472" stroke="${L}" stroke-width="3"/>
    <path d="M250 258l-6-6" stroke="#5B6472" stroke-width="6"/>
  </g>
  <!-- Fledermaus -->
  <g>
    <path d="M572 298v10" stroke="${L}" stroke-width="3"/>
    <path d="M572 312c-10 0-18 8-18 20 0 10 8 18 18 18s18-8 18-18c0-12-8-20-18-20Z" fill="#3E3550" stroke="${L}" stroke-width="3"/>
    <path d="M554 324c-14-2-26 6-30 18 10-4 16 0 18 6 4-6 10-8 14-4Z" fill="#3E3550" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M590 324c14-2 26 6 30 18-10-4-16 0-18 6-4-6-10-8-14-4Z" fill="#3E3550" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="566" cy="340" r="2.6" fill="#FFD24A"/><circle cx="578" cy="340" r="2.6" fill="#FFD24A"/>
    <path d="M562 352l-4 8M582 352l4 8" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <!-- Schienen -->
  <path d="M192 590H1000" stroke="#4A4F5A" stroke-width="7"/>
  <g stroke="#6B4A2E" stroke-width="10">${Array.from({ length: 14 }, (_, i) => `<path d="M${210 + i * 58} 594v12"/>`).join('')}</g>
  <!-- Hunt -->
  <g>
    <path d="M338 462H546L530 562H354Z" fill="#8A5A36" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M342 488H542M348 532H536" stroke="#5B6472" stroke-width="8"/>
    <path d="M350 466c10-26 30-30 44-18 10-18 34-22 48-6 14-14 40-12 52 4 12-8 34-6 44 20Z" fill="#7B7F8A" stroke="${L}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M400 446l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z M470 440l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#F4F7FB" stroke="${L}" stroke-width="1.6"/>
    <circle cx="386" cy="572" r="18" fill="#4A4F5A" stroke="${L}" stroke-width="4"/><circle cx="386" cy="572" r="6" fill="#C9CFD8"/>
    <circle cx="498" cy="572" r="18" fill="#4A4F5A" stroke="${L}" stroke-width="4"/><circle cx="498" cy="572" r="6" fill="#C9CFD8"/>
  </g>
  <!-- Schatzkiste -->
  <g>
    <path d="M652 520H750V576H652Z" fill="#A0652E" stroke="${L}" stroke-width="3.5"/>
    <path d="M652 520C652 488 750 488 750 520Z" fill="#B87736" stroke="${L}" stroke-width="3.5"/>
    <path d="M668 496V576M734 496V576" stroke="#D9A43A" stroke-width="7"/>
    <rect x="690" y="514" width="22" height="22" rx="4" fill="#F2C94C" stroke="${L}" stroke-width="3"/>
  </g>
  <!-- Zwerg hinter einem Stein -->
  <g>
    <path d="M868 522c-2-26 14-46 34-46s34 20 34 46Z" fill="#F1D3B6" stroke="${L}" stroke-width="3.5"/>
    <path d="M864 492L902 402 940 492Z" fill="#C8472F" stroke="${L}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="890" cy="506" r="3.4" fill="${L}"/><circle cx="914" cy="506" r="3.4" fill="${L}"/>
    <circle cx="902" cy="516" r="6" fill="#E9A48A" stroke="${L}" stroke-width="2.5"/>
    <path d="M870 524c8 30 56 30 64 0-10 6-20 10-32 10s-24-4-32-10Z" fill="#FFFFFF" stroke="${L}" stroke-width="3"/>
    <path d="M832 604c-8-40 14-76 60-80 50-4 74 26 70 80Z" fill="#8C8E96" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M860 560c14-10 32-12 46-8" stroke="#A9ABB3" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

export const SZENEN = { 'meissen-werkstatt': MEISSEN, 'freiberg-bergwerk': FREIBERG };
export const szeneSvg = (id) => (SZENEN[id] ? SZENEN[id]() : '');
