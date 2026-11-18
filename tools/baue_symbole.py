#!/usr/bin/env python3
"""Rendert App-Symbole (PNG) aus der eigenen SVG-Grafik der Erzählfigur – mit Chrome (Playwright).
Aufruf: python3 tools/baue_symbole.py"""
import pathlib
from playwright.sync_api import sync_playwright

WURZEL = pathlib.Path(__file__).resolve().parents[1]
L = "#1C2541"
KOPF = f'''<g>
  <path d="M14 56c0-13 8-20 18-20s18 7 18 20Z" fill="#3E9C7E" stroke="{L}" stroke-width="2.4"/>
  <path d="M20 42c4 3 20 3 24 0l1 4c-6 3-20 3-26 0Z" fill="#fff" stroke="{L}" stroke-width="1.6"/>
  <circle cx="31" cy="28" r="14" fill="#8D97AB" stroke="{L}" stroke-width="2.4"/>
  <circle cx="34.5" cy="26" r="5" fill="#F28C28" stroke="{L}" stroke-width="2"/>
  <circle cx="35.3" cy="26" r="2.4" fill="{L}"/><circle cx="36.4" cy="24.6" r=".9" fill="#fff"/>
  <path d="M44 30l10 2.4-9.4 3.4Z" fill="#59627A" stroke="{L}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M42.5 29c1.6-1.6 3.4-1.6 4.6 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</g>'''

def svg(rund=True, abstand=0.0):
    s = 64 * (1 - abstand)
    o = 64 * abstand / 2
    grund = '<rect width="64" height="64" rx="14" fill="#2350A8"/>' if rund else '<rect width="64" height="64" fill="#2350A8"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{grund}<g transform="translate({o} {o}) scale({s/64})">{KOPF}</g></svg>'

def main():
    (WURZEL / "img" / "favicon.svg").write_text(svg(True, 0.04), encoding="utf-8")
    ziele = [("icon-192.png", 192, False, 0.08), ("icon-512.png", 512, False, 0.08),
             ("icon-maskable-512.png", 512, False, 0.30), ("apple-touch-icon.png", 180, False, 0.10)]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
        for name, groesse, rund, abstand in ziele:
            seite = b.new_page(viewport={"width": groesse, "height": groesse})
            seite.set_content(f'<html><body style="margin:0">{svg(rund, abstand).replace("<svg ", f"<svg width=\"{groesse}\" height=\"{groesse}\" ")}</body></html>')
            seite.screenshot(path=str(WURZEL / "img" / name), clip={"x": 0, "y": 0, "width": groesse, "height": groesse})
            seite.close()
        b.close()
    print("Symbole erzeugt.")

if __name__ == "__main__":
    main()
