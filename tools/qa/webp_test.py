#!/usr/bin/env python3
"""Prüft den eigenen WebP-Kodierer (VP8L): Kodieren im Browser, Dekodieren mit libwebp (Pillow),
Vergleich Pixel für Pixel mit dem Original. Aufruf: python3 tools/qa/webp_test.py <basis-url> <ausgabeordner>"""
import base64, io, json, sys, pathlib
from PIL import Image
from playwright.sync_api import sync_playwright

basis = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/'
aus = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '_qa')
aus.mkdir(parents=True, exist_ok=True)
JS = """async ({vorlage, stimmung, groesse}) => {
  const { webpKodieren } = await import('./js/collage/webp.js');
  const { zeichneCollage } = await import('./js/collage/generator.js');
  const c = document.createElement('canvas'); c.width = groesse; c.height = groesse;
  zeichneCollage(c, { items: ['meissen-tasse','meissen-teller','freiberg-lampe','freiberg-erz','leipzig-saeule','leipzig-kerze'], vorlage, regler: { anordnung: 3, groesse: 100, farbstimmung: stimmung } });
  const ctx = c.getContext('2d');
  // zusätzlich: halbtransparente Fläche, damit auch der Alphakanal geprüft wird
  if (vorlage === 'raster') { ctx.fillStyle = 'rgba(255,0,0,0.4)'; ctx.clearRect(0, 0, 40, 40); ctx.fillRect(10, 10, 30, 30); }
  const bild = ctx.getImageData(0, 0, groesse, groesse);
  const t0 = performance.now();
  const bytes = webpKodieren(bild.data, groesse, groesse);
  const ms = performance.now() - t0;
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  return { webp: b64(bytes), roh: b64(new Uint8Array(bild.data.buffer)), ms };
}"""
ergebnisse = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    seite = b.new_page()
    seite.goto(basis + 'index.html#/ueber')
    seite.wait_for_timeout(500)
    for vorlage, stimmung, groesse in [('rosette', 'porzellan', 512), ('mosaik', 'kerzenschein', 512), ('raster', 'silber', 300), ('rosette', 'sachsenbunt', 97)]:
        r = seite.evaluate(JS, {'vorlage': vorlage, 'stimmung': stimmung, 'groesse': groesse})
        daten = base64.b64decode(r['webp'])
        roh = base64.b64decode(r['roh'])
        datei = aus / f'webp-test-{vorlage}-{stimmung}-{groesse}.webp'
        datei.write_bytes(daten)
        bild = Image.open(io.BytesIO(daten)).convert('RGBA')
        original = Image.frombytes('RGBA', (groesse, groesse), roh)
        gleich = bild.size == original.size and bild.tobytes() == original.tobytes()
        ergebnisse.append({'vorlage': vorlage, 'stimmung': stimmung, 'groesse': groesse, 'bytes': len(daten),
                           'roh_bytes': len(roh), 'kodierzeit_ms': round(r['ms'], 1), 'pixelgleich': gleich, 'format': Image.open(io.BytesIO(daten)).format})
    b.close()
print(json.dumps(ergebnisse, indent=1, ensure_ascii=False))
(aus / 'webp-test.json').write_text(json.dumps(ergebnisse, indent=1, ensure_ascii=False), encoding='utf-8')
sys.exit(0 if all(e['pixelgleich'] for e in ergebnisse) else 1)
