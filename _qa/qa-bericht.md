# Prüfbericht – klasseSachsen Demonstrator

Stand: 18.11.2026 00:32

| Prüfung | Ergebnis |
|---|---|
| axe-core 4.14.1, WCAG 2.0/2.1 A und AA | **0 Verstöße** auf 117 Bildschirmen (3 Größen) – Details: `axe-bericht.md` |
| Komplette Quest nur per Tastatur (Meißen, 2 Minigames) | **bestanden** – 105 Tab-Schritte, keine Maus |
| Offline: laden, Server aus + Netz aus, neu laden, weiterspielen | **bestanden** |
| Item-Collage: PNG 2048 × 2048, WebP, JSON, Neuerzeugung | **bestanden** |
| Kontraste (Stichprobe, 28 Farbpaare) | **alle erfüllt** – `kontraste.md` |
| Zielgrößen ≥ 44 × 44 px (Bedienelemente, iPad quer) | **alle erfüllt** (ausgenommen 7 Links im Fließtext) |
| Eigener WebP-Kodierer (Safari-Rückfall), dekodiert mit libwebp | **4 von 4 Testbildern pixelgleich** – `webp-test.json` |
| Umbruch bei 320 px Breite (WCAG 1.4.10) | **11 von 11 Seiten ohne waagerechtes Scrollen** |

## Tastatur-Test

- Tab ×5 → „Los geht’s!“ (A, Fokusrahmen sichtbar: ja)
- Enter: Spiel starten
- Tab ×3 → „Frei spielen“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: Freies Spiel wählen
- Tab ×2 → „Liste“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: Orte als Liste anzeigen
- Tab ×1 → „Nach Meißen“ (A, Fokusrahmen sichtbar: ja)
- Enter: Meißen öffnen
- Tab ×3 → „Spielen“ (A, Fokusrahmen sichtbar: ja)
- Enter: Spurensuche starten
- Tab ×7 → „Wir sind bereit – los geht’s!“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: Los geht's
- Tab ×9 → „Großer Ofen aus Ziegeln“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: „Großer Ofen“ auswählen
-   Fokus danach: „Nächste Aufgabe“
- Enter: weiter
- Tab ×5 → „Säcke mit weißer Erde“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: „Säcke mit weißer Erde“ auswählen
-   Fokus danach: „Nächste Aufgabe“
- Enter: weiter
- Tab ×7 → „Frau am Maltisch“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: „Frau am Maltisch“ auswählen
-   Fokus danach: „Alles gefunden – weiter“
- Enter: weiter
- Tab ×2 → „Nächstes Spiel an diesem Ort“ (A, Fokusrahmen sichtbar: ja)
- Enter: zum Zuordnen-Spiel
- Tab ×6 → „Wir sind bereit – los geht’s!“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: Los geht's
- Tab ×13 → „Gold“ (BUTTON, Fokusrahmen sichtbar: ja)
- Space: Karte „Gold“ wählen
- Tab ×7 → „Ausgewählte Karte hierher legen: Gehört nicht hinein“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: in „Gehört nicht hinein“ legen
- Space: Karte „Kaolin“ wählen
- Tab ×5 → „Ausgewählte Karte hierher legen: Gehört in die Porzellanmasse“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: in „Gehört in die Porzellanmasse“ legen
- Space: Karte „Mehl“ wählen
- Tab ×6 → „Ausgewählte Karte hierher legen: Gehört nicht hinein“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: in „Gehört nicht hinein“ legen
- Space: Karte „Quarz“ wählen
- Tab ×3 → „Ausgewählte Karte hierher legen: Gehört in die Porzellanmasse“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: in „Gehört in die Porzellanmasse“ legen
- Space: Karte „Silber“ wählen
- Tab ×5 → „Ausgewählte Karte hierher legen: Gehört nicht hinein“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: in „Gehört nicht hinein“ legen
- Space: Karte „Feldspat“ wählen
- Tab ×1 → „Ausgewählte Karte hierher legen: Gehört in die Porzellanmasse“ (BUTTON, Fokusrahmen sichtbar: ja)
- Enter: in „Gehört in die Porzellanmasse“ legen
-   Fokus nach letzter Karte: „Zuordnung prüfen“
- Enter: Zuordnung prüfen (Protokoll)
-   Fokus danach: „Weiter“
- Enter: Weiter
- Tab ×3 → „Zur Karte“ (A, Fokusrahmen sichtbar: ja)
- Enter: zurück zur Karte

Gesammelte Fundstücke danach: meissen-tasse, meissen-teller

Bildschirmfotos: `tastatur/`

## Offline-Test

- Service Worker kontrolliert die Seite: True
- Startklar-Check online: grün
- Server beendet und Netz abgeschaltet
- Neu geladen ohne Netz: Überschrift „Startklar-Check“
- Zeitstrahl offline gespielt, Fundstück Palmensäule erhalten: True
- Audio aus dem Cache: Status 200, 109811 Byte; Teilanfrage: Status 206, 100 Byte, bytes 0-99/109811; Wortzeiten: 48
- Audio offline abspielbar: {'ok': True, 'zeit': 0.360185, 'dauer': 21.84127}
- Textseite offline: „Datenschutz“

Bildschirmfotos: `offline/`

## Item-Collage

- PNG: bb-20261118-6940ba0f091b.png, 2048 × 2048 px, PNG
- WebP: bb-20261118-6940ba0f091b-vorschau.webp, 512 × 512 px, WEBP, Kodierung laut JSON: Browser (verlustbehaftet, Qualität 0,9)
- JSON: Pflichtfelder vorhanden: True; Erzeugungsart: regelbasiert; Items: 6; Regler: {'anordnung': 7, 'groesse': 115, 'farbstimmung': 'kerzenschein'}
- JSON enthält keine Namen/Gruppenbezeichnung: True
- Prüfsumme PNG = JSON-Angabe: True
- Aus JSON neu erzeugt: Anzeige „identisch“: True; SHA-256 neu = alt: True
- Eigener WebP-Kodierer (Rückfall für Safari): 512 × 512 px, WEBP, Chunk VP8L, 129376 Byte

Beispiel der JSON-Metadaten:

```json
{
  "schema": "klassesachsen-bildbeitrag/1",
  "kennung": "bb-20261118-6940ba0f091b",
  "zeitpunkt": "2026-11-18T00:35:10+01:00",
  "erzeugungsart": "regelbasiert",
  "ki": false,
  "generator": {
    "name": "klasseSachsen-Collage",
    "version": "1.0.0"
  },
  "items": [
    "meissen-tasse",
    "meissen-teller",
    "freiberg-lampe",
    "freiberg-erz",
    "leipzig-saeule",
    "leipzig-kerze"
  ],
  "vorlage": "mosaik",
  "regler": {
    "anordnung": 7,
    "groesse": 115,
    "farbstimmung": "kerzenschein"
  },
  "seed": 226832170,
  "ausgabe": {
    "png": {
      "breite": 2048,
      "hoehe": 2048,
      "sha256": "eac828f07041f714d2b69fad3ff698f998e353693a66aec27e1c7dfc4b244db1"
    },
    "webp": {
      "breite": 512,
      "hoehe": 512,
      "kodierung": "Browser (verlustbehaftet, Qualität 0,9)"
    }
  },
  "lizenz": "CC BY-SA 4.0",
  "hinweis": "Enthält keine Namen und keine Gruppenbezeichnung. Das Bild lässt sich aus items, vorlage und regler jederzeit neu erzeugen."
}
```

Dateien: `collage/`

## Gruppenbericht und Umbruch

- Gruppenbericht als PDF erzeugt (Druck-CSS). Enthält Hinweis „Beobachtung, keine Bewertung“: True
- Vorlesen (Standardsprache): Datei meissen.intro.n.mp3, Art audio, nach 1,6 s bei 1.54 s, markiertes Wort „Berg“, Vorleseleiste sichtbar: True
- Tempo 1,5-fach eingestellt: Abspielrate 1.5
- Einfache Sprache: Text beginnt mit „In Meißen steht eine alte Burg. Sie heiß…“; Datei meissen.intro.e.mp3, markiertes Wort „None“
- Vorlese-Test bestanden: True
- Datei: `gruppenbericht.pdf`, Druckansicht: `gruppenbericht-druckansicht.png`

| Seite (320 px) | Inhaltsbreite | Fensterbreite | ohne waagerechtes Scrollen |
|---|---|---|---|
| `/` | 320 | 320 | ja |
| `/gruppe` | 320 | 320 | ja |
| `/karte` | 320 | 320 | ja |
| `/ort/meissen` | 320 | 320 | ja |
| `/spiel/meissen-zuordnen` | 320 | 320 | ja |
| `/spiel/leipzig-zeitstrahl` | 320 | 320 | ja |
| `/spiel/freiberg-schaetzfrage` | 320 | 320 | ja |
| `/album` | 320 | 320 | ja |
| `/startklar` | 320 | 320 | ja |
| `/lehrkraefte/gruppen` | 320 | 320 | ja |
| `/lehrkraefte/gruppe/g-lhdgbxs1wtm2` | 320 | 320 | ja |

## Gegenprobe mit der WebKit-Engine (WebKit 26.6)

axe-core auf 9 Kernbildschirmen: 0 Verstöße. Skriptfehler: 0.

- Spurensuche „Unter Tage“ gelöst: True
- Zuordnen gelöst (mit gestuften Hilfen): True
- Zeitstrahl gelöst: True
- Schätzfrage gelöst (gemeinsame Schätzung 51.000): True
- Vorlesen: Art audio, Datei leipzig.intro.n.mp3, Zeit 1.98 s, markiertes Wort „Nikolaikirche.“
- Collage-Datei .png: 2048 × 2048 px, PNG
- Collage-Datei .webp: 512 × 512 px, WEBP
- Collage-JSON: Erzeugungsart regelbasiert, WebP-Kodierung: eigener Kodierer (verlustfrei, VP8L)
- Service Worker verfügbar: True
- Startklar-Check grün (online)
- Server beendet (kein Netz mehr erreichbar)
- Ohne Server neu geladen (Seitenwechsel auf andere Datei): „Datenschutz“
- Ohne Server App neu geladen: „Was ist sächsisch?“
- Offline gespielt (Ofen gefunden): True

Bildschirmfotos: `webkit/`. Hinweis: Playwright-WebKit entspricht der Safari-Engine, ersetzt aber keinen Test auf einem echten iPad.

## Zielgrößen

Alle Bedienelemente sind mindestens 44 × 44 px groß (Links im Fließtext sind nach WCAG ausgenommen).

## Bildschirmfotos

Ordner `screenshots/<größe>/`, Übersichten `uebersicht-ipad-quer.png`, `uebersicht-ipad-hoch.png`, `uebersicht-smartphone.png`.
