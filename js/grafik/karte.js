// Illustrierte, vereinfachte Sachsen-Karte – eigenes SVG, kein externer Kartendienst.
// Umriss: Natural Earth (gemeinfrei), vereinfacht; Gestaltung CC BY-SA 4.0.

import { KARTE } from './karte-daten.js';
import { markerInhalt } from './symbole.js';

const L = '#1C2541';
const FARBE = { meissen: '#2350A8', freiberg: '#3E4C5E', leipzig: '#8A5A00' };

function glatt(punkte) {
  // Catmull-Rom -> kubische Bézierkurven
  let d = `M${punkte[0][0]} ${punkte[0][1]}`;
  for (let i = 0; i < punkte.length - 1; i++) {
    const p0 = punkte[i - 1] || punkte[i];
    const p1 = punkte[i];
    const p2 = punkte[i + 1];
    const p3 = punkte[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function berg(x, y, s = 1) {
  return `<path d="M${x - 34 * s} ${y}l${34 * s}-${40 * s} ${34 * s} ${40 * s}Z" fill="#B8C4A8" stroke="${L}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 10 * s} ${y - 28 * s}l${10 * s}-${12 * s} ${10 * s} ${12 * s}-${5 * s} ${4 * s}-${5 * s}-${4 * s}-${5 * s} ${4 * s}Z" fill="#FFFFFF"/>`;
}

/**
 * orte: [{ id, name, thema, geschafft, gesamt, spielbar }]
 * Rückgabe: SVG-Zeichenkette mit Links zu den Orten.
 */
export function karteSvg(orte) {
  const { breite, hoehe, umriss, elbe } = KARTE;
  const pos = KARTE.orte;
  const LAGE = { meissen: 'oben', freiberg: 'unten', leipzig: 'unten' };
  const marker = orte.map((o) => {
    const [x, y] = pos[o.id];
    const oben = LAGE[o.id] === 'oben';
    const bl = Math.max(o.name.length * 17, o.thema.length * 11.5) + 40;
    const lx = Math.min(Math.max(x - bl / 2, 8), breite - bl - 8);
    const ly = oben ? y - 46 - 62 : y + 46;
    const pyPunkte = oben ? y - 46 - 62 - 16 : y + 46 + 62 + 16;
    const punkte = Array.from({ length: o.gesamt }, (_, i) => `<circle cx="${x - (o.gesamt - 1) * 12 + i * 24}" cy="${pyPunkte}" r="9" fill="${i < o.geschafft ? '#1E6B4F' : '#FFFFFF'}" stroke="${L}" stroke-width="3"/>`).join('');
    const label = `<rect x="${lx}" y="${ly}" width="${bl}" height="62" rx="16" fill="#FFFFFF" stroke="${L}" stroke-width="3.5"/>
      <text x="${lx + bl / 2}" y="${ly + 29}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="30" fill="${L}">${o.name}</text>
      <text x="${lx + bl / 2}" y="${ly + 52}" text-anchor="middle" font-family="Atkinson Hyperlegible, sans-serif" font-weight="700" font-size="19" fill="#33405E">${o.thema}</text>`;
    const inhalt = `<g class="marker">
        <circle class="marker__fokus" cx="${x}" cy="${y}" r="58" fill="none" stroke="#FFBF1F" stroke-width="12"/>
        <circle class="marker__ring" cx="${x}" cy="${y}" r="44" fill="#FFFFFF" stroke="${L}" stroke-width="4"/>
        <circle class="marker__kreis" cx="${x}" cy="${y}" r="37" fill="${FARBE[o.id]}"/>
        <g transform="translate(${x - 40} ${y - 40}) scale(1.25)">${markerInhalt(o.id)}</g>
        ${label}${punkte}
      </g>`;
    if (!o.spielbar) return `<g opacity=".45" aria-hidden="true">${inhalt}</g>`;
    return `<a href="#/ort/${o.id}" aria-label="${o.name}: ${o.thema}. ${o.geschafft} von ${o.gesamt} Spielen geschafft.">${inhalt}</a>`;
  }).join('');

  const [dx, dy] = pos.dresden;
  return `<svg viewBox="0 0 ${breite} ${hoehe}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Karte von Sachsen mit drei Orten">
    <defs>
      <pattern id="karte-punkte" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#C7D6B5"/></pattern>
    </defs>
    <path d="${umriss}" fill="#D9CFBD" transform="translate(8 10)"/>
    <path d="${umriss}" fill="#F4F7EA" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${umriss}" fill="url(#karte-punkte)"/>
    ${berg(215, 650, 0.9)}${berg(300, 625, 1.1)}${berg(395, 560, 0.95)}${berg(560, 530, 1.05)}${berg(650, 478, 0.85)}
    <text x="470" y="655" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="30" fill="#3B4A2C">Erzgebirge</text>
    <path d="${glatt(elbe)}" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round"/>
    <path d="${glatt(elbe)}" fill="none" stroke="#3D7FC4" stroke-width="9" stroke-linecap="round"/>
    <text x="${elbe[5][0] + 40}" y="${elbe[5][1] + 34}" font-family="Fredoka, sans-serif" font-size="28" fill="#1F5C99" transform="rotate(-24 ${elbe[5][0] + 40} ${elbe[5][1] + 34})">Elbe</text>
    <circle cx="${dx}" cy="${dy}" r="9" fill="${L}"/>
    <text x="${dx + 16}" y="${dy + 8}" font-family="Atkinson Hyperlegible, sans-serif" font-weight="700" font-size="26" fill="${L}">Dresden</text>
    <g transform="translate(905 690)"><circle r="34" fill="#FFFFFF" stroke="${L}" stroke-width="3"/><path d="M0-24l9 24h-18Z" fill="#B5402A"/><path d="M0 24l9-24h-18Z" fill="#C9CFDB"/><text y="-30" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="18" fill="${L}" dy="-6">N</text></g>
    ${marker}
  </svg>`;
}
