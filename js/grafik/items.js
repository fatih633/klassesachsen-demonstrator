// Fundstücke (Items) als eigene Vektorgrafiken – eine Quelle für Album (SVG) und Collage (Canvas).
// Jede Form: { d: SVG-Pfad, f: Farbindex 0–4 | null, s: Linienstärke (Kontur), l: nur Linie, o: Deckkraft }
// Farbindex: 0 = hellste Fläche, 1 = Hauptfarbe, 2 = Akzent, 3 = dunkel, 4 = Zweitfarbe.
// Lizenz der Grafiken: CC BY-SA 4.0, N.A.I.L.A. UG (haftungsbeschränkt)

const kreis = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const ellipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

function bluete(cx, cy, r, blaetter = 5, f = 1, mitte = 2) {
  const formen = [];
  for (let i = 0; i < blaetter; i++) {
    const w = (i / blaetter) * Math.PI * 2 - Math.PI / 2;
    formen.push({ d: kreis(+(cx + Math.cos(w) * r).toFixed(2), +(cy + Math.sin(w) * r).toFixed(2), +(r * 0.72).toFixed(2)), f, s: 0 });
  }
  formen.push({ d: kreis(cx, cy, +(r * 0.62).toFixed(2)), f: mitte, s: 0 });
  return formen;
}

export const ITEM_GRAFIK = {
  'meissen-tasse': {
    farben: ['#FFFFFF', '#2350A8', '#F2B23A', '#1C2541', '#E3EAF8'],
    formen: [
      { d: 'M60 30c-4-6 4-10 0-17', l: 1, s: 2.6, o: 0.55 },
      { d: 'M48 30c-4-6 4-10 0-17', l: 1, s: 2.6, o: 0.55 },
      { d: ellipse(50, 80, 40, 10), f: 4, s: 3 },
      { d: ellipse(50, 78, 26, 5), f: 0, s: 0 },
      { d: 'M78 46c13-2 15 18 0 21', l: 1, s: 7 },
      { d: 'M78 46c13-2 15 18 0 21', l: 1, s: 3, f: 0, inner: true },
      { d: 'M22 40H78V56C78 70 66 79 50 79S22 70 22 56Z', f: 0, s: 3 },
      { d: ellipse(50, 40, 28, 6.5), f: 4, s: 3 },
      { d: 'M27 47c2 12 8 21 16 25', l: 1, s: 2.4, f: 4 },
      ...bluete(50, 60, 5.2, 5, 1, 2),
      { d: 'M38 66c-6-1-9-5-9-9 5 0 9 4 9 9Z', f: 1, s: 0 },
      { d: 'M62 66c6-1 9-5 9-9-5 0-9 4-9 9Z', f: 1, s: 0 },
    ],
  },
  'meissen-teller': {
    farben: ['#FFFFFF', '#2350A8', '#F2B23A', '#1C2541', '#E3EAF8'],
    formen: [
      { d: kreis(50, 50, 44), f: 0, s: 3 },
      { d: kreis(50, 50, 33), f: 4, s: 2.4 },
      ...Array.from({ length: 12 }, (_, i) => {
        const w = (i / 12) * Math.PI * 2;
        return { d: kreis(+(50 + Math.cos(w) * 38.5).toFixed(2), +(50 + Math.sin(w) * 38.5).toFixed(2), 2.6), f: 1, s: 0 };
      }),
      { d: 'M50 50c-10-6-16-16-14-25 9 2 15 13 14 25Z', f: 1, s: 0 },
      { d: 'M50 50c10-6 16-16 14-25-9 2-15 13-14 25Z', f: 1, s: 0 },
      { d: 'M50 50c-12 2-21 9-22 17 9 2 19-7 22-17Z', f: 1, s: 0 },
      { d: 'M50 50c12 2 21 9 22 17-9 2-19-7-22-17Z', f: 1, s: 0 },
      ...bluete(50, 52, 6.5, 6, 1, 2),
      { d: kreis(50, 52, 2.2), f: 0, s: 0 },
    ],
  },
  'freiberg-lampe': {
    farben: ['#FFF3C4', '#C8893A', '#F2B23A', '#3A2A1A', '#E6B36A'],
    formen: [
      { d: kreis(85, 30, 15), f: 2, s: 0, o: 0.28 },
      { d: 'M48 26V13c0-7 11-7 11 0', l: 1, s: 4.5 },
      { d: 'M30 34H66L73 70C73 82 63 89 50 89S27 82 27 70Z', f: 1, s: 3 },
      { d: 'M36 40c-2 14-2 30 2 42', l: 1, s: 4, f: 4, o: 0.9 },
      { d: 'M28 26H68V36H28Z', f: 3, s: 3 },
      { d: 'M66 48L84 40V48L69 58Z', f: 3, s: 3 },
      { d: 'M86 42C79 33 86 24 89 16C94 25 99 33 93 42C91 46 88 46 86 42Z', f: 2, s: 2.6 },
      { d: 'M88 40C86 35 88 30 89.5 26C92 31 93 36 90.5 40Z', f: 0, s: 0 },
      { d: 'M33 60H68', l: 1, s: 2.4, f: 3, o: 0.6 },
    ],
  },
  'freiberg-erz': {
    farben: ['#F1F4F8', '#6E7685', '#B8C2CF', '#2A3542', '#8F98A8'],
    formen: [
      { d: 'M12 72L20 46L38 30L62 26L84 38L91 62L78 83L46 89L22 82Z', f: 1, s: 3 },
      { d: 'M38 30L48 52L20 46Z', f: 4, s: 0 },
      { d: 'M62 26L84 38L66 50Z', f: 4, s: 0 },
      { d: 'M46 89L50 66L78 83Z', f: 4, s: 0 },
      { d: 'M34 58L44 42L52 56L44 68Z', f: 0, s: 2.6 },
      { d: 'M52 56L62 44L70 58L60 66Z', f: 2, s: 2.6 },
      { d: 'M62 66L72 60L76 72L66 76Z', f: 0, s: 2.6 },
      { d: 'M24 64L32 60L34 70L26 72Z', f: 2, s: 2.2 },
      { d: 'M74 16l2.6 6.4 6.4 2.6-6.4 2.6L74 34l-2.6-6.4-6.4-2.6 6.4-2.6Z', f: 0, s: 2 },
      { d: 'M24 28l1.8 4.2 4.2 1.8-4.2 1.8L24 40l-1.8-4.2-4.2-1.8 4.2-1.8Z', f: 0, s: 1.8 },
    ],
  },
  'leipzig-saeule': {
    farben: ['#FFF8EC', '#3F8F5A', '#E0B866', '#1C2541', '#8CC79A'],
    formen: [
      { d: 'M50 34C40 22 24 18 10 24C24 22 38 26 48 38Z', f: 1, s: 2.6 },
      { d: 'M50 34C60 22 76 18 90 24C76 22 62 26 52 38Z', f: 1, s: 2.6 },
      { d: 'M50 32C44 18 34 10 22 8C32 14 42 22 48 36Z', f: 4, s: 2.6 },
      { d: 'M50 32C56 18 66 10 78 8C68 14 58 22 52 36Z', f: 4, s: 2.6 },
      { d: 'M50 33C48 20 49 10 50 4C51 10 52 20 50 33Z', f: 1, s: 2.6 },
      { d: 'M50 36C38 32 26 34 16 42C28 38 40 38 49 40Z', f: 4, s: 2.6 },
      { d: 'M50 36C62 32 74 34 84 42C72 38 60 38 51 40Z', f: 4, s: 2.6 },
      { d: 'M38 38H62V44H38Z', f: 2, s: 2.6 },
      { d: 'M40 44H60V82H40Z', f: 0, s: 3 },
      { d: 'M45 48V79M50 48V79M55 48V79', l: 1, s: 1.8, o: 0.55 },
      { d: 'M34 82H66V88H34Z', f: 2, s: 2.6 },
      { d: 'M28 88H72V95H28Z', f: 0, s: 3 },
    ],
  },
  'leipzig-kerze': {
    farben: ['#FFF7E3', '#F2B23A', '#E07A2E', '#3B2A14', '#FBD98B'],
    formen: [
      { d: kreis(50, 26, 20), f: 4, s: 0, o: 0.45 },
      { d: 'M40 40H60V86H40Z', f: 0, s: 3 },
      { d: 'M40 40H60V46C57 50 55 44 52 49C50 53 47 46 44 50C42 52 41 49 40 47Z', f: 4, s: 0 },
      { d: 'M50 40V33', l: 1, s: 2.6 },
      { d: 'M50 12C58 22 60 30 50 36C40 30 42 22 50 12Z', f: 1, s: 2.6 },
      { d: 'M50 22C53 27 54 31 50 34C46 31 47 27 50 22Z', f: 0, s: 0 },
      { d: 'M27 86H73L68 93H32Z', f: 2, s: 3 },
      { d: 'M45 52V80', l: 1, s: 2.2, o: 0.4 },
    ],
  },
};

const LINIE = '#1C2541';

/** Item als SVG-Zeichenkette (dekorativ; Text-Alternative liefert die Umgebung). */
export function itemSvg(id, { farben = null, linie = LINIE, titel = null } = {}) {
  const g = ITEM_GRAFIK[id];
  if (!g) return '';
  const pal = farben || g.farben;
  const teile = g.formen.map((f) => {
    const deck = f.o !== undefined ? ` opacity="${f.o}"` : '';
    if (f.l) {
      const farbe = f.f !== undefined && f.f !== null && f.inner ? pal[f.f] : (f.f !== undefined && f.f !== null ? pal[f.f] : linie);
      return `<path d="${f.d}" fill="none" stroke="${farbe}" stroke-width="${f.s || 3}" stroke-linecap="round" stroke-linejoin="round"${deck}/>`;
    }
    const st = f.s ? ` stroke="${linie}" stroke-width="${f.s}" stroke-linejoin="round"` : '';
    return `<path d="${f.d}" fill="${pal[f.f]}"${st}${deck}/>`;
  });
  const t = titel ? `<title>${titel}</title>` : '';
  const aria = titel ? 'role="img"' : 'aria-hidden="true" focusable="false"';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${aria}>${t}${teile.join('')}</svg>`;
}

/** Item auf ein Canvas zeichnen (für die Collage). x, y = Mitte, groesse = Kantenlänge. */
export function itemZeichnen(ctx, id, x, y, groesse, { farben = null, linie = LINIE, drehung = 0 } = {}) {
  const g = ITEM_GRAFIK[id];
  if (!g) return;
  const pal = farben || g.farben;
  ctx.save();
  ctx.translate(x, y);
  if (drehung) ctx.rotate(drehung);
  const s = groesse / 100;
  ctx.scale(s, s);
  ctx.translate(-50, -50);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const f of g.formen) {
    const pfad = new Path2D(f.d);
    ctx.globalAlpha = f.o !== undefined ? f.o : 1;
    if (f.l) {
      ctx.strokeStyle = f.f !== undefined && f.f !== null ? pal[f.f] : linie;
      ctx.lineWidth = f.s || 3;
      ctx.stroke(pfad);
    } else {
      ctx.fillStyle = pal[f.f];
      ctx.fill(pfad);
      if (f.s) { ctx.strokeStyle = linie; ctx.lineWidth = f.s; ctx.stroke(pfad); }
    }
  }
  ctx.restore();
}
