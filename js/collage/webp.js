// Verlustfreier WebP-Kodierer (VP8L) für Browser ohne eingebaute WebP-Ausgabe (z. B. Safari).
// Umfang bewusst klein: Transformation „subtract green“, Rückverweise für Wiederholungen
// (linkes Nachbarpixel / Pixel darüber), kanonische Präfixcodes. Spezifikation: RFC 9649.

class Bits {
  constructor(groesse = 1 << 16) { this.buf = new Uint8Array(groesse); this.pos = 0; this.acc = 0; this.n = 0; }
  sichere(extra) {
    if (this.pos + extra < this.buf.length) return;
    const neu = new Uint8Array(Math.max(this.buf.length * 2, this.pos + extra + 1024));
    neu.set(this.buf);
    this.buf = neu;
  }
  schreibe(wert, anzahl) {
    // LSB zuerst
    while (anzahl > 0) {
      const teil = Math.min(anzahl, 16);
      this.acc |= (wert & ((1 << teil) - 1)) << this.n;
      this.n += teil;
      wert >>>= teil;
      anzahl -= teil;
      while (this.n >= 8) {
        this.sichere(1);
        this.buf[this.pos++] = this.acc & 0xff;
        this.acc >>>= 8;
        this.n -= 8;
      }
    }
  }
  ende() {
    if (this.n > 0) { this.sichere(1); this.buf[this.pos++] = this.acc & 0xff; this.acc = 0; this.n = 0; }
    return this.buf.subarray(0, this.pos);
  }
}

/** Huffman-Längen (begrenzt auf maxLaenge) aus Häufigkeiten. */
function codeLaengen(haeufigkeit, maxLaenge) {
  const n = haeufigkeit.length;
  let h = Array.from(haeufigkeit);
  for (;;) {
    const knoten = [];
    for (let i = 0; i < n; i++) if (h[i] > 0) knoten.push({ w: h[i], s: i, l: null, r: null });
    const laengen = new Array(n).fill(0);
    if (knoten.length === 0) return laengen;
    if (knoten.length === 1) { laengen[knoten[0].s] = 1; return laengen; }
    knoten.sort((a, b) => a.w - b.w || a.s - b.s);
    // zwei Warteschlangen (klassische lineare Huffman-Konstruktion)
    const q1 = knoten;
    const q2 = [];
    let i1 = 0;
    let i2 = 0;
    const nimm = () => {
      if (i1 < q1.length && (i2 >= q2.length || q1[i1].w <= q2[i2].w)) return q1[i1++];
      return q2[i2++];
    };
    while ((q1.length - i1) + (q2.length - i2) > 1) {
      const a = nimm();
      const b = nimm();
      q2.push({ w: a.w + b.w, s: -1, l: a, r: b });
    }
    const wurzel = q2[q2.length - 1];
    let maxL = 0;
    const stapel = [[wurzel, 0]];
    while (stapel.length) {
      const [k, t] = stapel.pop();
      if (k.s >= 0) { laengen[k.s] = t; maxL = Math.max(maxL, t); }
      else { stapel.push([k.l, t + 1]); stapel.push([k.r, t + 1]); }
    }
    if (maxL <= maxLaenge) return laengen;
    h = h.map((w) => (w > 0 ? Math.max(1, w >> 1) : 0)); // flacher machen und erneut bauen
  }
}

/** Kanonische Codes (MSB-zuerst) aus Längen; zurückgegeben bereits bitgespiegelt für LSB-Schreiber. */
function kanonisch(laengen) {
  const maxL = Math.max(0, ...laengen);
  const anzahl = new Array(maxL + 1).fill(0);
  laengen.forEach((l) => { if (l) anzahl[l]++; });
  const naechster = new Array(maxL + 2).fill(0);
  let code = 0;
  for (let l = 1; l <= maxL; l++) { code = (code + anzahl[l - 1]) << 1; naechster[l] = code; }
  return laengen.map((l) => {
    if (!l) return 0;
    let c = naechster[l]++;
    let r = 0;
    for (let i = 0; i < l; i++) { r = (r << 1) | (c & 1); c >>= 1; }
    return r;
  });
}

const CL_REIHENFOLGE = [17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

class Praefixcode {
  constructor(haeufigkeit) {
    this.groesse = haeufigkeit.length;
    this.benutzt = [];
    haeufigkeit.forEach((w, s) => { if (w > 0) this.benutzt.push(s); });
    this.einfach = this.benutzt.length <= 2 && this.benutzt.every((s) => s < 256);
    if (this.benutzt.length === 0) { this.benutzt = [0]; }
    if (this.einfach) {
      this.laengen = new Array(this.groesse).fill(0);
      if (this.benutzt.length === 2) { this.laengen[this.benutzt[0]] = 1; this.laengen[this.benutzt[1]] = 1; }
      this.codes = this.benutzt.length === 2 ? kanonisch(this.laengen) : new Array(this.groesse).fill(0);
      if (this.benutzt.length === 1) this.laengen = new Array(this.groesse).fill(0); // 0 Bit je Symbol
    } else {
      this.laengen = codeLaengen(haeufigkeit, 15);
      this.codes = kanonisch(this.laengen);
    }
  }
  schreibeKopf(bw) {
    if (this.einfach) {
      bw.schreibe(1, 1);
      bw.schreibe(this.benutzt.length - 1, 1);
      const s0 = this.benutzt[0];
      if (s0 < 2) { bw.schreibe(0, 1); bw.schreibe(s0, 1); } else { bw.schreibe(1, 1); bw.schreibe(s0, 8); }
      if (this.benutzt.length === 2) bw.schreibe(this.benutzt[1], 8);
      return;
    }
    bw.schreibe(0, 1);
    // Längen lauflängenkodieren (17/18 für Nullen)
    const folge = [];
    const L = this.laengen;
    for (let i = 0; i < L.length;) {
      if (L[i] === 0) {
        let j = i;
        while (j < L.length && L[j] === 0) j++;
        let lauf = j - i;
        while (lauf > 0) {
          if (lauf >= 11) { const k = Math.min(lauf, 138); folge.push([18, k - 11, 7]); lauf -= k; }
          else if (lauf >= 3) { folge.push([17, lauf - 3, 3]); lauf = 0; }
          else { for (let t = 0; t < lauf; t++) folge.push([0, 0, 0]); lauf = 0; }
        }
        i = j;
      } else { folge.push([L[i], 0, 0]); i++; }
    }
    const hf = new Array(19).fill(0);
    folge.forEach(([s]) => hf[s]++);
    if (hf.filter((x) => x > 0).length < 2) hf[hf[0] > 0 ? 1 : 0] += 1; // mindestens zwei Symbole
    const cll = codeLaengen(hf, 7);
    const clc = kanonisch(cll);
    let anzahl = 19;
    while (anzahl > 4 && cll[CL_REIHENFOLGE[anzahl - 1]] === 0) anzahl--;
    bw.schreibe(anzahl - 4, 4);
    for (let i = 0; i < anzahl; i++) bw.schreibe(cll[CL_REIHENFOLGE[i]], 3);
    bw.schreibe(0, 1); // max_symbol = Alphabetgröße
    for (const [s, extra, nb] of folge) {
      bw.schreibe(clc[s], cll[s]);
      if (nb) bw.schreibe(extra, nb);
    }
  }
  schreibe(bw, s) { if (this.laengen[s]) bw.schreibe(this.codes[s], this.laengen[s]); }
}

function praefix(wert) {
  // wert >= 1 -> [code, extraBits, extraWert]
  const d = wert - 1;
  if (d < 4) return [d, 0, 0];
  const hb = 31 - Math.clz32(d);
  const zweites = (d >> (hb - 1)) & 1;
  const extra = hb - 1;
  return [2 * hb + zweites, extra, d & ((1 << extra) - 1)];
}

/** RGBA-Pixel (Uint8ClampedArray) -> WebP-Datei (Uint8Array, verlustfrei). */
export function webpKodieren(rgba, breite, hoehe) {
  const n = breite * hoehe;
  const argb = new Uint32Array(n);
  let alpha = false;
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const r = rgba[j];
    const g = rgba[j + 1];
    const b = rgba[j + 2];
    const a = rgba[j + 3];
    if (a !== 255) alpha = true;
    // subtract green
    argb[i] = ((a << 24) | (((r - g) & 0xff) << 16) | (g << 8) | ((b - g) & 0xff)) >>> 0;
  }
  // Symbolfolge mit einfachen Rückverweisen (Abstand 1 = links, Abstand = Breite = oben)
  const symbole = []; // [art, ...] art 0 = Pixel(i), art 1 = Kopie(laenge, distCode)
  for (let i = 0; i < n;) {
    let lLinks = 0;
    if (i > 0) while (lLinks < 4096 && i + lLinks < n && argb[i + lLinks] === argb[i + lLinks - 1]) lLinks++;
    let lOben = 0;
    if (i >= breite) while (lOben < 4096 && i + lOben < n && argb[i + lOben] === argb[i + lOben - breite]) lOben++;
    if (Math.max(lLinks, lOben) >= 3) {
      if (lOben > lLinks) { symbole.push(1, lOben, 1); i += lOben; } else { symbole.push(1, lLinks, 2); i += lLinks; }
    } else { symbole.push(0, i, 0); i++; }
  }
  const hGruen = new Array(256 + 24).fill(0);
  const hRot = new Array(256).fill(0);
  const hBlau = new Array(256).fill(0);
  const hAlpha = new Array(256).fill(0);
  const hDist = new Array(40).fill(0);
  for (let k = 0; k < symbole.length; k += 3) {
    if (symbole[k] === 0) {
      const p = argb[symbole[k + 1]];
      hGruen[(p >>> 8) & 0xff]++; hRot[(p >>> 16) & 0xff]++; hBlau[p & 0xff]++; hAlpha[p >>> 24]++;
    } else {
      hGruen[256 + praefix(symbole[k + 1])[0]]++;
      hDist[praefix(symbole[k + 2])[0]]++;
    }
  }
  const codes = [hGruen, hRot, hBlau, hAlpha, hDist].map((h) => new Praefixcode(h));

  const bw = new Bits(n);
  bw.schreibe(0x2f, 8);
  bw.schreibe(breite - 1, 14);
  bw.schreibe(hoehe - 1, 14);
  bw.schreibe(alpha ? 1 : 0, 1);
  bw.schreibe(0, 3);
  bw.schreibe(1, 1); // Transformation vorhanden
  bw.schreibe(2, 2); // SUBTRACT_GREEN
  bw.schreibe(0, 1); // keine weitere Transformation
  bw.schreibe(0, 1); // kein Farbcache
  bw.schreibe(0, 1); // keine Meta-Präfixcodes
  codes.forEach((c) => c.schreibeKopf(bw));
  const [cG, cR, cB, cA, cD] = codes;
  for (let k = 0; k < symbole.length; k += 3) {
    if (symbole[k] === 0) {
      const p = argb[symbole[k + 1]];
      cG.schreibe(bw, (p >>> 8) & 0xff);
      cR.schreibe(bw, (p >>> 16) & 0xff);
      cB.schreibe(bw, p & 0xff);
      cA.schreibe(bw, p >>> 24);
    } else {
      const [lc, lx, lv] = praefix(symbole[k + 1]);
      cG.schreibe(bw, 256 + lc);
      if (lx) bw.schreibe(lv, lx);
      const [dc, dx, dv] = praefix(symbole[k + 2]);
      cD.schreibe(bw, dc);
      if (dx) bw.schreibe(dv, dx);
    }
  }
  const daten = bw.ende();
  const chunk = daten.length;
  const auffuellen = chunk & 1;
  const gesamt = 4 + 8 + chunk + auffuellen;
  const out = new Uint8Array(8 + gesamt);
  const dv = new DataView(out.buffer);
  const ascii = (s, o) => { for (let i = 0; i < 4; i++) out[o + i] = s.charCodeAt(i); };
  ascii('RIFF', 0); dv.setUint32(4, gesamt, true); ascii('WEBP', 8); ascii('VP8L', 12); dv.setUint32(16, chunk, true);
  out.set(daten, 20);
  return out;
}

/** WebP-Blob erzeugen: zuerst eingebaut (Chrome, Firefox), sonst eigener Kodierer (Safari). */
export async function webpBlob(canvas, { erzwingeEigen = false } = {}) {
  if (!erzwingeEigen) {
    const nativ = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', 0.9));
    if (nativ && nativ.type === 'image/webp') return { blob: nativ, kodierung: 'Browser (verlustbehaftet, Qualität 0,9)' };
  }
  const ctx = canvas.getContext('2d');
  const bild = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bytes = webpKodieren(bild.data, canvas.width, canvas.height);
  return { blob: new Blob([bytes], { type: 'image/webp' }), kodierung: 'eigener Kodierer (verlustfrei, VP8L)' };
}
