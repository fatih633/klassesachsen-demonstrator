#!/usr/bin/env python3
"""Gegenprobe mit der WebKit-Engine (Safari-Engine, Playwright-Build für Linux) im iPad-Format.

Prüft: alle Bildschirme ohne Skriptfehler, axe-core auf Kernbildschirmen, alle vier Spieltypen,
Vorlese-Audio mit Wortmarkierung, Item-Collage (PNG 2048 × 2048, WebP), Offline-Betrieb mit Service Worker.
Hinweis: Das ersetzt keinen Test auf einem echten iPad mit iPadOS 18, deckt aber die Engine ab.
Aufruf: python3 tools/qa/webkit_test.py --axe <pfad/zu/axe.min.js>
"""
import argparse
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
QA = WURZEL / "_qa" / "webkit"
ap = argparse.ArgumentParser()
ap.add_argument("--axe", required=True)
ARGS = ap.parse_args()
AXE_OPTIONEN = {"runOnly": {"type": "tag", "values": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]}, "resultTypes": ["violations"]}


def freier_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def server(port):
    proc = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=WURZEL,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.2):
                return proc
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("Server startet nicht")


def main():
    QA.mkdir(parents=True, exist_ok=True)
    port = freier_port()
    proc = server(port)
    basis = f"http://127.0.0.1:{port}/"
    app = basis + "index.html#"
    log = []
    ergebnis = {"axe": {}, "fehler": []}
    with sync_playwright() as pw:
        b = pw.webkit.launch()
        ergebnis["engine"] = f"WebKit {b.version}"
        ctx = b.new_context(viewport={"width": 1024, "height": 768}, locale="de-DE", accept_downloads=True, has_touch=True)
        s = ctx.new_page()
        s.on("pageerror", lambda e: ergebnis["fehler"].append(str(e)))
        s.on("console", lambda m: ergebnis["fehler"].append(m.text) if m.type == "error" else None)
        downloads = []
        s.on("download", lambda d: downloads.append(d))
        s.on("requestfailed", lambda r: ergebnis["fehler"].append(f"Anfrage fehlgeschlagen: {r.url.split('/')[-1]} ({r.failure})"))

        def axe(name):
            if not s.evaluate("typeof window.axe !== 'undefined'"):
                s.add_script_tag(path=ARGS.axe)
            v = s.evaluate("async (o) => (await axe.run(document, o)).violations.map(v => v.id + ': ' + v.nodes.length)", AXE_OPTIONEN)
            ergebnis["axe"][name] = v
            s.screenshot(path=str(QA / f"{name}.png"))

        s.goto(app + "/"); s.wait_for_timeout(1200); axe("start")
        s.goto(app + "/lehrkraefte/material"); s.wait_for_timeout(500)
        s.get_by_role("button", name="Drei Beispielgruppen anlegen").click()
        s.goto(app + "/gruppe"); s.wait_for_timeout(400)
        s.get_by_role("button", name="Frei spielen").click(); s.wait_for_timeout(500); axe("karte")
        # Spurensuche
        s.goto(app + "/spiel/freiberg-spurensuche"); s.wait_for_timeout(500)
        s.get_by_role("button", name="Wir sind bereit").click(); s.wait_for_timeout(400)
        for ziel in ["Kasten auf Rädern", "Leiter im Schacht", "Glitzerndes Band im Felsen"]:
            s.get_by_role("button", name=ziel).click(); s.wait_for_timeout(250)
            s.locator(".rueckmeldung .knopf--gruen").click(); s.wait_for_timeout(300)
        log.append(f"Spurensuche „Unter Tage“ gelöst: {'Silbererz' in s.inner_text('main')}")
        axe("belohnung")
        # Zuordnen mit Lösungshilfe
        s.goto(app + "/spiel/meissen-zuordnen"); s.wait_for_timeout(500)
        s.get_by_role("button", name="Wir sind bereit").click(); s.wait_for_timeout(300)
        axe("zuordnen")
        for t in ["Tipp 1", "Tipp 2", "Lösung zeigen"]:
            s.get_by_role("button", name=t).click(); s.wait_for_timeout(200)
        s.get_by_role("button", name="Zuordnung prüfen").click(); s.wait_for_timeout(300)
        s.get_by_role("button", name="Weiter", exact=True).click(); s.wait_for_timeout(600)
        log.append(f"Zuordnen gelöst (mit gestuften Hilfen): {'Porzellanteller' in s.inner_text('main')}")
        # Zeitstrahl
        s.goto(app + "/spiel/leipzig-zeitstrahl"); s.wait_for_timeout(500)
        s.get_by_role("button", name="Wir sind bereit").click(); s.wait_for_timeout(300)
        s.get_by_role("button", name="„Demonstration auf dem Ring“ nach unten").click(); s.wait_for_timeout(200)
        axe("zeitstrahl")
        for t in ["Tipp 1", "Tipp 2", "Lösung zeigen"]:
            s.get_by_role("button", name=t).click(); s.wait_for_timeout(200)
        s.get_by_role("button", name="Reihenfolge prüfen").click(); s.wait_for_timeout(300)
        s.get_by_role("button", name="Weiter", exact=True).click(); s.wait_for_timeout(600)
        log.append(f"Zeitstrahl gelöst: {'Palmensäule' in s.inner_text('main')}")
        # Schätzfrage
        s.goto(app + "/spiel/leipzig-schaetzfrage"); s.wait_for_timeout(500)
        s.get_by_role("button", name="Wir sind bereit").click(); s.wait_for_timeout(300)
        for _ in range(5):
            s.get_by_role("button", name="10.000 Menschen mehr").click()
        s.get_by_role("button", name="Gemeinsame Schätzung abgeben").click(); s.wait_for_timeout(200)
        s.get_by_role("button", name="Ja, wir sind uns einig").click(); s.wait_for_timeout(400)
        axe("schaetzfrage-aufloesung")
        s.get_by_role("button", name="Weiter", exact=True).click(); s.wait_for_timeout(600)
        log.append(f"Schätzfrage gelöst (gemeinsame Schätzung 51.000): {'Kerze' in s.inner_text('main')}")
        # Vorlesen
        s.goto(app + "/ort/leipzig"); s.wait_for_timeout(600)
        s.locator(".vorlesen-knopf").first.click(); s.wait_for_timeout(2000)
        v = s.evaluate("() => ({ v: window.ksVorleser(), w: (document.querySelector('.w.aktiv') || {}).textContent || null })")
        log.append(f"Vorlesen: Art {v['v']['art']}, Datei {str(v['v']['quelle']).split('/')[-1]}, Zeit {v['v']['zeit']:.2f} s, markiertes Wort „{v['w']}“")
        s.click("#vorleser-stopp")
        # Collage
        s.goto(app + "/lehrkraefte/material"); s.wait_for_timeout(400)
        s.get_by_role("button", name="Alle Fundstücke im aktuellen Spielprofil freischalten").click()
        s.goto(basis + "index.html?eigenes-webp#/collage"); s.wait_for_timeout(900)
        axe("collage")
        s.get_by_role("button", name="Alle drei Dateien erzeugen").click()
        for _ in range(80):
            if len(downloads) >= 3:
                break
            s.wait_for_timeout(250)
        for d in downloads[:3]:
            ziel = QA / d.suggested_filename
            d.save_as(str(ziel))
            if ziel.suffix in (".png", ".webp"):
                im = Image.open(ziel)
                log.append(f"Collage-Datei {ziel.suffix}: {im.size[0]} × {im.size[1]} px, {im.format}")
            else:
                meta = json.loads(ziel.read_text(encoding="utf-8"))
                log.append(f"Collage-JSON: Erzeugungsart {meta['erzeugungsart']}, WebP-Kodierung: {meta['ausgabe']['webp']['kodierung']}")
        # Lehrkräfte
        gid = s.evaluate("JSON.parse(localStorage.getItem('ks.gruppen'))[0].id")
        s.goto(app + f"/lehrkraefte/gruppe/{gid}"); s.wait_for_timeout(600); axe("lehrkraefte-gruppenansicht")
        s.goto(app + "/lehrkraefte/gruppen"); s.wait_for_timeout(400); axe("lehrkraefte-gruppen")
        # Offline
        sw = s.evaluate("'serviceWorker' in navigator")
        log.append(f"Service Worker verfügbar: {sw}")
        if sw:
            s.goto(app + "/startklar")
            try:
                s.wait_for_selector('#startklar-status[data-status="gruen"]', timeout=90000)
                log.append("Startklar-Check grün (online)")
                proc.terminate(); proc.wait()
                log.append("Server beendet (kein Netz mehr erreichbar)")
                s.reload(); s.wait_for_timeout(1500)
                s.goto(basis + "datenschutz.html"); s.wait_for_timeout(800)
                log.append(f"Ohne Server neu geladen (Seitenwechsel auf andere Datei): „{s.inner_text('h1')}“")
                s.goto(basis + "index.html#/"); s.wait_for_timeout(1200)
                log.append(f"Ohne Server App neu geladen: „{s.inner_text('h1')}“")
                s.goto(app + "/spiel/meissen-spurensuche"); s.wait_for_timeout(800)
                s.get_by_role("button", name="Wir sind bereit").click(); s.wait_for_timeout(300)
                s.get_by_role("button", name="Großer Ofen aus Ziegeln").click(); s.wait_for_timeout(300)
                log.append(f"Offline gespielt (Ofen gefunden): {'Richtig!' in s.inner_text('main')}")
                s.screenshot(path=str(QA / "offline-spiel.png"))
            except Exception as fehler:
                log.append(f"Offline-Test in WebKit nicht abgeschlossen: {str(fehler).splitlines()[0]}")
        b.close()
    if proc.poll() is None:
        proc.terminate()
    ergebnis["protokoll"] = log
    (WURZEL / "_qa" / "ergebnisse-webkit.json").write_text(json.dumps(ergebnis, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(ergebnis, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
