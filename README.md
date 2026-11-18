# klasseSachsen – Demonstrator

Spielbarer, öffentlich nutzbarer Demonstrator der **N.A.I.L.A. UG (haftungsbeschränkt)** für das EU-Vergabeverfahren „App-Entwicklung klasseSachsen für die 5. Sächsische Landesausstellung“.

> Demonstrator der N.A.I.L.A. UG (haftungsbeschränkt) im Vergabeverfahren klasseSachsen. Keine Anwendung der Staatlichen Schlösser, Burgen und Gärten Sachsen gGmbH.

**Ausprobieren:** [klassesachsen.nailapro.de](https://klassesachsen.nailapro.de) – läuft im Browser, auch auf Tablet und Smartphone; nach dem Startklar-Check auch offline.

Der Demonstrator belegt prüfbar, was das Grobkonzept beschreibt: eine offline-fähige, barrierefreie Web-App ohne Tracking, offen lizenziert, mit Spielelementen für Gruppen der Klassen 4 bis 10 und einer Lehrkräfte-Ansicht, die beobachtet, aber nicht bewertet.

---

## Was der Demonstrator zeigt

Leitfrage **„Was ist sächsisch?“** – drei Orte mit gegensätzlichen Facetten Sachsens, frei wählbare Reihenfolge, eine Gruppe spielt gemeinsam an **einem** Gerät. Keine Punkte, keine Ranglisten, kein Zeitdruck.

| Ort | Minigame | Spieltyp | festes Fundstück |
|---|---|---|---|
| Meißen – Porzellan | Die Werkstatt in der Burg | Spurensuche (Wimmelbild, Klassenzimmer-Variante, optional QR-Ortsbeweis) | Porzellantasse |
| Meißen – Porzellan | Rezept für weißes Gold | Zuordnen | Porzellanteller |
| Freiberg – Silberbergbau | Wie lange gruben die Bergleute? | Schätzfrage im Team | Grubenlampe |
| Freiberg – Silberbergbau | Unter Tage | Spurensuche (Bergmannssprache) | Silbererz |
| Leipzig – Friedliche Revolution 1989 | Der Herbst 1989 | Zeitstrahl | Palmensäule |
| Leipzig – Friedliche Revolution 1989 | Wie viele waren es? | Schätzfrage im Team | Kerze |

Jedes Minigame (etwa 5–10 Minuten) hat:

- einen Einstieg mit **Rollenwechsel** (Navigation, Protokoll, Recherche) – Rollen sind Positionen am Gerät, keine Personen;
- **gestufte Hilfen**: Tipp 1, Tipp 2, Lösung zeigen;
- die Erzählfigur **Gurri**, eine selbstironische Stadttaube (eigene Vektorgrafik);
- ein **festes, nie zufälliges Fundstück** für das **Sammelalbum**.

Die Schätzfrage kennt **keine Einzeleingaben**: Die Gruppe berät, stellt **eine** gemeinsame Zahl ein, bestätigt ausdrücklich „Wir sind uns einig“ und sieht danach Lösung und Lösungsweg. Der Zeitstrahl wird mit Knöpfen „nach oben“/„nach unten“ sortiert, Zuordnen funktioniert per Tippen auf Karte und Korb – nirgends ist Ziehen nötig.

Die **Karte** ist eine eigene, vereinfachte Sachsen-Karte als SVG (Umriss: Natural Earth, gemeinfrei) und lässt sich jederzeit als **Liste** bedienen.

**Bildbeitrag (Item-Collage):** Nach der letzten freigegebenen Quest wählt die Gruppe Fundstücke, eine Vorlage (Mosaik, Rosette, Raster) und stellt Regler für Anordnung, Größe und Farbstimmung ein. Ein regelbasierter Generator (Canvas, ohne KI) erzeugt

- ein **PNG mit 2048 × 2048 Pixeln**,
- eine **WebP-Vorschau** (512 × 512; in Safari mit eigenem verlustfreiem VP8L-Kodierer, weil Safari kein WebP aus dem Canvas erzeugt),
- **JSON-Metadaten** (Kennung, Zeitpunkt, Erzeugungsart „regelbasiert“, Item-Kennungen, Reglerwerte, Startwert, SHA-256 des PNG) – **ohne Namen und ohne Gruppenbezeichnung**.

Jedes Bild ist aus Item-Kennungen und Reglerwerten deterministisch neu erzeugbar; die Funktion „Bild aus Metadaten neu erzeugen“ beweist das mit identischer Prüfsumme. Die Freigabe durch die Lehrkraft ist simuliert.

**Startklar-Check:** zeigt grün, wenn App, alle drei Questpakete und das komplette Vorlese-Audio auf dem Gerät sind (Service Worker, Cache), und fordert dauerhaften Speicher an.

## Umsetzung von Grobkonzept und Anlage 2

### Grundsätze der Anlage 2

| Grundsatz | Umsetzung im Demonstrator |
|---|---|
| **G1 – ausschließlich Gruppenebene** | Es gibt nur Gruppen-Datensätze (`js/daten.js`). Kein Kind hat einen Datensatz, auch nicht vorübergehend; keine Namen, keine Zuordnung Kind → Gruppe. Die Schätzfrage hat **eine** gemeinsame Eingabe statt Einzeleingaben. |
| G2 – keine Einzelbewertung | Keine Funktion erfasst, vergleicht oder exportiert Einzelleistungen. |
| G3 – keine Note, keine Punktzahl, kein Ranking | Keine Punkte im Spiel, keine Rangfolge zwischen Gruppen, nur beschreibende Ausgaben; fester Hinweis „Beobachtung, keine Bewertung“. |
| G4 – Prozess vor Ergebnis | Erfasst werden Vorgehen und Hilfen (Versuche, Tipps mit Zeitpunkt, Vorgehenswechsel nach Fehlversuch, Gruppenentscheidungen). |
| Abschnitt 2 – nur Kernzielgruppe | Bei der Freigabe wählt die Lehrkraft die Klassenstufe. Außerhalb von Klasse 4–10 entsteht **kein** Beobachtungsdatensatz. |
| 4.3 – nicht erfasst | keine Standortdaten (QR-Ortsbeweis speichert nur „Station erreicht“), keine Ton-/Bildaufnahmen, keine Geräte-IDs, keine Freitexte von Kindern. |
| 4.4 – Löschung | automatisch 12 Wochen nach Abschluss bzw. zum Schuljahresende (geprüft bei jedem Start), jederzeit vorzeitig durch die Lehrkraft. |

Erfasste Ereignisse (Demo-Form von E1–E10): Beginn/Abschluss je Station mit Zeitstempel (E1), Status (E2), Lösungsversuche (E3), Lösungsweg der Schätzfrage (E4), Hilfen mit Zeitpunkt (E5), Vorgehenswechsel nach Fehlversuch (E6), Eingaben je Rollenposition (E7), bestätigte Gruppenentscheidungen (E8), aktive Bearbeitungszeit (E9), Offline-Phasen (E10).

### Lehrkräfte-Ansicht (F1–F8 in Demo-Form, Daten nur lokal)

| Funktion | Umsetzung |
|---|---|
| F1 Gruppenverwaltung | Anlegen mit Vorschlagsliste neutraler Bezeichnungen; bei freier Bezeichnung Hinweis **vor dem Speichern** plus Bestätigung „keine Namen von Kindern“; Umbenennen, Löschen. |
| F2 Questfreigabe | Orte freigeben, Lerngruppe (Klassenstufe) wählen, Prüfung der Kernzielgruppe; Bestätigung der Einwilligungen (Pilotbetrieb bis Schullogin). |
| F3 Laufende Übersicht | Tabelle Gruppen × Stationen mit Status, ohne Niveaustufen; aktualisiert sich live. |
| F4 Gruppenansicht | Indikatoren gegliedert nach Teamleistung, Problemlösung, Beteiligung, dazu Kontext und Technik; „So entstehen diese Angaben“. |
| F5 Kompetenzraster | Drei Niveaustufen („erste Schritte“, „auf dem Weg“, „sicher unterwegs“) mit ausformulierten Beschreibungen je Indikatorgruppe; die Lehrkraft wählt, regelbasierte Hinweise sind nur eine Hilfe. |
| F6 Gruppenbericht | Druck bzw. PDF über `window.print()` mit eigener Druck-CSS (Quest, Datum, Niveaustufen, Beschreibungen, Entwurf, ohne Ziffernnoten). |
| F7 Formulierungsentwürfe | regelbasiert aus Niveaustufen und Beobachtungen, deutlich als **Entwurf** gekennzeichnet, frei bearbeitbar. |
| F8 Löschfunktion | vorzeitige Löschung je Gruppe mit Rückfrage; zusätzlich „Alle Daten löschen“ auf der Datenschutzseite. |

Außerdem: Bildbeiträge einzeln oder gesammelt freigeben bzw. Freigabe verweigern; druckbare QR-Codes für den Ortsbeweis; Werkzeuge für Prüfende (synthetische Beispielgruppen, alle Fundstücke freischalten).

## Starten

Voraussetzung: Python 3 (für einen einfachen lokalen Webserver). Kein Build-Schritt nötig.

```bash
cd klasseSachsen-demonstrator
python3 -m http.server 8000
```

Dann im Browser **http://localhost:8000/** öffnen. Die veröffentlichte Fassung liegt bei GitHub Pages unter https://klassesachsen.nailapro.de (Datei `CNAME`). Service Worker und Offline-Betrieb funktionieren auf `localhost` und auf HTTPS-Adressen. Für die Veröffentlichung genügt jedes statische Hosting mit HTTPS.

Zielgeräte: Schul-iPad (Safari, iPadOS 18), Android-Tablet (Chrome) und Laptop. Automatisch geprüft mit **Chrome** (Playwright, auch mit Touch- und Mobil-Emulation) und mit der **WebKit-Engine** (Safari-Engine, Playwright-Build) – einschließlich Offline-Betrieb, Vorlese-Audio und Collage. Safari-Besonderheiten sind eingebaut: Audio-Entsperrung nach der ersten Berührung, Teilantworten (206) für Audio aus dem Cache, eigener WebP-Kodierer. Ein Test auf einem physischen iPad steht noch aus.

## Ordnerstruktur

```
index.html                 App (Lernendenbereich, Lehrkräfte-Ansicht, Startklar-Check)
barrierefreiheit.html      Erklärung zur Barrierefreiheit
datenschutz.html           Datenschutz, Daten ansehen und löschen
impressum.html             Impressum
manifest.webmanifest       Web-App-Manifest (Installation auf dem Home-Bildschirm)
sw.js, precache.json       Service Worker und Paketliste (erzeugt von tools/baue_precache.py)
css/app.css                Gestaltung inkl. Kontrastmodus, Schriftgrößen, Druck-CSS
js/                        ES-Module ohne Framework
  app.js, router.js        Start, Hash-Router mit Fokus- und Titelverwaltung
  daten.js, speicher.js    Datenmodell (nur Gruppenebene), localStorage mit try/catch
  einstellungen.js         Einfache Sprache, Tempo, Kontrast, Schrift, Bewegung
  vorlesen.js, text.js,    Vorlesefunktion mit Wortmarkierung, Textbausteine
  zerlegung.js
  ansichten/               Bildschirme (Start, Karte, Ort, Spiel, Album, Collage, Lehrkräfte …)
  spiele/                  vier Spieltypen: spurensuche, schaetzfrage, zeitstrahl, zuordnen
  grafik/                  eigene SVG-Grafiken: Gurri, Fundstücke, Wimmelbilder, Karte, Symbole
  collage/                 regelbasierter Generator, WebP-Kodierer (VP8L)
  vendor/                  qrcode-generator (MIT)
inhalt/                    Questpakete als JSON (Texte in Standard- und einfacher Sprache)
audio/                     Vorlese-Audio (MP3) und Wortzeiten (zeiten.json) je Paket
fonts/, img/               Schriften (OFL) und App-Symbole
tools/                     Bau- und Prüfwerkzeuge (nicht Teil der App)
  tts/baue_audio.py        Vorlese-Audio mit Piper TTS erzeugen
  baue_precache.py         Paketliste und Service Worker erzeugen
  baue_symbole.py          App-Symbole rendern
  baue_textseiten.py       Textseiten erzeugen
  karte/sachsen_umriss.py  Kartenumriss aus Natural Earth vereinfachen
  qa/                      Playwright- und axe-Prüfung, Berichte, WebP-Test
_qa/                       Prüfberichte und Übersichtsbilder (Bildschirmfoto-Ordner nur lokal, siehe .gitignore)
```

## Barrierefreiheit (WCAG 2.1 AA)

- **Vorlesefunktion** für alle Texte im Lernendenbereich: 236 vorproduzierte Aufnahmen mit **Piper TTS** und der Stimme `de_DE-thorsten-medium` (Datensatz CC0) in beiden Sprachstufen, offline nutzbar, Tempo 0,75- bis 1,5-fach (tonhöhenerhaltend), **Wortmarkierung** aus den Phonem-Ausrichtungen von Piper. Rückfall: Web Speech API (Gerätestimme) für Lehrkräfte-Ansicht und Textseiten oder auf Wunsch.
- **Einfache Sprache** als eigene Textfassung, oben jederzeit umschaltbar.
- **Kontrastmodus**, drei **Schriftgrößen**, Bewegungen abschaltbar, `prefers-reduced-motion` wird beachtet.
- Vollständig **per Tastatur** bedienbar, sichtbarer Fokus, Skip-Link, Fokus springt nach Seitenwechsel auf die Überschrift, Ansagen für Bildschirmleser.
- Keine Bedienung nur per Ziehen oder Gesten; Zielgrößen ≥ 44 × 44 px; Textkontrast ≥ 4,5 : 1.
- Semantisches HTML, `lang="de"`, ARIA nur wo nötig, Textalternativen und Bildbeschreibungen.
- Erklärung zur Barrierefreiheit: `barrierefreiheit.html` (Stand, Prüfmethode, bekannte Einschränkungen, Feedback an info@naila.pro).

## Datenschutz

Keine Cookies, kein Tracking, kein Analytics, keine Anmeldung, **keine Server-Speicherung**: Spielstände und Beobachtungen bleiben im `localStorage` des Geräts, Offline-Dateien im Cache. Zur Laufzeit gibt es keine Anfragen an fremde Server (keine CDN-Schriften, keine Kartendienste). Auf `datenschutz.html` lassen sich alle gespeicherten Daten ansehen und mit einem Knopf löschen.

## Lizenzen

- **Quellcode:** EUPL-1.2, vollständiger Lizenztext in `LICENSE`.
- **Inhalte** (Texte, Illustrationen, Erzählfigur, Fundstücke, Vorlese-Audio): **CC BY-SA 4.0**, siehe `LICENSE-CONTENT.md` (mit vollständigem Lizenztext).
- Fremdbausteine: Atkinson Hyperlegible und Fredoka (SIL OFL 1.1), qrcode-generator (MIT), Natural Earth (gemeinfrei). Prüfwerkzeuge (Playwright, axe-core) sind nicht Teil der App.

## Quellen

Alle Sachinformationen sind mit seriösen Quellen belegt: **`QUELLEN.md`** (Manufaktur Meissen, Staatliche Schlösser, Burgen und Gärten Sachsen, Stadt Freiberg, TU Bergakademie Freiberg, Kirchgemeinde St. Nikolai, Stadt Leipzig, bpb, Bundesregierung u. a.). Unsichere Details sind weggelassen.

## Werkzeuge und Prüfung

```bash
# Vorlese-Audio neu erzeugen (einmalig; benötigt: pip install piper-tts onnx, ffmpeg)
python3 tools/tts/baue_audio.py --modell de_DE-thorsten-medium.onnx
# Paketliste und Service Worker nach jeder Änderung neu erzeugen
python3 tools/baue_precache.py
# Prüfung: Bildschirmfotos in drei Größen, axe-core, Tastatur, Offline, Collage, Kontraste
python3 tools/qa/pruefung.py --axe node_modules/axe-core/axe.min.js && python3 tools/qa/bericht.py
python3 tools/qa/webp_test.py http://localhost:8000/ _qa
python3 tools/qa/webkit_test.py --axe node_modules/axe-core/axe.min.js   # Gegenprobe Safari-Engine
```

Ergebnisse stehen in `_qa/` (`qa-bericht.md`, `axe-bericht.md`, `kontraste.md`, Bildschirmfotos).

## Bekannte Grenzen des Demonstrators

- Keine Server-Komponente, keine Schullogin-Anbindung: Lehrkräfte-Ansicht und Spiel teilen sich die Daten eines Geräts (in mehreren Tabs live aktualisiert).
- Die Freigabe von Bildbeiträgen und die Bereitstellung an die Ausstellung sind simuliert.
- QR-Ortsbeweis: Der Code öffnet die App mit dem Beweis; installierte Home-Bildschirm-Apps haben auf iPadOS einen eigenen Speicher – zum Ausprobieren deshalb im Browser oder per Code-Eingabe.
- Die Zuordnung der Ereignisse zu Niveaustufen ist eine regelbasierte Beispiel-Logik; die fachliche Festlegung erfolgt im Projekt mit Fachdidaktik und Fokus-Lehrkräften.
