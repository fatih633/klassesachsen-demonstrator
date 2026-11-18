#!/usr/bin/env python3
"""Erzeugt das Vorlese-Audio fuer alle Textbausteine (einmaliger Bauschritt, offline nutzbar).

Stimme: Piper TTS, de_DE-thorsten-medium (Datensatz CC0, Modell MIT, rhasspy/piper-voices).
Fuer jeden Textbaustein und jede Sprachstufe (n = normal, e = einfache Sprache) entsteht
  audio/<paket>/<text-id>.<n|e>.mp3
sowie je Paket eine Zeitdatei audio/<paket>/zeiten.json mit Start/Ende jedes angezeigten
Wortes (Grundlage der Wortmarkierung). Die Zeiten stammen aus den Phonem-Ausrichtungen,
die Piper selbst liefert (include_alignments), nicht aus einer Schaetzung.

Aufruf:
  python3 tools/tts/baue_audio.py --modell <pfad/de_DE-thorsten-medium.onnx> [--nur <paket>]
Benoetigt: pip install piper-tts onnx ; ffmpeg mit libmp3lame.
"""
import argparse
import hashlib
import json
import math
import pathlib
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np
from piper import PiperVoice

WURZEL = pathlib.Path(__file__).resolve().parents[2]
INHALT = WURZEL / "inhalt"
AUDIO = WURZEL / "audio"
SATZPAUSE = 0.32  # Sekunden Stille zwischen Saetzen
BITRATE = "40k"
PUNKT = set(".,;:!?–-—…„“\"'()")

ZAHL = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn",
        "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"]
ZEHNER = {2: "zwanzig", 3: "dreißig", 4: "vierzig", 5: "fünfzig", 6: "sechzig", 7: "siebzig", 8: "achtzig", 9: "neunzig"}


def zwei_stellen(n: int) -> str:
    if n < 20:
        return ZAHL[n] if n != 1 else "eins"
    z, e = divmod(n, 10)
    if e == 0:
        return ZEHNER[z]
    einer = "ein" if e == 1 else ZAHL[e]
    return f"{einer}und{ZEHNER[z]}"


def jahr_als_wort(j: int) -> str:
    """Jahreszahlen so, wie man sie spricht: 1710 -> siebzehnhundertzehn."""
    if 1100 <= j <= 1999:
        h, rest = divmod(j, 100)
        s = ZAHL[h] + "hundert"
        if rest:
            s += zwei_stellen(rest) if rest != 1 else "eins"
        return s
    if 2000 <= j <= 2099:
        rest = j - 2000
        return "zweitausend" + (zwei_stellen(rest) if rest else "")
    return str(j)


JAHR_RE = re.compile(r"(?<![\d.])(1[1-9]\d\d|20\d\d)(?![\d])")


def sprechbar(teil: str) -> str:
    return JAHR_RE.sub(lambda m: jahr_als_wort(int(m.group(1))), teil)


def zerlege(text: str):
    """Teilt einen Text in Woerter (Tokens). Gleiches Verfahren wie js/text.js.

    Eine Gruppe [anzeige|gesprochen] gehoert zum Token, in dem sie steht. Getrennt wird an
    Leerraum ausserhalb eckiger Klammern. Rueckgabe: Liste (anzeige, gesprochen).
    """
    tokens = []
    anz, spr, puffer = [], [], []
    i = 0

    def flush_plain():
        if puffer:
            s = "".join(puffer)
            anz.append(s)
            spr.append(sprechbar(s))
            puffer.clear()

    while i < len(text):
        c = text[i]
        if c == "[":
            j = text.index("]", i)
            inhalt = text[i + 1 : j]
            a, _, g = inhalt.partition("|")
            flush_plain()
            anz.append(a)
            spr.append(g if g else sprechbar(a))
            i = j + 1
            continue
        if c.isspace():
            flush_plain()
            if anz:
                tokens.append(("".join(anz), "".join(spr)))
                anz, spr = [], []
            i += 1
            continue
        puffer.append(c)
        i += 1
    flush_plain()
    if anz:
        tokens.append(("".join(anz), "".join(spr)))
    return tokens


def phonem_woerter(stimme, text: str) -> int:
    """Wie viele gesprochene Woerter erzeugt espeak fuer diesen Text?"""
    saetze = stimme.phonemize(text)
    flach = " ".join("".join(s) for s in saetze if s)
    return len([w for w in flach.split(" ") if w.strip("".join(PUNKT) + "^$_")])


def synthese(stimme, sprechtext: str):
    """Audio (float32) und Liste der gesprochenen Woerter mit (start, ende) in Sekunden."""
    rate = stimme.config.sample_rate
    teile, woerter = [], []
    offset = 0.0
    for nr, chunk in enumerate(stimme.synthesize(sprechtext, include_alignments=True)):
        if nr > 0:
            stille = np.zeros(int(SATZPAUSE * rate), dtype=np.float32)
            teile.append(stille)
            offset += SATZPAUSE
        teile.append(chunk.audio_float_array)
        if chunk.phoneme_alignments:
            t = offset
            aktuell = None
            for al in chunk.phoneme_alignments:
                dauer = al.num_samples / rate
                ph = al.phoneme
                if ph == " ":
                    if aktuell:
                        woerter.append(aktuell)
                    aktuell = None
                elif ph in ("^", "$", "_") or all(ch in PUNKT for ch in ph):
                    pass
                else:
                    if aktuell is None:
                        aktuell = [t, t + dauer]
                    else:
                        aktuell[1] = t + dauer
                t += dauer
            if aktuell:
                woerter.append(aktuell)
        offset += len(chunk.audio_float_array) / rate
    audio = np.concatenate(teile) if teile else np.zeros(1, dtype=np.float32)
    return audio, woerter


def schreibe_mp3(audio: np.ndarray, rate: int, ziel: pathlib.Path):
    ziel.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tmp.name,
             "-ac", "1", "-ar", str(rate), "-codec:a", "libmp3lame", "-b:a", BITRATE,
             "-map_metadata", "-1", str(ziel)],
            check=True,
        )
        pathlib.Path(tmp.name).unlink()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modell", required=True)
    ap.add_argument("--nur", default=None)
    args = ap.parse_args()

    stimme = PiperVoice.load(args.modell, include_alignments=True)
    rate = stimme.config.sample_rate
    modell_kennung = pathlib.Path(args.modell).name
    bericht = {"gesamt": 0, "neu": 0, "ungefaehr": [], "sekunden": 0.0}

    for datei in sorted(INHALT.glob("*.json")):
        paket = json.loads(datei.read_text(encoding="utf-8"))
        name = paket["paket"]
        if args.nur and name != args.nur:
            continue
        zielordner = AUDIO / name
        zeitdatei = zielordner / "zeiten.json"
        alt = json.loads(zeitdatei.read_text(encoding="utf-8")).get("texte", {}) if zeitdatei.exists() else {}
        neu = {}
        for tid, varianten in paket["texte"].items():
            for v in ("n", "e"):
                text = varianten[v]
                tokens = zerlege(text)
                sprechtext = " ".join(s for _, s in tokens)
                schluessel = hashlib.sha1((modell_kennung + "|" + sprechtext).encode("utf-8")).hexdigest()[:16]
                mp3 = zielordner / f"{tid}.{v}.mp3"
                bericht["gesamt"] += 1
                if tid + "." + v in alt and alt[tid + "." + v].get("h") == schluessel and mp3.exists():
                    neu[tid + "." + v] = alt[tid + "." + v]
                    bericht["sekunden"] += alt[tid + "." + v]["d"]
                    continue
                audio, woerter = synthese(stimme, sprechtext)
                dauer = len(audio) / rate
                zaehl = [phonem_woerter(stimme, s) if s.strip("".join(PUNKT)) else 0 for _, s in tokens]
                zeiten = []
                ungefaehr = False
                if sum(zaehl) == len(woerter):
                    k = 0
                    for n in zaehl:
                        if n == 0:
                            zeiten.append(None)
                        else:
                            zeiten.append([round(woerter[k][0], 3), round(woerter[k + n - 1][1], 3)])
                            k += n
                else:
                    # Rueckfall: gleichmaessig nach Zeichenzahl verteilen und kennzeichnen
                    ungefaehr = True
                    laengen = [len(s) if z else 0 for (_, s), z in zip(tokens, zaehl)]
                    summe = sum(laengen) or 1
                    t = 0.15
                    nutz = max(dauer - 0.3, 0.1)
                    for l in laengen:
                        if l == 0:
                            zeiten.append(None)
                        else:
                            d = nutz * l / summe
                            zeiten.append([round(t, 3), round(t + d, 3)])
                            t += d
                    bericht["ungefaehr"].append(f"{tid}.{v} (Woerter {len(woerter)} / erwartet {sum(zaehl)})")
                schreibe_mp3(audio, rate, mp3)
                eintrag = {"d": round(dauer, 3), "n": len(tokens), "w": zeiten, "h": schluessel}
                if ungefaehr:
                    eintrag["u"] = 1
                neu[tid + "." + v] = eintrag
                bericht["neu"] += 1
                bericht["sekunden"] += dauer
                print(f"{name}: {tid}.{v}  {dauer:5.1f}s  {'(ungefaehr)' if ungefaehr else ''}", flush=True)
        # verwaiste Dateien entfernen
        for f in zielordner.glob("*.mp3"):
            if f.name[:-4] not in neu:
                f.unlink()
        zielordner.mkdir(parents=True, exist_ok=True)
        zeitdatei.write_text(json.dumps({"stimme": "Piper TTS, de_DE-thorsten-medium", "texte": neu},
                                        ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({k: (v if k != "sekunden" else round(v, 1)) for k, v in bericht.items()}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    sys.exit(main())
