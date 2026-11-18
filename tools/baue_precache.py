#!/usr/bin/env python3
"""Erzeugt precache.json (Paketliste fuer den Startklar-Check) und sw.js (Service Worker).

Aufruf (im Projektordner):  python3 tools/baue_precache.py
Die Version ist ein Hash ueber alle Dateien. Jede Aenderung erzeugt einen neuen Service Worker,
der die neuen Dateien beim naechsten Online-Start laedt.
"""
import hashlib
import json
import pathlib

WURZEL = pathlib.Path(__file__).resolve().parents[1]
ORTE = ["meissen", "freiberg", "leipzig"]

def dateien():
    muster = ["*.html", "manifest.webmanifest", "css/*.css", "js/**/*.js", "fonts/*", "img/*",
              "inhalt/*.json", "audio/stille.mp3", "audio/*/*.mp3", "audio/*/zeiten.json",
              "LICENSE", "LICENSE-CONTENT.md", "README.md", "QUELLEN.md"]
    gefunden = set()
    for m in muster:
        for p in WURZEL.glob(m):
            if p.is_file():
                gefunden.add(p.relative_to(WURZEL).as_posix())
    return sorted(gefunden)

def paket_von(pfad):
    for ort in ORTE:
        if pfad == f"inhalt/{ort}.json" or pfad.startswith(f"audio/{ort}/"):
            return ort
    return "app"

def main():
    liste = dateien()
    pakete = {"app": ["./"], **{o: [] for o in ORTE}}
    groessen = {k: 0 for k in pakete}
    h = hashlib.sha256()
    for pfad in liste:
        daten = (WURZEL / pfad).read_bytes()
        h.update(pfad.encode("utf-8"))
        h.update(daten)
        p = paket_von(pfad)
        pakete[p].append(pfad)
        groessen[p] += len(daten)
    version = h.hexdigest()[:12]
    (WURZEL / "precache.json").write_text(json.dumps({"version": version, "pakete": pakete, "groessen": groessen},
                                                     ensure_ascii=False, indent=1), encoding="utf-8")
    alle = [d for p in pakete.values() for d in p] + ["precache.json"]
    vorlage = (WURZEL / "tools" / "sw-vorlage.js").read_text(encoding="utf-8")
    sw = vorlage.replace("__VERSION__", version).replace("__DATEIEN__", json.dumps(alle, ensure_ascii=False))
    (WURZEL / "sw.js").write_text(sw, encoding="utf-8")
    gesamt = sum(groessen.values())
    print(f"Version {version}: {len(alle)} Dateien, {gesamt / 1048576:.1f} MB")
    for k, v in pakete.items():
        print(f"  {k}: {len(v)} Dateien, {groessen[k] / 1048576:.2f} MB")

if __name__ == "__main__":
    main()
