// Regelbasierter Collage-Generator (ohne KI). Gleiche Eingaben -> gleiche Komposition.
// Alle Positionen entstehen aus einem Zufallsgenerator mit festem Startwert (Seed), der nur aus
// Item-Kennungen, Vorlage und Regler „Anordnung“ berechnet wird. Gezeichnet wird in einem
// logischen Raster von 1000 × 1000 und auf die Zielgröße skaliert (Vorschau, 2048 px, Druck).

import { itemZeichnen } from '../grafik/items.js';

export const GENERATOR = { name: 'klasseSachsen-Collage', version: '1.0.0' };

export const VORLAGEN = {
  mosaik: { name: 'Mosaik' },
  rosette: { name: 'Rosette' },
  raster: { name: 'Raster' },
};

export const STIMMUNGEN = {
  porzellan: { name: 'Porzellanblau', grund: '#F4F7FC', muster: '#D5E0F4', linie: '#1C2541', farben: ['#FFFFFF', '#2350A8', '#6E93D6', '#1C2541', '#DCE6F7'], kacheln: ['#FFFFFF', '#E3EAF8', '#C9D7F1', '#2350A8'] },
  silber: { name: 'Silberstollen', grund: '#26303C', muster: '#3A4756', linie: '#F1F3F6', farben: ['#F1F3F6', '#8E9BAD', '#D4B25A', '#26303C', '#B8C2CF'], kacheln: ['#3A4756', '#4B596B', '#2F3A48', '#6B7A8F'] },
  kerzenschein: { name: 'Kerzenschein', grund: '#2B1E3A', muster: '#3D2B52', linie: '#FFF6E0', farben: ['#FFF6E0', '#F2B23A', '#E07A2E', '#3B2A14', '#FBD98B'], kacheln: ['#3D2B52', '#4A3563', '#33244A', '#F2B23A'] },
  sachsenbunt: { name: 'Sachsenbunt', grund: '#FBF7EF', muster: '#EFE6D3', linie: '#1C2541', farben: ['#FFFFFF', '#1E6B4F', '#F2B23A', '#1C2541', '#B5402A'], kacheln: ['#FFFFFF', '#DDF0E6', '#FDF0D2', '#E3EAF8'] },
};

export const REGLER_GRENZEN = { anordnung: [1, 12], groesse: [60, 140] };

export function standardParameter(items) {
  return { items: [...items], vorlage: 'rosette', regler: { anordnung: 1, groesse: 100, farbstimmung: 'porzellan' } };
}

/** Prüft und normalisiert Parameter (z. B. aus einer JSON-Datei). Wirft bei ungültigen Werten. */
export function pruefeParameter(p, bekannteItems) {
  if (!p || !Array.isArray(p.items) || p.items.length < 1) throw new Error('Keine Items angegeben.');
  const items = p.items.filter((i) => bekannteItems.includes(i));
  if (items.length !== p.items.length) throw new Error('Unbekannte Item-Kennung.');
  if (!VORLAGEN[p.vorlage]) throw new Error('Unbekannte Vorlage.');
  const r = p.regler || {};
  if (!STIMMUNGEN[r.farbstimmung]) throw new Error('Unbekannte Farbstimmung.');
  const zahl = (v, [a, b]) => { const n = Math.round(Number(v)); if (!(n >= a && n <= b)) throw new Error('Reglerwert außerhalb des Bereichs.'); return n; };
  return { items, vorlage: p.vorlage, regler: { anordnung: zahl(r.anordnung, REGLER_GRENZEN.anordnung), groesse: zahl(r.groesse, REGLER_GRENZEN.groesse), farbstimmung: r.farbstimmung } };
}

function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function zufall() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFuer(p) {
  return fnv1a(JSON.stringify([p.items, p.vorlage, p.regler.anordnung]));
}

function gemischt(liste, rnd) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function kreis(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function rundRechteck(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function mosaik(ctx, p, st, rnd, g) {
  const n = 6;
  const zelle = 1000 / n;
  const folge = gemischt(p.items, rnd);
  let k = 0;
  for (let zy = 0; zy < n; zy++) {
    for (let zx = 0; zx < n; zx++) {
      const x = zx * zelle;
      const y = zy * zelle;
      ctx.fillStyle = st.kacheln[Math.floor(rnd() * st.kacheln.length)];
      rundRechteck(ctx, x + 7, y + 7, zelle - 14, zelle - 14, 18);
      ctx.fill();
      const art = rnd();
      if (art < 0.2) {
        ctx.strokeStyle = st.muster;
        ctx.lineWidth = 9;
        ctx.save();
        rundRechteck(ctx, x + 7, y + 7, zelle - 14, zelle - 14, 18);
        ctx.clip();
        for (let s = -zelle; s < zelle * 2; s += 28) { ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + s + zelle, y + zelle); ctx.stroke(); }
        ctx.restore();
      } else {
        const id = folge[k % folge.length];
        k += 1;
        itemZeichnen(ctx, id, x + zelle / 2, y + zelle / 2, zelle * 0.74 * g, { farben: st.farben, linie: st.linie, drehung: (rnd() - 0.5) * 0.5 });
      }
    }
  }
}

function rosette(ctx, p, st, rnd, g) {
  const m = 500;
  const versatz = rnd() * Math.PI * 2;
  const folge = gemischt(p.items, rnd);
  // Schmuckringe
  ctx.strokeStyle = st.muster;
  ctx.lineWidth = 16;
  for (const r of [175, 335, 470]) { kreis(ctx, m, m, r); ctx.stroke(); }
  // Blütenblätter zwischen den Ringen
  const blaetter = 12 + 2 * Math.floor(rnd() * 4);
  ctx.fillStyle = st.kacheln[1];
  for (let i = 0; i < blaetter; i++) {
    const w = versatz + (i / blaetter) * Math.PI * 2;
    ctx.save();
    ctx.translate(m + Math.cos(w) * 405, m + Math.sin(w) * 405);
    ctx.rotate(w);
    ctx.beginPath();
    ctx.ellipse(0, 0, 46, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Ring 1: alle Items im Wechsel, nach außen gedreht
  const n1 = Math.max(6, folge.length * (folge.length < 4 ? 3 : 2));
  for (let i = 0; i < n1; i++) {
    const w = versatz + (i / n1) * Math.PI * 2;
    itemZeichnen(ctx, folge[i % folge.length], m + Math.cos(w) * 255, m + Math.sin(w) * 255, 128 * g, { farben: st.farben, linie: st.linie, drehung: w + Math.PI / 2 });
  }
  // Ring 2: kleine Items
  const n2 = 18;
  for (let i = 0; i < n2; i++) {
    const w = versatz + ((i + 0.5) / n2) * Math.PI * 2;
    itemZeichnen(ctx, folge[(i + 1) % folge.length], m + Math.cos(w) * 405, m + Math.sin(w) * 405, 74 * g, { farben: st.farben, linie: st.linie, drehung: w + Math.PI / 2 });
  }
  // Mitte
  ctx.fillStyle = st.kacheln[0];
  kreis(ctx, m, m, 150);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = st.linie;
  ctx.stroke();
  itemZeichnen(ctx, folge[0], m, m, 230 * g, { farben: st.farben, linie: st.linie });
}

function raster(ctx, p, st, rnd, g) {
  const n = p.items.length <= 4 ? 3 : 4;
  const rand = 60;
  const zelle = (1000 - 2 * rand) / n;
  const folge = gemischt(p.items, rnd);
  ctx.fillStyle = st.muster;
  rundRechteck(ctx, rand - 20, rand - 20, 1000 - 2 * rand + 40, 1000 - 2 * rand + 40, 30);
  ctx.fill();
  for (let zy = 0; zy < n; zy++) {
    for (let zx = 0; zx < n; zx++) {
      const x = rand + zx * zelle;
      const y = rand + zy * zelle;
      ctx.fillStyle = (zx + zy) % 2 ? st.kacheln[1] : st.kacheln[0];
      rundRechteck(ctx, x + 8, y + 8, zelle - 16, zelle - 16, 22);
      ctx.fill();
      const form = Math.floor(rnd() * 3);
      ctx.fillStyle = st.farben[[4, 2, 1][form]];
      ctx.globalAlpha = 0.55;
      if (form === 0) { kreis(ctx, x + zelle / 2, y + zelle / 2, zelle * 0.36); ctx.fill(); }
      else if (form === 1) { ctx.beginPath(); ctx.moveTo(x + zelle * 0.18, y + zelle * 0.82); ctx.lineTo(x + zelle * 0.82, y + zelle * 0.82); ctx.lineTo(x + zelle * 0.82, y + zelle * 0.18); ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(x + zelle * 0.15, y + zelle * 0.15, zelle * 0.6, 0, Math.PI / 2); ctx.lineTo(x + zelle * 0.15, y + zelle * 0.15); ctx.fill(); }
      ctx.globalAlpha = 1;
      const id = folge[(zy * n + zx) % folge.length];
      itemZeichnen(ctx, id, x + zelle / 2, y + zelle / 2, zelle * 0.66 * g, { farben: st.farben, linie: st.linie });
    }
  }
}

const ZEICHNER = { mosaik, rosette, raster };

/** Zeichnet die Collage auf ein (quadratisches) Canvas. */
export function zeichneCollage(canvas, p) {
  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  const st = STIMMUNGEN[p.regler.farbstimmung];
  const rnd = mulberry32(seedFuer(p));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = st.grund;
  ctx.fillRect(0, 0, S, S);
  ctx.scale(S / 1000, S / 1000);
  ZEICHNER[p.vorlage](ctx, p, st, rnd, p.regler.groesse / 100);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function beschreibung(p, itemName) {
  return `${VORLAGEN[p.vorlage].name} aus ${p.items.length} Fundstücken (${p.items.map(itemName).join(', ')}), Farbstimmung ${STIMMUNGEN[p.regler.farbstimmung].name}, Anordnung ${p.regler.anordnung}, Größe ${p.regler.groesse} Prozent.`;
}
