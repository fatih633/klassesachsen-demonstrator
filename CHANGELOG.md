# Änderungsprotokoll und Bauprotokoll

Format: Datum, Uhrzeit von–bis (MEZ), was gebaut wurde. Das Protokoll belegt Ablauf und Umfang der Entwicklung.

## [1.0.0] – 18.11.2026

Erste vollständige Fassung des Demonstrators.

### Bauprotokoll

| Datum | Uhrzeit (MEZ) | Arbeitsschritt |
|---|---|---|
| 17.11.2026 | 22:59–23:12 | Anforderungen aus den Vergabeunterlagen erfasst: Anlage 2 (G1–G4, E1–E10, Aufbewahrung 4.4), Allgemeine Bieterinformation 2 (Tabelle 1: F1–F8; Demonstrator wird wie eine Referenz gewertet), Grobkonzept (Spieltypen, Item-Collage, Startklar-Check). Entwicklungsumgebung geprüft, Piper TTS, Stimme `de_DE-thorsten-medium`, axe-core, Schriften und Lizenzliste installiert. |
| 17.11.2026 | 23:00–23:21 | Faktenprüfung per Websuche an seriösen Quellen (MEISSEN, Staatliche Schlösser, Burgen und Gärten Sachsen, Stadt Freiberg, TU Bergakademie Freiberg, Kirchgemeinde St. Nikolai, Stadt Leipzig, bpb, Bundesregierung); unsichere Details aussortiert (z. B. 1968/1969). |
| 17.11.2026 | 23:12–23:24 | Vereinfachter Sachsen-Umriss aus Natural Earth (Douglas-Peucker), lokale Schriften (OFL), vollständiger Lizenztext EUPL-1.2 aus der SPDX-Liste. |
| 17.11.2026 | 23:23–23:40 | Drei Questpakete als JSON (Meißen, Freiberg, Leipzig) mit sechs Minigames in Standard- und einfacher Sprache; Bauwerkzeug für Vorlese-Audio: Piper mit Phonem-Ausrichtung → exakte Wortzeiten, Jahreszahlen und Daten sprechgerecht; 236 Aufnahmen (21,7 Minuten, 6,9 MB) erzeugt und geprüft. |
| 17.11.2026 | 23:30–23:45 | App-Kern ohne Framework: Speicher mit Rückfall, Einstellungen (einfache Sprache, Tempo, Kontrast, Schrift, Bewegung), Vorlesefunktion mit Wortmarkierung und Web-Speech-Rückfall, Hash-Router mit Fokus- und Titelverwaltung, Datenmodell nur auf Gruppenebene. |
| 17.11.2026 | 23:35–23:48 | Eigene Grafiken: Erzählfigur Gurri (drei Stimmungen), sechs Fundstücke (SVG und Canvas aus einer Quelle), zwei Wimmelbilder, Ortsbilder, Karten- und Spielsymbole, App-Symbole. Vier Spieltypen: Spurensuche (Bild und Liste), Zuordnen, Zeitstrahl, Schätzfrage im Team. |
| 17.11.2026 | 23:45–23:58 | Item-Collage (Mosaik, Rosette, Raster; deterministischer Startwert), PNG 2048 × 2048, WebP-Vorschau mit eigenem VP8L-Kodierer für Safari, JSON-Metadaten, Neuerzeugung aus JSON; Lehrkräfte-Ansicht F1–F8, Bildbeitrags-Freigabe, QR-Ortsbeweis; Startklar-Check, Service Worker mit Teilantworten für Audio, Manifest, Erklärung zur Barrierefreiheit, Datenschutz, Impressum. |
| 17./18.11.2026 | 23:56–00:12 | Sichtprüfung aller Bildschirme, Gestaltungskorrekturen (Karte, Startseite, Sprechblasen, Rollenkarten, Kopfzeile auf Smartphones); Prüfsuite mit Playwright und axe-core 4.14.1 (drei Gerätegrößen, Tastatur, Offline, Collage, Kontraste, Zielgrößen, Umbruch bei 320 px). |
| 18.11.2026 | 00:08–00:20 | Befunde behoben (Kontrast im Kontrastmodus, Zielgröße Dateiauswahl, Umbruch bei 320 px, Tabellen-Container); WebP-Kodierer gegen libwebp geprüft (pixelgleich); Gegenprobe mit WebKit (Safari-Engine) inklusive Offline-Betrieb; Quellenverzeichnis, README, Inhaltslizenz. |
| 18.11.2026 | 00:19–00:24 | Abschlussprüfung (Chrome: 117 Bildschirme, 0 axe-Verstöße A/AA; Tastatur, Offline, Collage, Kontraste, Zielgrößen, Umbruch bestanden; WebKit-Gegenprobe bestanden), Berichte in `_qa/`, Paketliste und Service Worker final erzeugt. |

**Gesamte Bauzeit:** 17.11.2026, 22:59 Uhr bis 18.11.2026, 00:24 Uhr (rund 1 Stunde 25 Minuten).

### Enthalten

- 3 Quest-Orte, 6 Minigames, 4 Spieltypen, 6 feste Fundstücke, Sammelalbum, illustrierte Karte mit Listenansicht.
- Vorlesefunktion (236 Aufnahmen, Wortmarkierung, Tempo 0,75–1,5), einfache Sprache, Kontrastmodus, drei Schriftgrößen.
- Item-Collage mit PNG, WebP und JSON; simulierte Freigabe durch die Lehrkraft.
- Lehrkräfte-Ansicht (F1–F8) mit Kompetenzraster, Formulierungsentwürfen und druckbarem Gruppenbericht.
- Offline-Betrieb (Service Worker, Startklar-Check), Web-App-Manifest.
- Open Source: EUPL-1.2 (Code), CC BY-SA 4.0 (Inhalte), Quellenverzeichnis.
