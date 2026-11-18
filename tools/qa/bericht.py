#!/usr/bin/env python3
"""Schreibt die Prüfberichte aus _qa/ergebnisse.json (axe, Tastatur, Offline, Collage, Kontraste, Zielgrößen)
und erzeugt Übersichtsbilder der Bildschirmfotos. Aufruf: python3 tools/qa/bericht.py"""
import json
import pathlib
from PIL import Image, ImageDraw

WURZEL = pathlib.Path(__file__).resolve().parents[2]
QA = WURZEL / "_qa"
E = json.loads((QA / "ergebnisse.json").read_text(encoding="utf-8"))
GROESSEN = {"ipad-quer": "iPad quer 1024 × 768", "ipad-hoch": "iPad hoch 768 × 1024", "smartphone": "Smartphone 390 × 844"}


def axe_bericht():
    z = [f"# axe-Bericht – klasseSachsen Demonstrator", "",
         f"- Prüfwerkzeug: axe-core {E.get('axe_version')} (Regeln mit den Tags wcag2a, wcag2aa, wcag21a, wcag21aa)",
         f"- Browser: Google Chrome (Playwright), Stand: {E.get('zeit')}",
         "- Geprüft: jeder Bildschirm in drei Größen, zusätzlich Kontrastmodus, einfache Sprache und sehr große Schrift", ""]
    gesamt_bs = 0
    gesamt_v = 0
    for g, name in GROESSEN.items():
        liste = E["bildschirme"].get(g, [])
        v = sum(len(x["verstoesse"]) for x in liste)
        gesamt_bs += len(liste)
        gesamt_v += v
    z += [f"## Ergebnis: {gesamt_v} Verstöße der Stufen A/AA auf {gesamt_bs} geprüften Bildschirmen", ""]
    for g, name in GROESSEN.items():
        liste = E["bildschirme"].get(g, [])
        z += [f"### {name}", "", "| Bildschirm | Verstöße | Bildschirmfoto |", "|---|---|---|"]
        for x in liste:
            z.append(f"| {x['bildschirm']} | {len(x['verstoesse'])} | `{x['datei']}` |")
        z.append("")
        for x in liste:
            for v in x["verstoesse"]:
                z.append(f"- **{x['bildschirm']}** – `{v['id']}` ({v['impact']}): {v['help']}")
                for n in v["nodes"][:5]:
                    z.append(f"  - `{n['target']}`: {n['summary'].splitlines()[0] if n['summary'] else ''}")
        fehler = E["bildschirme"].get(g + "-fehler", [])
        z.append(f"JavaScript-Fehler in der Konsole: {len(fehler)}" + ("" if not fehler else " – " + "; ".join(fehler[:5])))
        z.append("")
    (QA / "axe-bericht.md").write_text("\n".join(z), encoding="utf-8")
    return gesamt_bs, gesamt_v


def kontraste():
    z = ["# Kontraste (Stichprobe nach WCAG-Formel)", "",
         "Gemessen: relative Leuchtdichte nach WCAG 2.1; Anforderung Text ≥ 4,5 : 1, große Schrift und Bedienelemente/Grafik ≥ 3 : 1.", "",
         "| Paar | Vordergrund | Hintergrund | Verhältnis | erfüllt |", "|---|---|---|---|---|"]
    for k in E["kontraste"]:
        grenze = 3.0 if "≥ 3 : 1" in k["paar"] else 4.5
        z.append(f"| {k['paar']} | `{k['vorne']}` | `{k['hinten']}` | {k['verhaeltnis']:.2f} : 1 | {'ja' if k['verhaeltnis'] >= grenze else 'NEIN'} |")
    (QA / "kontraste.md").write_text("\n".join(z) + "\n", encoding="utf-8")
    return all(k["verhaeltnis"] >= (3.0 if "≥ 3 : 1" in k["paar"] else 4.5) for k in E["kontraste"])


def uebersichten():
    for g in GROESSEN:
        ordner = QA / "screenshots" / g
        bilder = sorted(ordner.glob("*.png"))
        if not bilder:
            continue
        breite = 260
        spalten = 6
        kacheln = []
        for b in bilder:
            im = Image.open(b).convert("RGB")
            h = int(im.height * breite / im.width)
            im = im.resize((breite, min(h, 520)) if h <= 520 else (breite, h)).crop((0, 0, breite, min(h, 520)))
            kacheln.append((b.stem, im))
        zeilen = (len(kacheln) + spalten - 1) // spalten
        blatt = Image.new("RGB", (spalten * (breite + 16) + 16, zeilen * (520 + 40) + 16), "#FFFFFF")
        d = ImageDraw.Draw(blatt)
        for i, (name, im) in enumerate(kacheln):
            x = 16 + (i % spalten) * (breite + 16)
            y = 16 + (i // spalten) * (520 + 40)
            blatt.paste(im, (x, y + 22))
            d.text((x, y + 4), name[:38], fill="#1C2541")
        blatt.save(QA / f"uebersicht-{g}.png")


def webp_zeile():
    datei = QA / "webp-test.json"
    if not datei.exists():
        return "| WebP-Kodierer (Safari-Rückfall) gegen libwebp | nicht ausgeführt |"
    w = json.loads(datei.read_text(encoding="utf-8"))
    ok = sum(1 for e in w if e["pixelgleich"])
    return f"| Eigener WebP-Kodierer (Safari-Rückfall), dekodiert mit libwebp | **{ok} von {len(w)} Testbildern pixelgleich** – `webp-test.json` |"


def qa_bericht(bs, v, kontrast_ok):
    t = E.get("tastatur", {})
    o = E.get("offline", {})
    c = E.get("collage", {})
    x = E.get("extras", {})
    ziele = E.get("zielgroessen", {})
    zu_klein = {k: [e for e in l if not e["inline"]] for k, l in ziele.items()}
    zu_klein = {k: l for k, l in zu_klein.items() if l}
    inline = sum(len([e for e in l if e["inline"]]) for l in ziele.values())
    z = ["# Prüfbericht – klasseSachsen Demonstrator", "", f"Stand: {E.get('zeit')}", "",
         "| Prüfung | Ergebnis |", "|---|---|",
         f"| axe-core {E.get('axe_version')}, WCAG 2.0/2.1 A und AA | **{v} Verstöße** auf {bs} Bildschirmen (3 Größen) – Details: `axe-bericht.md` |",
         f"| Komplette Quest nur per Tastatur (Meißen, 2 Minigames) | **{'bestanden' if t.get('ok') else 'NICHT bestanden'}** – {t.get('tabs', 0)} Tab-Schritte, keine Maus |",
         f"| Offline: laden, Server aus + Netz aus, neu laden, weiterspielen | **{'bestanden' if o.get('ok') else 'NICHT bestanden'}** |",
         f"| Item-Collage: PNG 2048 × 2048, WebP, JSON, Neuerzeugung | **{'bestanden' if c.get('ok') else 'NICHT bestanden'}** |",
         f"| Kontraste (Stichprobe, {len(E.get('kontraste', []))} Farbpaare) | **{'alle erfüllt' if kontrast_ok else 'nicht alle erfüllt'}** – `kontraste.md` |",
         f"| Zielgrößen ≥ 44 × 44 px (Bedienelemente, iPad quer) | **{'alle erfüllt' if not zu_klein else str(sum(len(l) for l in zu_klein.values())) + ' zu klein'}** (ausgenommen {inline} Links im Fließtext) |",
         webp_zeile(),
         f"| Umbruch bei 320 px Breite (WCAG 1.4.10) | **{sum(1 for u in x.get('umbruch', []) if u['ok'])} von {len(x.get('umbruch', []))} Seiten ohne waagerechtes Scrollen** |",
         "", "## Tastatur-Test", ""]
    z += [f"- {p}" for p in t.get("protokoll", [])]
    z += ["", f"Gesammelte Fundstücke danach: {', '.join(t.get('items', []))}", "", "Bildschirmfotos: `tastatur/`", "", "## Offline-Test", ""]
    z += [f"- {p}" for p in o.get("protokoll", [])]
    z += ["", "Bildschirmfotos: `offline/`", "", "## Item-Collage", ""]
    z += [f"- {p}" for p in c.get("protokoll", [])]
    if c.get("meta"):
        z += ["", "Beispiel der JSON-Metadaten:", "", "```json", json.dumps(c["meta"], ensure_ascii=False, indent=2), "```"]
    z += ["", "Dateien: `collage/`", "", "## Gruppenbericht und Umbruch", ""]
    z += [f"- {p}" for p in x.get("protokoll", [])]
    z += ["- Datei: `gruppenbericht.pdf`, Druckansicht: `gruppenbericht-druckansicht.png`", "", "| Seite (320 px) | Inhaltsbreite | Fensterbreite | ohne waagerechtes Scrollen |", "|---|---|---|---|"]
    z += [f"| `{u['seite']}` | {u['breite']} | {u['fenster']} | {'ja' if u['ok'] else 'nein'} |" for u in x.get("umbruch", [])]
    wk_datei = QA / "ergebnisse-webkit.json"
    if wk_datei.exists():
        wk = json.loads(wk_datei.read_text(encoding="utf-8"))
        anzahl = sum(len(v) for v in wk.get("axe", {}).values())
        z += ["", f"## Gegenprobe mit der WebKit-Engine ({wk.get('engine')})", "",
              f"axe-core auf {len(wk.get('axe', {}))} Kernbildschirmen: {anzahl} Verstöße. Skriptfehler: {len(wk.get('fehler', []))}.", ""]
        z += [f"- {p}" for p in wk.get("protokoll", [])]
        z += ["", "Bildschirmfotos: `webkit/`. Hinweis: Playwright-WebKit entspricht der Safari-Engine, ersetzt aber keinen Test auf einem echten iPad."]
    z += ["", "## Zielgrößen", ""]
    if zu_klein:
        for k, l in zu_klein.items():
            z.append(f"- {k}: " + "; ".join(f"{e['el']} „{e['name']}“ {e['w']}×{e['h']}" for e in l[:8]))
    else:
        z.append("Alle Bedienelemente sind mindestens 44 × 44 px groß (Links im Fließtext sind nach WCAG ausgenommen).")
    z += ["", "## Bildschirmfotos", "", "Ordner `screenshots/<größe>/`, Übersichten `uebersicht-ipad-quer.png`, `uebersicht-ipad-hoch.png`, `uebersicht-smartphone.png`."]
    (QA / "qa-bericht.md").write_text("\n".join(z) + "\n", encoding="utf-8")


bs, v = axe_bericht()
k = kontraste()
uebersichten()
qa_bericht(bs, v, k)
print(f"Bildschirme: {bs}, axe-Verstöße: {v}, Kontraste ok: {k}")
