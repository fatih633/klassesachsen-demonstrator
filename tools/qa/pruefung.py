#!/usr/bin/env python3
"""Qualitätsprüfung des Demonstrators (Playwright + Chrome + axe-core).

Aufruf im Projektordner:
  python3 tools/qa/pruefung.py --axe <pfad/zu/axe.min.js> [--chrome /usr/bin/google-chrome]

Prüft:
  1. alle Bildschirme in drei Größen (iPad quer, iPad hoch, Smartphone): Bildschirmfoto + axe (WCAG 2.0/2.1 A/AA)
  2. komplette Quest (Meißen, zwei Minigames) nur per Tastatur
  3. Offline: erst laden, dann Server beenden und Netz aus, neu laden, weiterspielen, Audio aus dem Cache
  4. Item-Collage: PNG 2048 × 2048, WebP, JSON; Neuerzeugung aus JSON mit identischer Prüfsumme
  5. Gruppenbericht als PDF (Druck-CSS), Umbruch bei 320 px, Zielgrößen, Kontraste
Ergebnisse: Ordner _qa/
"""
import argparse
import hashlib
import io
import json
import pathlib
import socket
import subprocess
import sys
import time

from PIL import Image
from playwright.sync_api import sync_playwright

WURZEL = pathlib.Path(__file__).resolve().parents[2]
QA = WURZEL / "_qa"
GROESSEN = {"ipad-quer": (1024, 768), "ipad-hoch": (768, 1024), "smartphone": (390, 844)}
AXE_OPTIONEN = {"runOnly": {"type": "tag", "values": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]}, "resultTypes": ["violations"]}
STATISCH = ".kopf{position:static!important}"

ap = argparse.ArgumentParser()
ap.add_argument("--axe", required=True)
ap.add_argument("--chrome", default="/usr/bin/google-chrome")
ap.add_argument("--nur", default=None, help="nur ein Teil: bildschirme, tastatur, offline, collage, extra")
ARGS = ap.parse_args()
AXE = pathlib.Path(ARGS.axe)
AXE_VERSION = json.loads((AXE.parent / "package.json").read_text())["version"] if (AXE.parent / "package.json").exists() else "?"


def freier_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def server_starten(port):
    proc = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=WURZEL,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.2):
                return proc
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("Server startet nicht")


def axe(seite):
    if not seite.evaluate("typeof window.axe !== 'undefined'"):
        seite.add_script_tag(path=str(AXE))
    return seite.evaluate("""async (o) => {
      const r = await axe.run(document, o);
      return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, tags: v.tags.filter(t => t.startsWith('wcag')),
        nodes: v.nodes.map(n => ({ target: n.target.join(' '), summary: n.failureSummary })) }));
    }""", AXE_OPTIONEN)


def zielgroessen(seite):
    return seite.evaluate("""() => {
      const aus = [];
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        if (!r.width || !r.height || st.visibility === 'hidden' || el.closest('[hidden]')) continue;
        if (el.matches('input[type=checkbox], input[type=radio]') && el.closest('label')) {
          const l = el.closest('label').getBoundingClientRect();
          if (l.width >= 44 && l.height >= 44) continue;
        }
        if (el.matches('.wahlkachel input')) continue;
        const inline = el.tagName === 'A' && el.closest('p, li, td, .fuss__hinweis') && !el.classList.contains('knopf') && getComputedStyle(el).display === 'inline';
        if (r.width < 44 - 0.5 || r.height < 44 - 0.5) aus.push({ el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : ''), name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 50), w: Math.round(r.width), h: Math.round(r.height), inline });
      }
      return aus;
    }""")


def schnapp(seite, pfad, ganz=True):
    seite.add_style_tag(content=STATISCH)
    seite.wait_for_timeout(120)
    seite.screenshot(path=str(pfad), full_page=ganz)


def warte(seite, ms=450):
    seite.wait_for_timeout(ms)


# ---------------------------------------------------------------------------
# 1. Bildschirme in drei Größen + axe
# ---------------------------------------------------------------------------
def bildschirme(pw, basis):
    ergebnisse = {}
    ziele = {}
    for name, (b, h) in GROESSEN.items():
        ordner = QA / "screenshots" / name
        ordner.mkdir(parents=True, exist_ok=True)
        browser = pw.chromium.launch(executable_path=ARGS.chrome)
        ctx = browser.new_context(viewport={"width": b, "height": h}, locale="de-DE", accept_downloads=True,
                                  has_touch=name != "ipad-quer", is_mobile=name == "smartphone")
        s = ctx.new_page()
        fehler = []
        s.on("pageerror", lambda e: fehler.append(str(e)))
        s.on("console", lambda m: fehler.append(m.text) if m.type == "error" else None)
        app = basis + "index.html#"
        nr = [0]
        ergebnisse[name] = []

        def bildschirm(titel, ganz=True):
            nr[0] += 1
            datei = ordner / f"{nr[0]:02d}-{titel}.png"
            warte(s, 350)
            v = axe(s)
            schnapp(s, datei, ganz)
            ergebnisse[name].append({"bildschirm": f"{nr[0]:02d}-{titel}", "datei": str(datei.relative_to(QA)), "verstoesse": v})
            if name == "ipad-quer":
                ziele[f"{nr[0]:02d}-{titel}"] = zielgroessen(s)

        s.goto(app + "/lehrkraefte/material"); warte(s)
        s.get_by_role("button", name="Drei Beispielgruppen anlegen").click()
        s.goto(app + "/"); warte(s)
        bildschirm("start")
        s.click("#knopf-einstellungen"); warte(s, 300)
        bildschirm("einstellungen", ganz=False)
        s.keyboard.press("Escape"); warte(s, 200)
        s.goto(app + "/gruppe"); bildschirm("gruppe-waehlen")
        s.get_by_role("button", name="Frei spielen").click(); warte(s)
        s.evaluate("localStorage.setItem('ks.kartenmodus', JSON.stringify('karte'))")
        s.goto(app + "/karte"); s.reload(); warte(s)
        bildschirm("karte")
        s.get_by_role("button", name="Liste", exact=True).click()
        bildschirm("karte-liste")
        for ort in ["meissen", "freiberg", "leipzig"]:
            s.goto(app + f"/ort/{ort}"); bildschirm(f"ort-{ort}")
        s.goto(app + "/spiel/meissen-spurensuche"); bildschirm("spiel-einstieg-rollen")
        s.get_by_role("button", name="Wir sind bereit").click(); warte(s)
        s.get_by_role("button", name="Katze", exact=True).click()
        s.get_by_role("button", name="Tipp 1").click()
        bildschirm("spurensuche-tipp")
        s.get_by_role("button", name="Großer Ofen aus Ziegeln").click()
        bildschirm("spurensuche-gefunden")
        s.get_by_role("button", name="Liste", exact=True).click()
        bildschirm("spurensuche-listenansicht")
        s.get_by_role("button", name="Bild", exact=True).click()
        s.goto(app + "/spiel/meissen-zuordnen")
        s.get_by_role("button", name="Wir sind bereit").click(); warte(s)
        s.get_by_role("button", name="Kaolin", exact=True).click()
        bildschirm("zuordnen")
        s.goto(app + "/spiel/leipzig-zeitstrahl")
        s.get_by_role("button", name="Wir sind bereit").click(); warte(s)
        s.get_by_role("button", name="„Demonstration auf dem Ring“ nach unten").click()
        bildschirm("zeitstrahl")
        s.goto(app + "/spiel/freiberg-schaetzfrage")
        s.get_by_role("button", name="Wir sind bereit").click(); warte(s)
        bildschirm("schaetzfrage-beraten")
        for _ in range(5):
            s.get_by_role("button", name="100 Jahre mehr").click()
        s.get_by_role("button", name="Gemeinsame Schätzung abgeben").click(); warte(s, 200)
        bildschirm("schaetzfrage-einig")
        s.get_by_role("button", name="Ja, wir sind uns einig").click()
        bildschirm("schaetzfrage-aufloesung")
        s.get_by_role("button", name="Weiter", exact=True).click(); warte(s, 900)
        bildschirm("belohnung")
        s.goto(app + "/album"); bildschirm("album")
        s.goto(app + "/lehrkraefte/material"); warte(s)
        s.get_by_role("button", name="Alle Fundstücke im aktuellen Spielprofil freischalten").click()
        s.goto(app + "/collage"); warte(s, 700)
        bildschirm("collage")
        s.get_by_role("button", name="Zur Freigabe an die Lehrkraft geben").click(); warte(s)
        bildschirm("collage-freigabe")
        s.goto(app + "/startklar")
        try:
            s.wait_for_selector('#startklar-status[data-status="gruen"]', timeout=60000)
        except Exception:
            s.get_by_role("button", name="Erneut prüfen").click(); warte(s, 1500)
        bildschirm("startklar")
        s.goto(app + "/beweis/meissen/WEISSES-GOLD"); bildschirm("ortsbeweis")
        s.goto(app + "/lehrkraefte/gruppen"); bildschirm("lehrkraefte-gruppen")
        s.goto(app + "/lehrkraefte/uebersicht"); bildschirm("lehrkraefte-uebersicht")
        gid = s.evaluate("JSON.parse(localStorage.getItem('ks.gruppen'))[0].id")
        s.goto(app + f"/lehrkraefte/gruppe/{gid}"); warte(s)
        s.get_by_role("button", name="Hinweise übernehmen").click(); warte(s)
        bildschirm("lehrkraefte-gruppenansicht")
        s.goto(app + "/lehrkraefte/bildbeitraege"); bildschirm("lehrkraefte-bildbeitraege")
        s.goto(app + "/lehrkraefte/material"); bildschirm("lehrkraefte-material")
        s.goto(app + "/material/qr"); warte(s); bildschirm("qr-codes")
        s.goto(app + "/ueber"); bildschirm("ueber-lizenzen")
        for seite in ["barrierefreiheit", "datenschutz", "impressum"]:
            s.goto(basis + f"{seite}.html"); warte(s)
            if seite == "datenschutz":
                s.get_by_role("button", name="Gespeicherte Daten anzeigen").click()
            bildschirm(seite)
        # Varianten: Kontrast, einfache Sprache, sehr große Schrift
        def einstellen(**kw):
            s.goto(app + "/")
            s.evaluate("(kw) => { const e = JSON.parse(localStorage.getItem('ks.einstellungen') || '{}'); localStorage.setItem('ks.einstellungen', JSON.stringify({ ...e, ...kw })); }", kw)
        einstellen(kontrast=True)
        s.goto(app + "/"); s.reload(); warte(s); bildschirm("kontrast-start")
        s.goto(app + "/karte"); bildschirm("kontrast-karte")
        s.goto(app + "/spiel/leipzig-zeitstrahl"); s.get_by_role("button", name="Wir sind bereit").click(); bildschirm("kontrast-zeitstrahl")
        s.goto(app + f"/lehrkraefte/gruppe/{gid}"); bildschirm("kontrast-gruppenansicht")
        einstellen(kontrast=False, einfach=True)
        s.goto(app + "/ort/leipzig"); s.reload(); warte(s); bildschirm("einfache-sprache-ort")
        einstellen(einfach=False, schrift="sehr-gross")
        s.goto(app + "/spiel/meissen-zuordnen"); s.reload(); warte(s)
        s.get_by_role("button", name="Wir sind bereit").click(); bildschirm("schrift-sehr-gross-zuordnen")
        einstellen(schrift="normal")
        ergebnisse[name + "-fehler"] = fehler
        browser.close()
    return ergebnisse, ziele


# ---------------------------------------------------------------------------
# 2. Tastatur-Test
# ---------------------------------------------------------------------------
def tastatur(pw, basis):
    protokoll = []
    browser = pw.chromium.launch(executable_path=ARGS.chrome)
    ctx = browser.new_context(viewport={"width": 1024, "height": 768}, locale="de-DE", service_workers="block")
    s = ctx.new_page()
    ordner = QA / "tastatur"
    ordner.mkdir(parents=True, exist_ok=True)
    s.goto(basis + "index.html#/"); warte(s, 700)
    tabs_gesamt = [0]

    def aktiv():
        return s.evaluate("""() => { const e = document.activeElement; if (!e) return {}; const st = getComputedStyle(e);
          return { tag: e.tagName, name: (e.getAttribute('aria-label') || e.innerText || e.value || '').trim().replace(/\\s+/g, ' ').slice(0, 80),
            outline: st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) >= 2, schatten: st.boxShadow !== 'none' }; }""")

    def tab_bis(teil, max_tabs=120, rueck=False):
        for i in range(max_tabs):
            s.keyboard.press("Shift+Tab" if rueck else "Tab")
            tabs_gesamt[0] += 1
            a = aktiv()
            if teil.lower() in a.get("name", "").lower():
                protokoll.append(f"Tab ×{i + 1} → „{a['name']}“ ({a['tag']}, Fokusrahmen sichtbar: {'ja' if a['outline'] or a['schatten'] else 'NEIN'})")
                return a
        raise AssertionError(f"Nicht per Tab erreichbar: {teil}")

    def druecke(taste, beschreibung):
        s.keyboard.press(taste)
        warte(s, 350)
        protokoll.append(f"{taste}: {beschreibung}")

    tab_bis("Los geht"); druecke("Enter", "Spiel starten")
    tab_bis("Frei spielen"); druecke("Enter", "Freies Spiel wählen")
    tab_bis("Liste"); druecke("Enter", "Orte als Liste anzeigen")
    tab_bis("Nach Meißen"); druecke("Enter", "Meißen öffnen")
    tab_bis("Spielen"); druecke("Enter", "Spurensuche starten")
    tab_bis("Wir sind bereit"); druecke("Enter", "Los geht's")
    s.screenshot(path=str(ordner / "01-spurensuche-start.png"))
    # Spurensuche: drei Aufgaben (Ofen, Kaolin, Malerin) – nach dem Fund springt der Fokus auf „Nächste Aufgabe“
    for ziel in ["Großer Ofen", "Säcke mit weißer Erde", "Frau am Maltisch"]:
        tab_bis(ziel); druecke("Enter", f"„{ziel}“ auswählen")
        a = aktiv()
        protokoll.append(f"  Fokus danach: „{a['name']}“")
        druecke("Enter", "weiter")
    s.screenshot(path=str(ordner / "02-spurensuche-geschafft.png"))
    assert "Porzellantasse" in s.inner_text("main"), "Fundstück Porzellantasse fehlt"
    tab_bis("Nächstes Spiel an diesem Ort"); druecke("Enter", "zum Zuordnen-Spiel")
    tab_bis("Wir sind bereit"); druecke("Enter", "Los geht's")
    zuordnung = {"Gold": "Gehört nicht hinein", "Kaolin": "Gehört in die Porzellanmasse", "Mehl": "Gehört nicht hinein",
                 "Quarz": "Gehört in die Porzellanmasse", "Silber": "Gehört nicht hinein", "Feldspat": "Gehört in die Porzellanmasse"}
    for karte, korb in zuordnung.items():
        a = aktiv()
        if a.get("name", "").strip() != karte:
            # Fokus von der vorherigen Ablage aus zur Karte bewegen (vorwärts oder rückwärts)
            try:
                tab_bis(karte, max_tabs=12, rueck=True)
            except AssertionError:
                tab_bis(karte)
        druecke("Space", f"Karte „{karte}“ wählen")
        tab_bis("hierher legen: " + korb)
        druecke("Enter", f"in „{korb}“ legen")
    a = aktiv()
    protokoll.append(f"  Fokus nach letzter Karte: „{a['name']}“")
    if "Zuordnung prüfen" not in a.get("name", ""):
        tab_bis("Zuordnung prüfen")
    druecke("Enter", "Zuordnung prüfen (Protokoll)")
    a = aktiv()
    protokoll.append(f"  Fokus danach: „{a['name']}“")
    druecke("Enter", "Weiter")
    s.screenshot(path=str(ordner / "03-zuordnen-geschafft.png"))
    items = s.evaluate("JSON.parse(localStorage.getItem('ks.frei')).items")
    ok = "meissen-tasse" in items and "meissen-teller" in items
    tab_bis("Zur Karte")
    druecke("Enter", "zurück zur Karte")
    s.screenshot(path=str(ordner / "04-karte-nach-meissen.png"), full_page=True)
    browser.close()
    return {"ok": ok, "items": items, "tabs": tabs_gesamt[0], "protokoll": protokoll}


# ---------------------------------------------------------------------------
# 3. Offline-Test
# ---------------------------------------------------------------------------
def offline(pw, port):
    ordner = QA / "offline"
    ordner.mkdir(parents=True, exist_ok=True)
    basis = f"http://127.0.0.1:{port}/"
    proc = server_starten(port)
    protokoll = []
    browser = pw.chromium.launch(executable_path=ARGS.chrome)
    ctx = browser.new_context(viewport={"width": 1024, "height": 768}, locale="de-DE")
    s = ctx.new_page()
    s.goto(basis + "index.html#/"); warte(s, 800)
    s.evaluate("navigator.serviceWorker.ready.then(() => true)")
    s.reload(); warte(s, 800)
    kontrolliert = s.evaluate("!!navigator.serviceWorker.controller")
    protokoll.append(f"Service Worker kontrolliert die Seite: {kontrolliert}")
    s.goto(basis + "index.html#/startklar")
    s.wait_for_selector('#startklar-status[data-status="gruen"]', timeout=90000)
    protokoll.append("Startklar-Check online: grün")
    s.screenshot(path=str(ordner / "01-startklar-online.png"), full_page=True)
    proc.terminate(); proc.wait()
    ctx.set_offline(True)
    protokoll.append("Server beendet und Netz abgeschaltet")
    s.reload(); warte(s, 1000)
    protokoll.append(f"Neu geladen ohne Netz: Überschrift „{s.inner_text('h1')}“")
    s.wait_for_selector('#startklar-status[data-status="gruen"]', timeout=20000)
    s.screenshot(path=str(ordner / "02-startklar-offline.png"), full_page=True)
    s.goto(basis + "index.html#/spiel/leipzig-zeitstrahl"); warte(s, 700)
    s.get_by_role("button", name="Wir sind bereit").click(); warte(s)
    s.get_by_role("button", name="Tipp 1").click()
    s.get_by_role("button", name="Tipp 2").click()
    s.get_by_role("button", name="Lösung zeigen").click()
    s.get_by_role("button", name="Reihenfolge prüfen").click(); warte(s)
    s.get_by_role("button", name="Weiter", exact=True).click(); warte(s, 900)
    text = s.inner_text("main")
    gespielt = "Palmensäule" in text
    protokoll.append(f"Zeitstrahl offline gespielt, Fundstück Palmensäule erhalten: {gespielt}")
    s.screenshot(path=str(ordner / "03-zeitstrahl-offline-geschafft.png"), full_page=True)
    audio = s.evaluate("""async () => {
      const a = await fetch('audio/leipzig/leipzig.intro.n.mp3');
      const b = await a.arrayBuffer();
      const r = await fetch('audio/leipzig/leipzig.intro.n.mp3', { headers: { Range: 'bytes=0-99' } });
      const rb = await r.arrayBuffer();
      const z = await (await fetch('audio/leipzig/zeiten.json')).json();
      return { status: a.status, bytes: b.byteLength, rangeStatus: r.status, rangeBytes: rb.byteLength, contentRange: r.headers.get('Content-Range'), woerter: z.texte['leipzig.intro.n'].w.length };
    }""")
    protokoll.append(f"Audio aus dem Cache: Status {audio['status']}, {audio['bytes']} Byte; Teilanfrage: Status {audio['rangeStatus']}, {audio['rangeBytes']} Byte, {audio['contentRange']}; Wortzeiten: {audio['woerter']}")
    abspielen = s.evaluate("""async () => {
      const a = new Audio('audio/leipzig/leipzig.intro.n.mp3'); a.muted = true;
      try { await a.play(); await new Promise(r => setTimeout(r, 400)); const t = a.currentTime; a.pause(); return { ok: true, zeit: t, dauer: a.duration }; }
      catch (e) { return { ok: false, fehler: String(e) }; }
    }""")
    protokoll.append(f"Audio offline abspielbar: {abspielen}")
    s.goto(basis + "datenschutz.html"); warte(s, 600)
    protokoll.append(f"Textseite offline: „{s.inner_text('h1')}“")
    browser.close()
    return {"ok": kontrolliert and gespielt and audio["status"] == 200 and audio["rangeStatus"] == 206, "protokoll": protokoll}


# ---------------------------------------------------------------------------
# 4. Collage-Test
# ---------------------------------------------------------------------------
def collage(pw, basis):
    ordner = QA / "collage"
    ordner.mkdir(parents=True, exist_ok=True)
    protokoll = []
    browser = pw.chromium.launch(executable_path=ARGS.chrome)
    ctx = browser.new_context(viewport={"width": 1024, "height": 768}, locale="de-DE", accept_downloads=True, service_workers="block")
    s = ctx.new_page()
    downloads = []
    s.on("download", lambda d: downloads.append(d))
    s.goto(basis + "index.html#/lehrkraefte/material"); warte(s)
    s.get_by_role("button", name="Alle Fundstücke im aktuellen Spielprofil freischalten").click()
    s.goto(basis + "index.html#/collage"); warte(s, 700)
    s.get_by_label("Mosaik").check()
    s.get_by_label("Kerzenschein").check()
    s.evaluate("""() => { const r = document.getElementById('regler-anordnung'); r.value = '7'; r.dispatchEvent(new Event('input', { bubbles: true }));
      const g = document.getElementById('regler-groesse'); g.value = '115'; g.dispatchEvent(new Event('input', { bubbles: true })); }""")
    s.get_by_role("button", name="Alle drei Dateien erzeugen").click()
    for _ in range(60):
        if len(downloads) >= 3:
            break
        s.wait_for_timeout(200)
    dateien = {}
    for d in downloads[:3]:
        ziel = ordner / d.suggested_filename
        d.save_as(str(ziel))
        dateien[ziel.suffix] = ziel
    png = Image.open(dateien[".png"])
    webp = Image.open(dateien[".webp"])
    meta = json.loads(dateien[".json"].read_text(encoding="utf-8"))
    png_hash = hashlib.sha256(dateien[".png"].read_bytes()).hexdigest()
    protokoll.append(f"PNG: {dateien['.png'].name}, {png.size[0]} × {png.size[1]} px, {png.format}")
    protokoll.append(f"WebP: {dateien['.webp'].name}, {webp.size[0]} × {webp.size[1]} px, {webp.format}, Kodierung laut JSON: {meta['ausgabe']['webp']['kodierung']}")
    pflicht = ["kennung", "zeitpunkt", "erzeugungsart", "items", "regler", "vorlage"]
    verboten = [k for k in ["gruppe", "gruppeId", "bezeichnung", "name", "namen"] if k in json.dumps(meta).lower().replace('"name": "klasseSachsen-Collage"'.lower(), "")]
    protokoll.append(f"JSON: Pflichtfelder vorhanden: {all(k in meta for k in pflicht)}; Erzeugungsart: {meta['erzeugungsart']}; Items: {len(meta['items'])}; Regler: {meta['regler']}")
    protokoll.append(f"JSON enthält keine Namen/Gruppenbezeichnung: {not any(k in meta for k in ['gruppe', 'gruppeId', 'bezeichnung'])}")
    protokoll.append(f"Prüfsumme PNG = JSON-Angabe: {png_hash == meta['ausgabe']['png']['sha256']}")
    # Neu erzeugen aus der JSON-Datei
    vorher = len(downloads)
    s.set_input_files("#json-laden", str(dateien[".json"]))
    s.wait_for_selector("#neu-ergebnis", timeout=20000)
    gleich = s.get_attribute("#neu-ergebnis", "data-gleich")
    for _ in range(50):
        if len(downloads) > vorher:
            break
        s.wait_for_timeout(200)
    neu = ordner / ("neu-" + downloads[-1].suggested_filename)
    downloads[-1].save_as(str(neu))
    neu_hash = hashlib.sha256(neu.read_bytes()).hexdigest()
    protokoll.append(f"Aus JSON neu erzeugt: Anzeige „identisch“: {gleich == 'ja'}; SHA-256 neu = alt: {neu_hash == png_hash}")
    s.screenshot(path=str(ordner / "collage-seite.png"), full_page=True)
    # Safari-Rückfall: eigener WebP-Kodierer
    s.goto(basis + "index.html?eigenes-webp#/collage"); warte(s, 800)
    vorher = len(downloads)
    s.get_by_role("button", name="WebP-Vorschau laden").click()
    for _ in range(50):
        if len(downloads) > vorher:
            break
        s.wait_for_timeout(200)
    eigen = ordner / ("eigener-kodierer-" + downloads[-1].suggested_filename)
    downloads[-1].save_as(str(eigen))
    eb = Image.open(eigen)
    roh = eigen.read_bytes()
    protokoll.append(f"Eigener WebP-Kodierer (Rückfall für Safari): {eb.size[0]} × {eb.size[1]} px, {eb.format}, Chunk {roh[12:16].decode()}, {len(roh)} Byte")
    browser.close()
    ok = png.size == (2048, 2048) and webp.format == "WEBP" and gleich == "ja" and neu_hash == png_hash and meta["erzeugungsart"] == "regelbasiert" and eb.format == "WEBP"
    return {"ok": ok, "protokoll": protokoll, "meta": meta}


# ---------------------------------------------------------------------------
# 5. Extras: Gruppenbericht (PDF), Umbruch 320 px
# ---------------------------------------------------------------------------
def extras(pw, basis):
    protokoll = []
    browser = pw.chromium.launch(executable_path=ARGS.chrome)
    ctx = browser.new_context(viewport={"width": 1024, "height": 768}, locale="de-DE", service_workers="block")
    s = ctx.new_page()
    s.goto(basis + "index.html#/lehrkraefte/material"); warte(s)
    s.get_by_role("button", name="Drei Beispielgruppen anlegen").click()
    gid = s.evaluate("JSON.parse(localStorage.getItem('ks.gruppen'))[0].id")
    s.goto(basis + f"index.html#/lehrkraefte/gruppe/{gid}"); warte(s)
    s.get_by_role("button", name="Hinweise übernehmen").click(); warte(s)
    s.get_by_role("button", name="Entwurf neu erzeugen").click(); warte(s)
    s.emulate_media(media="print")
    s.pdf(path=str(QA / "gruppenbericht.pdf"), format="A4", print_background=True)
    s.screenshot(path=str(QA / "gruppenbericht-druckansicht.png"), full_page=True)
    druck_text = s.inner_text("main")
    s.emulate_media(media="screen")
    protokoll.append(f"Gruppenbericht als PDF erzeugt (Druck-CSS). Enthält Hinweis „Beobachtung, keine Bewertung“: {'Beobachtung, keine Bewertung' in druck_text}")
    # Vorlesen: vorproduziertes Audio, Wortmarkierung, Tempo, einfache Sprache
    s.goto(basis + "index.html#/ort/meissen"); warte(s, 600)
    s.locator(".vorlesen-knopf").first.click()
    s.wait_for_timeout(1600)
    v1 = s.evaluate("() => ({ v: window.ksVorleser(), markiert: (document.querySelector('.w.aktiv') || {}).textContent || null, leiste: !document.getElementById('vorleser').hidden })")
    s.select_option("#vorleser-tempo", "1.5")
    s.wait_for_timeout(400)
    v2 = s.evaluate("() => window.ksVorleser()")
    s.click("#vorleser-stopp")
    s.click("#schalter-einfach"); warte(s, 400)
    text_e = s.inner_text(".lesbar__text")
    s.locator(".vorlesen-knopf").first.click()
    s.wait_for_timeout(1200)
    v3 = s.evaluate("() => ({ v: window.ksVorleser(), markiert: (document.querySelector('.w.aktiv') || {}).textContent || null })")
    s.click("#vorleser-stopp")
    s.click("#schalter-einfach"); warte(s, 300)
    s.screenshot(path=str(QA / "vorlesen-wortmarkierung.png"))
    protokoll.append(f"Vorlesen (Standardsprache): Datei {v1['v']['quelle'].split('/')[-1]}, Art {v1['v']['art']}, nach 1,6 s bei {v1['v']['zeit']:.2f} s, markiertes Wort „{v1['markiert']}“, Vorleseleiste sichtbar: {v1['leiste']}")
    protokoll.append(f"Tempo 1,5-fach eingestellt: Abspielrate {v2['tempo']}")
    protokoll.append(f"Einfache Sprache: Text beginnt mit „{text_e[:40]}…“; Datei {v3['v']['quelle'].split('/')[-1]}, markiertes Wort „{v3['markiert']}“")
    vorlesen_ok = v1['v']['quelle'].endswith('meissen.intro.n.mp3') and v1['markiert'] and abs(v2['tempo'] - 1.5) < 0.01 and v3['v']['quelle'].endswith('meissen.intro.e.mp3')
    protokoll.append(f"Vorlese-Test bestanden: {bool(vorlesen_ok)}")
    # Umbruch bei 320 px (WCAG 1.4.10)
    s.set_viewport_size({"width": 320, "height": 640})
    umbruch = []
    for pfad in ["/", "/gruppe", "/karte", "/ort/meissen", "/spiel/meissen-zuordnen", "/spiel/leipzig-zeitstrahl", "/spiel/freiberg-schaetzfrage", "/album", "/startklar", "/lehrkraefte/gruppen", f"/lehrkraefte/gruppe/{gid}"]:
        s.goto(basis + "index.html#" + pfad); warte(s, 400)
        if pfad.startswith("/spiel/"):
            s.get_by_role("button", name="Wir sind bereit").click(); warte(s, 300)
        w = s.evaluate("({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })")
        umbruch.append({"seite": pfad, "breite": w["scroll"], "fenster": w["client"], "ok": w["scroll"] <= w["client"] + 1})
    s.screenshot(path=str(QA / "umbruch-320px-gruppenansicht.png"), full_page=True)
    browser.close()
    return {"protokoll": protokoll, "umbruch": umbruch}


# ---------------------------------------------------------------------------
# Kontraste (Stichprobe nach WCAG-Formel)
# ---------------------------------------------------------------------------
def kontrast(a, b):
    def lum(h):
        h = h.lstrip("#")
        r, g, bb = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb)
    l1, l2 = sorted([lum(a), lum(b)], reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


PAARE = [
    ("Fließtext", "#1C2541", "#FBF7EF"), ("Fließtext auf Karte", "#1C2541", "#FFFFFF"), ("Kleintext", "#4A5470", "#FBF7EF"),
    ("Kleintext auf Hinweisfläche", "#4A5470", "#E3EAF8"), ("Kleintext auf Fußzeile", "#1C2541", "#F2EADB"), ("Link", "#2350A8", "#FBF7EF"),
    ("Knopf primär", "#FFFFFF", "#2350A8"), ("Knopf zweit", "#18397A", "#FFFFFF"), ("Knopf grün", "#FFFFFF", "#1E6B4F"),
    ("Knopf warm (Tipp)", "#2B1D00", "#F2B23A"), ("Knopf rot (Löschen)", "#FFFFFF", "#B5402A"), ("Knopf deaktiviert", "#4A5470", "#E4E0D8"),
    ("Abzeichen blau", "#18397A", "#E3EAF8"), ("Abzeichen grün", "#134733", "#DDF0E6"), ("Abzeichen warm", "#5A3A00", "#FDF0D2"),
    ("Hinweisband Lehrkräfte", "#FFFFFF", "#1C2541"), ("Wortmarkierung Vorlesen", "#1C2541", "#FFBF1F"), ("Rollenmarke", "#4A5470", "#FFFFFF"),
    ("Kartenbeschriftung (SVG)", "#33405E", "#FFFFFF"), ("Kartenbeschriftung Erzgebirge (SVG)", "#3B4A2C", "#F4F7EA"), ("Elbe-Beschriftung (SVG)", "#1F5C99", "#F4F7EA"),
    ("Formel", "#18397A", "#E3EAF8"), ("Entwurf-Marke", "#FFFFFF", "#B5402A"), ("Kontrastmodus Text", "#FFFFFF", "#000000"),
    ("Kontrastmodus Akzent", "#FFE14D", "#000000"), ("Kontrastmodus Wortmarkierung", "#000000", "#00E5FF"),
    ("Fokusrahmen innen (nicht Text, ≥ 3 : 1)", "#1C2541", "#FBF7EF"), ("Fokusrahmen außen gegen Tinte (≥ 3 : 1)", "#FFBF1F", "#1C2541"),
]


def main():
    QA.mkdir(exist_ok=True)
    port = freier_port()
    proc = server_starten(port)
    basis = f"http://127.0.0.1:{port}/"
    bericht = {"axe_version": AXE_VERSION, "zeit": time.strftime("%d.%m.%Y %H:%M")}
    with sync_playwright() as pw:
        if ARGS.nur in (None, "bildschirme"):
            ergebnisse, ziele = bildschirme(pw, basis)
            bericht["bildschirme"] = ergebnisse
            bericht["zielgroessen"] = ziele
        if ARGS.nur in (None, "tastatur"):
            bericht["tastatur"] = tastatur(pw, basis)
        if ARGS.nur in (None, "collage"):
            bericht["collage"] = collage(pw, basis)
        if ARGS.nur in (None, "extra"):
            bericht["extras"] = extras(pw, basis)
        proc.terminate(); proc.wait()
        if ARGS.nur in (None, "offline"):
            bericht["offline"] = offline(pw, freier_port())
    bericht["kontraste"] = [{"paar": n, "vorne": a, "hinten": b, "verhaeltnis": round(kontrast(a, b), 2)} for n, a, b in PAARE]
    (QA / "ergebnisse.json").write_text(json.dumps(bericht, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({k: (v if k in ("axe_version", "zeit") else "…") for k, v in bericht.items()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
