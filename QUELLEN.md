# Quellen der Sachinformationen

Jeder Fakt im Demonstrator wurde am 17.11.2026 an einer seriösen Quelle geprüft (Museum/Manufaktur, Stadt, Hochschule, Kirchgemeinde, Bundeszentrale für politische Bildung, Bundesregierung, offizielle Tourismusorganisationen). Unsichere Details wurden weggelassen oder vorsichtig formuliert (siehe Hinweise). Die Text-IDs verweisen auf die Bausteine in `inhalt/*.json`.

## Meißen – Porzellan

| Nr. | Fakt, wie im Demonstrator verwendet | Text-ID(s) | Quelle |
|---|---|---|---|
| M1 | Die Albrechtsburg steht auf einem Berg an der Elbe (der Elberadweg führt unterhalb des Burgbergs entlang). | `meissen.intro` | Tourismus Marketing Gesellschaft Sachsen: [Albrechtsburg Castle in Meissen](https://visitsaxony.com/poi/albrechtsburg-castle-in-meissen-meissen) |
| M2 | Die Albrechtsburg gilt als ältestes Schloss Deutschlands. | `meissen.intro` | Staatliche Schlösser, Burgen und Gärten Sachsen: [Albrechtsburg Meissen](https://www.schloesserland-sachsen.de/albrechtsburg-meissen) („ältestes Schloss Deutschlands“) |
| M3 | 1710 begann in der Albrechtsburg die erste Porzellanmanufaktur Europas (Gründung 23.01.1710, Produktionsbeginn 06.06.1710 in der Albrechtsburg). | `meissen.intro`, `meissen.item.tasse` | [MEISSEN – Geschichte](https://www.meissen.com/de/geschichte); [Erlebniswelt Meissen, Image-Broschüre](https://www.erlebniswelt-meissen.com/media/wysiwyg/PDF/Image_Broschuere.pdf) („der ersten Porzellanmanufaktur Europas“); [visitsaxony.com](https://visitsaxony.com/poi/albrechtsburg-castle-in-meissen-meissen) („the first European porcelain factory built here in 1710“) |
| M4 | Rund 150 Jahre lang wurde in der Burg Porzellan hergestellt (1710 bis 1863; Neubau im Triebischtal 1861–1864). | `meissen.intro` | [MEISSEN – Geschichte](https://www.meissen.com/de/geschichte) („For nearly 150 years, the Albrechtsburg served as the production site“) |
| M5 | Porzellan war kostbar und wurde auch „weißes Gold“ genannt. | `meissen.intro`, `meissen.zu.f.gold` | [Image-Broschüre Erlebniswelt Meissen](https://www.erlebniswelt-meissen.com/media/wysiwyg/PDF/Image_Broschuere.pdf) („das Geheimnis des ‚weißen Goldes‘“); [MEISSEN – Über die Manufaktur](https://meissen.com/de/uber-die-manufaktur) („White Gold“); [MEISSEN – Geschichte](https://www.meissen.com/de/geschichte) („precious Eastern porcelain“) |
| M6 | Beim letzten Brand (Glattbrand) wird das Porzellan bis zu 1.400 Grad heiß; danach ist es hart und glänzt (Glasur verbindet sich mit dem Scherben). | `meissen.sp.a1.fund` | [Image-Broschüre Erlebniswelt Meissen](https://www.erlebniswelt-meissen.com/media/wysiwyg/PDF/Image_Broschuere.pdf) (Glühbrand 950 °C, Glattbrand bis 1.400 °C) |
| M7 | Kaolin (Porzellanerde) ist der wichtigste Rohstoff; die Manufaktur holt ihn seit 1764 aus Seilitz, einem Dorf etwa 12 km von Meißen. | `meissen.sp.a2*`, `meissen.zu.*` | [MEISSEN – Kaolin & Mine](https://www.meissen.com/en/craft/kaolin) |
| M8 | Kobaltblau wird unter die Glasur gemalt, leuchtet erst nach dem Brand, Korrekturen sind nicht möglich; im frühen 18. Jahrhundert war es die einzige Unterglasurfarbe. | `meissen.sp.a3.fund`, `meissen.item.teller` | [MEISSEN – Unterglasurmalerei](https://www.meissen.com/de/craft/underglaze-painting); [Image-Broschüre](https://www.erlebniswelt-meissen.com/media/wysiwyg/PDF/Image_Broschuere.pdf) |
| M9 | Die Porzellanmasse besteht aus Kaolin, Feldspat und Quarz; die genaue Mischung ist ein gehütetes Geheimnis. | `meissen.zu.*` | [Image-Broschüre](https://www.erlebniswelt-meissen.com/media/wysiwyg/PDF/Image_Broschuere.pdf) („gehüteten Zusammensetzung aus Quarz, Feldspat und Kaolin“); [MEISSEN – Kaolin](https://www.meissen.com/en/craft/kaolin) |

## Freiberg – Silberbergbau

| Nr. | Fakt, wie im Demonstrator verwendet | Text-ID(s) | Quelle |
|---|---|---|---|
| F1 | „Glück auf!“ ist der Gruß der Bergleute; Freiberg nennt sich Silberstadt. | `freiberg.intro` | Stadt Freiberg: [Silberstadtmagazin 05/2024](https://freiberg.de/fileadmin/Flyer_Plakate/Prospekte_Tourismus/Silberstadtmagazin_05_2024_Web.pdf) („Glück auf! Der Gruß der Silberstadt“); [Welterbeflyer 2026](https://www.freiberg.de/fileadmin/Flyer_Plakate/Prospekte_Tourismus/Freiberg_Welterbeflyer_2026__final.pdf) |
| F2 | Die Bergakademie Freiberg wurde 1765 gegründet (21.11.1765) und gilt als älteste noch bestehende Hochschule für Bergbau (montanwissenschaftliche Hochschule) der Welt. | `freiberg.intro` | TU Bergakademie Freiberg: [A historical outline](https://tu-freiberg.de/en/university/history) |
| F3 | Seit 2019 gehört die Montanregion Erzgebirge/Krušnohoří zum UNESCO-Welterbe. | `freiberg.intro` | Stadt Freiberg: [Welterbeflyer 2026](https://www.freiberg.de/fileadmin/Flyer_Plakate/Prospekte_Tourismus/Freiberg_Welterbeflyer_2026__final.pdf) |
| F4 | Der Bergbau in Freiberg begann 1168; der Sage nach fanden Händler das erste Silber. | `freiberg.sf.t1` | Stadt Freiberg: [Welterbeflyer 2026](https://www.freiberg.de/fileadmin/Flyer_Plakate/Prospekte_Tourismus/Freiberg_Welterbeflyer_2026__final.pdf) („der Sage nach … Händler aus dem Harz fanden dort das erste Silber“) |
| F5 | 1969 wurde der (aktive) Bergbau eingestellt; rund 800 Jahre Bergbau, vor allem Silber. | `freiberg.sf.t2`, `freiberg.sf.loesung`, `freiberg.sf.rechenweg` | Stadt Freiberg: [Silberstadtmagazin 05/2024](https://freiberg.de/fileadmin/Flyer_Plakate/Prospekte_Tourismus/Silberstadtmagazin_05_2024_Web.pdf) („aktive Bergbau 1969 eingestellt“, „mehr als 800 Jahren Erzgewinnung“). **Hinweis:** Der Welterbeflyer 2026 nennt für den Silberabbau „1168 bis 1968“. Der Demonstrator spricht deshalb vom Bergbau (bis 1969) und rundet auf „rund 800 Jahre“. |
| F6 | „Hunt“: ein Kasten auf Rädern, mit dem das Erz nach über Tage gebracht wurde. | `freiberg.sp.a1*` | [Glossar „Grenzübergreifendes europäisches Welterbe“ für UNESCO-Projektschulen (Markus-Röhling-Stolln)](https://heritagestudies.eu/wp-content/uploads/2019/04/Glossar-Glossary-Glosář_de-en-cz.pdf) |
| F7 | „Fahrt“ heißt in der Bergmannssprache Leiter. | `freiberg.sp.a2*` | ebd. (Glossar: „Fahrt: Leiter“) |
| F8 | Ein Gang ist wie ein Riss im Gebirge, in dem sich Erz abgelagert hat; rund um Freiberg gab es reiche Erzgänge. | `freiberg.sp.a3*`, `freiberg.item.erz` | ebd. (Glossar: „Gang“); Stadt Freiberg: [Welterbeflyer 2026](https://www.freiberg.de/fileadmin/Flyer_Plakate/Prospekte_Tourismus/Freiberg_Welterbeflyer_2026__final.pdf) („reicher Erzgänge“) |
| F9 | „Geleucht“ ist das Wort der Bergleute für die Lampe. | `freiberg.sf.ende`, `freiberg.item.lampe` | ebd. (Glossar: „Geleucht: Lampe“) |
| F10 | Der Schlägel ist der Hammer der Bergleute; Schlägel und Eisen sind das Zeichen des Bergbaus. | `freiberg.sp.o.werkzeug` | Glossar (s. o.: „Schlegel: der im Bergbau verwendete Hammer“); Technisches Museum Wien, [Unterrichtsmaterial „Bergwerk“](https://www.technischesmuseum.at/uploads/Unterrichtsmaterial_de/Bergwerk%20fuenfte%20bis%20achte%20Schulstufe.pdf) („Symbol des Bergbaus. Schlägel und …“) |

## Leipzig – Friedliche Revolution 1989

| Nr. | Fakt, wie im Demonstrator verwendet | Text-ID(s) | Quelle |
|---|---|---|---|
| L1 | Seit 1982 finden in der Nikolaikirche Friedensgebete statt (erstes außerhalb der Friedensdekade im September 1982), seitdem jeden Montag um 17 Uhr. | `leipzig.intro`, `leipzig.zs.k.gebet` | Ev.-Luth. Kirchgemeinde St. Nikolai: [Friedensgebete](https://www.nikolaikirche.de/friedensgebet/friedensgebete/); [GHDI – R. Schröder, „Schwerter und Pflugscharen“ (FAZ 2014)](https://germanhistorydocs.org/de/zwei-deutsche-staaten-1961-1989/die-nikolaikirche-und-die-friedensgebete-rueckblick-2014) („an jedem Montag um 17 Uhr“); [evangelisch.de (2024)](https://www.evangelisch.de/inhalte/234836/08-10-2024/leipziger-nikolaikirche-wo-die-friedliche-revolution-begann) |
| L2 | Nikolaikirche und Nikolaikirchhof waren Ausgangspunkt der Friedlichen Revolution in der DDR. | `leipzig.intro` | Leipzig Tourismus und Marketing: [Nikolaikirchhof](https://www.leipzig.travel/en/poi/nikolaikirchhof) |
| L3 | Im Herbst 1989 zogen Tausende friedlich über den Leipziger Innenstadtring. | `leipzig.intro`, `leipzig.sf.t1` | [nikolaikirche.de – 9. Oktober](https://www.nikolaikirche.de/friedensgebet/9-oktober/) („tausende Menschen um den Leipziger Innenstadtring“); [evangelisch.de (2024)](https://www.evangelisch.de/inhalte/234836/08-10-2024/leipziger-nikolaikirche-wo-die-friedliche-revolution-begann) („friedlich“) |
| L4 | 4. September 1989: Nach dem Friedensgebet Transparente „Für ein offenes Land mit freien Menschen“; Stasi-Mitarbeiter zerstören sie. | `leipzig.intro`, `leipzig.zs.k.plakate` | Leipzig Tourismus und Marketing: [Recherchetext „Friedliche Revolution – Herbst 1989“](https://www.leipzig.travel/fileadmin/Mediendatenbank/4_B2B/2_Medien/1_Recherchetexte/Leipzig-Friedliche-Revolution-Herbst-1989-leipzig-travel.pdf) |
| L5 | Die Stasi war die Geheimpolizei der DDR. | `leipzig.zs.k.plakate` | Bundeszentrale für politische Bildung: [Stasi (Staatssicherheit der DDR)](https://www.bpb.de/kurz-knapp/lexika/das-junge-politik-lexikon/321190/stasi-staatssicherheit-der-ddr/) („Geheimdienst und Geheimpolizei der DDR“) |
| L6 | 9. Oktober 1989: mindestens 70.000 Menschen; Rufe „Wir sind das Volk“ und „Keine Gewalt“; die Sicherheitskräfte griffen nicht ein; die Menge zog über den Ring. | `leipzig.zs.k.ring`, `leipzig.sf.*` | bpb: [Ereignisse im Oktober 1989](https://www.bpb.de/themen/deutsche-teilung/ddr-kompakt/521600/ereignisse-im-oktober-1989/) („mindestens 70.000“); Bundesregierung: [Erster großer Sieg über die SED-Diktatur](https://www.bundesregierung.de/breg-de/schwerpunkte/deutsche-einheit/sieg-ueber-die-sed-diktatur-353726) (Stadtring, Rufe) |
| L7 | 9. November 1989: Die Mauer ist offen. 3. Oktober 1990: Wiedervereinigung (Deutsche Einheit). | `leipzig.zs.k.mauer`, `leipzig.zs.k.einheit`, `leipzig.zs.t2` | [Recherchetext Leipzig Tourismus](https://www.leipzig.travel/fileadmin/Mediendatenbank/4_B2B/2_Medien/1_Recherchetexte/Leipzig-Friedliche-Revolution-Herbst-1989-leipzig-travel.pdf) |
| L8 | In der Nikolaikirche tragen Säulen oben Palmwedel; eine Nachbildung steht seit 1999 auf dem Nikolaikirchhof und erinnert an den Weg der Demonstrierenden aus der Kirche in die Öffentlichkeit. | `leipzig.zs.ende`, `leipzig.item.saeule` | Leipzig Tourismus und Marketing: [Historische Orte](https://www.leipzig.travel/en/discover/culture/historical-sites) („the Nikolaisäule, erected in 1999, a replica of a column crowned with palm fronds from the nave“); Stadt Leipzig: [St Nicholas' Column](https://english.leipzig.de/services-and-administration/autumn-89/remembering/st-nicholas-column) |
| L9 | 1983 setzten sich in Leipzig Jugendliche nach einem Friedensgebet mit Kerzen auf den Markt. | `leipzig.sf.ende` | [GHDI – R. Schröder (FAZ 2014)](https://germanhistorydocs.org/de/zwei-deutsche-staaten-1961-1989/die-nikolaikirche-und-die-friedensgebete-rueckblick-2014) („Etwa 50 Jugendliche setzten sich auf dem Markt mit Kerzen in einem Kreis auf den Boden“) |
| L10 | Jedes Jahr am 9. Oktober erinnert das Lichtfest in Leipzig an den Herbst 1989. | `leipzig.item.kerze` | [nikolaikirche.de – Friedensgebete](https://www.nikolaikirche.de/friedensgebet/friedensgebete/) („ein Lichtfest auf dem Augustusplatz“) |

## Karte und Rechnungen

| Nr. | Inhalt | Quelle |
|---|---|---|
| K1 | Umriss des Freistaats Sachsen (vereinfacht) | [Natural Earth](https://www.naturalearthdata.com/), Admin 1 – States, Provinces (1:10 Mio.), gemeinfrei |
| K2 | Lage von Leipzig, Meißen, Freiberg, Dresden, Elbverlauf und Erzgebirge | gerundete WGS84-Koordinaten; Elbe vereinfacht nachgezeichnet (keine Sachaussage über Details) |
| K3 | Rechenwege der Schätzfragen: 1969 − 1168 = 801 ≈ 800; 70.000 : 25 = 2.800 | eigene Rechnung; „25 Kinder je Klasse“ ist eine ausdrücklich angenommene Rechengröße, keine Statistik |

## Bewusst weggelassen

- Genaue Jahreszahl des Auszugs der Manufaktur aus der Albrechtsburg (Quellen nennen 1863 bzw. Anfang der 1860er) – im Text steht deshalb „rund 150 Jahre“.
- Ende des Silberabbaus 1968 oder 1969 – im Text „rund 800 Jahre“, Rechnung mit dem Ende des Bergbaus 1969.
- Herkunft des Kaolins vor 1764 und Einzelheiten der Brennöfen in der Albrechtsburg.
- Zitate einzelner Personen aus dem Herbst 1989 sowie Kerzen speziell am 9. Oktober (dafür keine eindeutige Quelle gefunden).
