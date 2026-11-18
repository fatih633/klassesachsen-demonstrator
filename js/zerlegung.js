// Zerlegung eines Textbausteins in Wörter – identisch zu tools/tts/baue_audio.py.
// Gruppen [anzeige|gesprochen] legen fest, was angezeigt und was gesprochen wird
// (z. B. „[9.|neunten]“ oder „[−|minus]“). Getrennt wird an Leerraum außerhalb der Klammern.

export function zerlegeVoll(text) {
  const tokens = [];
  let anz = '';
  let spr = '';
  let hat = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '[') {
      const j = text.indexOf(']', i);
      const inhalt = text.slice(i + 1, j);
      const strich = inhalt.indexOf('|');
      const a = strich >= 0 ? inhalt.slice(0, strich) : inhalt;
      const g = strich >= 0 ? inhalt.slice(strich + 1) : a;
      anz += a;
      spr += g;
      hat = true;
      i = j;
      continue;
    }
    if (/\s/.test(c)) {
      if (hat) { tokens.push({ a: anz, s: spr }); anz = ''; spr = ''; hat = false; }
      continue;
    }
    anz += c;
    spr += c;
    hat = true;
  }
  if (hat) tokens.push({ a: anz, s: spr });
  return tokens;
}

export function zerlege(text) {
  return zerlegeVoll(text || '').map((t) => t.a);
}
