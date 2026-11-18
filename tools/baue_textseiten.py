#!/usr/bin/env python3
"""Erzeugt die statischen Textseiten (Barrierefreiheit, Datenschutz, Impressum) mit gemeinsamem Kopf und Fuß.
Aufruf: python3 tools/baue_textseiten.py"""
import pathlib

WURZEL = pathlib.Path(__file__).resolve().parents[1]
STAND = "18. November 2026"

KOPF = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{titel} – klasseSachsen – Demonstrator</title>
  <meta name="theme-color" content="#2350A8">
  <meta name="referrer" content="no-referrer">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <link rel="stylesheet" href="css/app.css">
  <script type="module" src="js/seite.js"></script>
</head>
<body>
  <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
  <header class="kopf">
    <div class="kopf__innen">
      <a class="marke" href="index.html#/" aria-label="klasseSachsen – Demonstrator, zur Startseite">
        <span class="marke__bild" aria-hidden="true" id="marke-bild"></span>
        <span class="marke__text">klasse<b>Sachsen</b></span>
        <span class="marke__tag">Demonstrator</span>
      </a>
      <div class="kopf__werkzeuge">
        <button type="button" class="knopf knopf--klein knopf--zweit" id="seite-vorlesen" aria-pressed="false">Seite vorlesen</button>
        <a class="knopf knopf--klein" href="index.html#/">Zur App</a>
      </div>
    </div>
  </header>
  <main id="inhalt" class="haupt textseite" tabindex="-1">
"""

FUSS = """  </main>
  <footer class="fuss">
    <div class="fuss__innen">
      <p class="fuss__hinweis">Demonstrator der N.A.I.L.A. UG (haftungsbeschränkt) im Vergabeverfahren klasseSachsen. Keine Anwendung der Staatlichen Schlösser, Burgen und Gärten Sachsen gGmbH.</p>
      <nav aria-label="Rechtliches und Informationen">
        <ul class="fuss__links">
          <li><a href="barrierefreiheit.html"{a1}>Erklärung zur Barrierefreiheit</a></li>
          <li><a href="datenschutz.html"{a2}>Datenschutz</a></li>
          <li><a href="impressum.html"{a3}>Impressum</a></li>
          <li><a href="index.html#/ueber">Offener Quellcode und Lizenzen</a></li>
        </ul>
      </nav>
    </div>
  </footer>
</body>
</html>
"""

BARRIEREFREIHEIT = f"""
    <h1>Erklärung zur Barrierefreiheit</h1>
    <p>Die N.A.I.L.A. UG (haftungsbeschränkt) möchte diesen Demonstrator für alle Kinder und Lehrkräfte zugänglich machen. Grundlage ist die Richtlinie (EU) 2016/2102 mit dem Prüfmaßstab <strong>WCAG 2.1, Stufe AA</strong> (in Deutschland umgesetzt über die BITV 2.0 und die harmonisierte Norm EN 301 549).</p>

    <h2>Geltungsbereich</h2>
    <p>Diese Erklärung gilt für den Demonstrator „klasseSachsen“ mit allen Seiten: Lernendenbereich (Karte, Orte, sechs Minigames, Album, Bildbeitrag), Lehrkräfte-Ansicht, Startklar-Check sowie diese Textseiten.</p>

    <h2>Stand der Vereinbarkeit</h2>
    <p>Der Demonstrator ist nach unserer Selbstbewertung <strong>weitgehend vereinbar</strong> mit WCAG 2.1 Stufe AA. Die automatische Prüfung meldet auf allen geprüften Bildschirmen keine Verstöße der Stufen A und AA. Die unten genannten Einschränkungen betreffen Inhalte, für die wir gleichwertige Alternativen anbieten oder die außerhalb unseres Einflusses liegen. Eine Prüfung durch eine unabhängige Prüfstelle steht noch aus.</p>

    <h2>Was wir umgesetzt haben</h2>
    <ul>
      <li><strong>Vorlesefunktion</strong> für alle Texte im Lernendenbereich: vorproduzierte Aufnahmen (Piper TTS, Stimme „thorsten“) in beiden Sprachstufen, offline nutzbar, Tempo 0,75- bis 1,5-fach, mit Markierung des gerade gelesenen Wortes. Auf den übrigen Seiten liest die Gerätestimme vor.</li>
      <li><strong>Einfache Sprache</strong> als eigene Textfassung, jederzeit oben umschaltbar.</li>
      <li><strong>Hoher Kontrast</strong> (Schwarz, Weiß, Gelb) und <strong>drei Schriftgrößen</strong>; die Darstellung passt sich an, ohne waagerechtes Scrollen bei 320 Pixel Breite (Ausnahme: das Wimmelbild, siehe unten).</li>
      <li>Alles ist <strong>per Tastatur</strong> bedienbar, mit gut sichtbarem Fokusrahmen und einem Link „Zum Inhalt springen“. Nach jedem Seitenwechsel springt der Fokus auf die Überschrift.</li>
      <li><strong>Keine Bedienung nur per Ziehen oder Wischen</strong>: Der Zeitstrahl nutzt Knöpfe „nach oben“ und „nach unten“, Zuordnen funktioniert per Tippen auf Karte und Korb.</li>
      <li><strong>Kein Zeitdruck</strong>, keine Punkte, keine blinkenden Inhalte. Bewegungen lassen sich abschalten; die Systemeinstellung „Bewegung reduzieren“ wird beachtet.</li>
      <li>Bedienelemente sind mindestens 44 × 44 Pixel groß. Texte haben mindestens ein Kontrastverhältnis von 4,5 : 1.</li>
      <li>Semantisches HTML mit Sprachangabe Deutsch, Überschriftenstruktur, beschrifteten Formularfeldern, Textalternativen für Grafiken und Ansagen für Bildschirmleser bei Rückmeldungen.</li>
    </ul>

    <h2>Bekannte Einschränkungen</h2>
    <ul>
      <li><strong>Spurensuche (Wimmelbild):</strong> Das Suchen im Bild ist eine visuelle Aufgabe. Als gleichwertige Alternative gibt es die Darstellung „Liste“ und eine Bildbeschreibung; dann wählt die Gruppe das passende Ding aus der Liste. Auf sehr schmalen Bildschirmen lässt sich das Bild seitlich verschieben, damit alle Ziele groß genug bleiben.</li>
      <li><strong>Karte:</strong> Auf iPad und Mac erreicht Safari Links in Grafiken nur, wenn „Mit Tabulatortaste alle Objekte hervorheben“ eingeschaltet ist. Die Darstellung „Liste“ bietet dieselben Orte als normale Links.</li>
      <li><strong>Wortmarkierung mit der Gerätestimme:</strong> Bei vorproduziertem Audio wird jedes Wort markiert. Liest die Gerätestimme (Lehrkräfte-Ansicht, Textseiten oder Rückfall), hängt die Markierung vom Browser ab.</li>
      <li><strong>Erster Ton auf iPad:</strong> iPadOS erlaubt Audio erst nach einer ersten Berührung. „Automatisch vorlesen“ startet deshalb nach dem ersten Tippen.</li>
      <li><strong>Bildbeitrag:</strong> Die Collage hat eine Textbeschreibung (Vorlage, Fundstücke, Farbstimmung). Die heruntergeladenen Bilddateien selbst enthalten keine Textalternative; diese steht in der mitgelieferten JSON-Datei.</li>
      <li><strong>Einfache Sprache ist keine geprüfte Leichte Sprache.</strong> Gebärdensprach-Videos bietet der Demonstrator nicht an.</li>
    </ul>

    <h2>Wie wir geprüft haben</h2>
    <ul>
      <li>Automatische Prüfung mit <strong>axe-core 4.14</strong> (Regeln WCAG 2.0/2.1, Stufen A und AA) auf allen Bildschirmen, jeweils in drei Größen (iPad quer 1024 × 768, iPad hoch 768 × 1024, Smartphone 390 × 844), zusätzlich im Kontrastmodus und mit großer Schrift.</li>
      <li>Durchspielen einer kompletten Quest <strong>nur mit der Tastatur</strong> (automatisiert mit Playwright und Chrome) sowie eine Gegenprobe aller Spieltypen mit der Safari-Engine WebKit.</li>
      <li>Stichprobenartige <strong>Kontrastmessung</strong> der Farbpaare nach WCAG-Formel.</li>
      <li>Sichtprüfung aller Bildschirmfotos auf Lesbarkeit, Zielgrößen und Umbruch.</li>
      <li>Stand der Prüfung: {STAND}. Bericht: Ordner <code>_qa</code> im Quellcode.</li>
    </ul>

    <h2>Feedback und Kontakt</h2>
    <p>Sie sind auf eine Barriere gestoßen? Schreiben Sie uns bitte. Wir antworten so schnell wie möglich und beheben gemeldete Mängel zeitnah:</p>
    <p><a class="knopf knopf--klein" href="mailto:info@naila.pro?subject=Barriere%20im%20klasseSachsen-Demonstrator">E-Mail an info@naila.pro</a></p>
    <p>Bitte nennen Sie die Seite (zum Beispiel „Spurensuche Meißen“), das Gerät und den Browser.</p>

    <h2>Hinweis zum Durchsetzungsverfahren</h2>
    <p>Dieser Demonstrator ist ein Angebotsbestandteil eines privaten Unternehmens und keine Anwendung einer öffentlichen Stelle. Für die spätere Anwendung erstellen wir eine eigene Erklärung zur Barrierefreiheit mit dem Durchsetzungsverfahren, das für öffentliche Stellen in Sachsen gilt.</p>

    <p class="klein">Erstellt am {STAND} auf Grundlage einer Selbstbewertung.</p>
"""

DATENSCHUTZ = """
    <h1>Datenschutz</h1>
    <div class="karte-box karte-box--gruen stapel">
      <h2 style="margin-top:0">Kurz gesagt</h2>
      <ul>
        <li>Keine Cookies, kein Tracking, keine Analyse-Werkzeuge, keine Werbung.</li>
        <li>Keine Anmeldung, keine Namen, keine Standortdaten, keine Geräte-Kennungen.</li>
        <li>Keine Server-Speicherung: Alle Spielstände und Beobachtungen bleiben nur auf diesem Gerät.</li>
        <li>Sie können alles jederzeit selbst löschen – mit dem Knopf unten.</li>
      </ul>
    </div>

    <h2>Verantwortlich</h2>
    <p>N.A.I.L.A. UG (haftungsbeschränkt), Langer-See-Str. 9, 13599 Berlin<br>E-Mail: <a href="mailto:info@naila.pro">info@naila.pro</a></p>

    <h2>Was auf diesem Gerät gespeichert wird</h2>
    <p>Der Demonstrator nutzt den lokalen Speicher des Browsers (localStorage) und für den Offline-Betrieb den Cache-Speicher. Diese Daten verlassen das Gerät nicht:</p>
    <ul>
      <li><strong>Einstellungen:</strong> Sprachstufe, Vorlesetempo, Kontrast, Schriftgröße.</li>
      <li><strong>Spielstand:</strong> gesammelte Fundstücke und erreichte Stationen („Station erreicht“, ohne Ort und ohne Uhrzeit).</li>
      <li><strong>Gruppen (nur in der Lehrkräfte-Ansicht):</strong> die frei gewählte Gruppenbezeichnung, die Freigabe und – nur bei Lerngruppen der Klassen 4 bis 10 – grobe Ereignisse der Gruppe: Station begonnen oder abgeschlossen, Anzahl der Versuche, genutzte Hilfen mit Zeitpunkt, Eingaben je Rollenposition, bestätigte Gruppenentscheidungen, aktive Bearbeitungszeit, Offline-Phasen. Es gibt keine Daten zu einzelnen Kindern und keine Zuordnung von Kindern zu Gruppen.</li>
      <li><strong>Bildbeiträge:</strong> nur die Kennungen der gewählten Fundstücke und die Reglerwerte. Das Bild wird daraus jedes Mal neu erzeugt.</li>
      <li><strong>Offline-Dateien:</strong> App, Questpakete und Vorlese-Audio im Cache, damit alles ohne Internet funktioniert.</li>
    </ul>
    <p>Gruppendaten löscht die App automatisch zwölf Wochen nach Abschluss der Quest, spätestens zum Ende des Schuljahres. Lehrkräfte können Gruppen jederzeit vorzeitig löschen.</p>

    <h2>Was nicht gespeichert wird</h2>
    <p>Namen, Pseudonyme oder Merkmale einzelner Kinder, Standortdaten, Ton-, Bild- oder Videoaufnahmen, Geräte-Kennungen und Freitexte von Kindern. Die heruntergeladenen Bildbeiträge enthalten keine Namen und keine Gruppenbezeichnung.</p>

    <h2>Abruf der Seiten</h2>
    <p>Der Demonstrator liegt bei GitHub Pages, einem Dienst der GitHub, Inc. (San Francisco, USA). Beim Laden der Seiten erhält GitHub technisch notwendige Verbindungsdaten wie IP-Adresse, Zeitpunkt und angefragte Datei, um die Dateien auszuliefern. Nach eigenen Angaben protokolliert und speichert GitHub die IP-Adresse aus Sicherheitsgründen; wie lange, legt GitHub fest. Rechtsgrundlage ist unser berechtigtes Interesse, den Demonstrator sicher und frei zugänglich bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO). Für Übermittlungen in die USA stützt sich GitHub auf das EU-US Data Privacy Framework und auf Standardvertragsklauseln. Einzelheiten stehen in der Datenschutzerklärung von GitHub.</p>
    <p>Die App selbst überträgt keine Spiel-, Gruppen- oder Beobachtungsdaten und lädt nichts von fremden Servern nach – auch keine Schriften, Karten oder Skripte. Die spätere Anwendung für die Auftraggeberin betreiben wir in Rechenzentren in Deutschland.</p>

    <h2>Ihre Rechte</h2>
    <p>Sie haben nach der Datenschutz-Grundverordnung das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Widerspruch sowie das Recht, sich bei einer Aufsichtsbehörde zu beschweren, zum Beispiel bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit. Da die App keine Daten an uns überträgt, liegen uns keine Spieldaten vor; Sie können sie auf dem Gerät selbst einsehen und löschen.</p>

    <h2 id="loeschen">Daten auf diesem Gerät ansehen und löschen</h2>
    <div class="karte-box stapel">
      <div class="zeile">
        <button type="button" class="knopf knopf--klein knopf--zweit" id="daten-anzeigen">Gespeicherte Daten anzeigen</button>
        <button type="button" class="knopf knopf--klein knopf--rot" id="daten-loeschen">Alle Spieldaten löschen</button>
        <button type="button" class="knopf knopf--klein knopf--zweit" id="cache-loeschen">Auch Offline-Dateien entfernen</button>
      </div>
      <p id="daten-status" role="status" aria-live="polite"></p>
      <pre class="rohdaten" id="daten-ausgabe" hidden tabindex="0" aria-label="Gespeicherte Daten"></pre>
    </div>
"""

IMPRESSUM = """
    <h1>Impressum</h1>
    <p><strong>N.A.I.L.A. UG (haftungsbeschränkt)</strong><br>Langer-See-Str. 9<br>13599 Berlin</p>
    <p>Vertreten durch den Geschäftsführer Fatih Taşkaya</p>
    <p>Registergericht: Amtsgericht Charlottenburg, HRB 289994 B</p>
    <p>Telefon: <a href="tel:+4917655984980">+49 176 55984980</a><br>E-Mail: <a href="mailto:info@naila.pro">info@naila.pro</a></p>
    <p>Umsatzsteuer-Identifikationsnummer nach § 27 a Umsatzsteuergesetz: DE464467976</p>
    <h2>Verantwortlich für den Inhalt</h2>
    <p>Fatih Taşkaya, Anschrift wie oben.</p>
    <h2>Hinweis</h2>
    <p>Diese Seiten sind ein Demonstrator der N.A.I.L.A. UG (haftungsbeschränkt) im Vergabeverfahren „App-Entwicklung klasseSachsen“. Sie sind keine Anwendung der Staatlichen Schlösser, Burgen und Gärten Sachsen gGmbH. Alle Illustrationen, die Erzählfigur und die Texte sind eigene Werke (CC BY-SA 4.0); Quellen der Sachinformationen stehen in der Datei QUELLEN.md.</p>
"""

def schreibe(name, titel, inhalt, aktiv):
    a = {"a1": "", "a2": "", "a3": ""}
    a[aktiv] = ' aria-current="page"'
    (WURZEL / name).write_text(KOPF.format(titel=titel) + inhalt + FUSS.format(**a), encoding="utf-8")

schreibe("barrierefreiheit.html", "Erklärung zur Barrierefreiheit", BARRIEREFREIHEIT, "a1")
schreibe("datenschutz.html", "Datenschutz", DATENSCHUTZ, "a2")
schreibe("impressum.html", "Impressum", IMPRESSUM, "a3")
print("Textseiten geschrieben.")
