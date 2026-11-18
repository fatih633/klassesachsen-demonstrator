// Lokaler Speicher – nur auf diesem Gerät. Keine Cookies, keine Server.
// localStorage mit try/catch; fällt der Speicher aus (z. B. privater Modus mit
// gesperrtem Speicher), läuft die App mit einem Zwischenspeicher im Arbeitsspeicher weiter.

const PRAEFIX = 'ks.';
const ersatz = new Map();
let verfuegbar = true;

try {
  const probe = PRAEFIX + 'probe';
  window.localStorage.setItem(probe, '1');
  window.localStorage.removeItem(probe);
} catch {
  verfuegbar = false;
}

export function speicherVerfuegbar() {
  return verfuegbar;
}

export function lesen(schluessel, ersatzwert = null) {
  const k = PRAEFIX + schluessel;
  try {
    const roh = verfuegbar ? window.localStorage.getItem(k) : ersatz.get(k);
    if (roh == null) return ersatzwert;
    return JSON.parse(roh);
  } catch {
    return ersatzwert;
  }
}

export function schreiben(schluessel, wert) {
  const k = PRAEFIX + schluessel;
  const roh = JSON.stringify(wert);
  try {
    if (verfuegbar) window.localStorage.setItem(k, roh);
    else ersatz.set(k, roh);
    return true;
  } catch {
    ersatz.set(k, roh);
    return false;
  }
}

export function entfernen(schluessel) {
  const k = PRAEFIX + schluessel;
  try {
    if (verfuegbar) window.localStorage.removeItem(k);
  } catch { /* nichts zu tun */ }
  ersatz.delete(k);
}

/** Alle Einträge dieser App (für die Datenschutz-Ansicht „Was ist gespeichert?“). */
export function alleEintraege() {
  const aus = {};
  try {
    if (verfuegbar) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(PRAEFIX)) aus[k] = safeParse(window.localStorage.getItem(k));
      }
    }
  } catch { /* ignorieren */ }
  for (const [k, v] of ersatz) aus[k] = safeParse(v);
  return aus;
}

export function allesLoeschen() {
  try {
    if (verfuegbar) {
      const weg = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(PRAEFIX)) weg.push(k);
      }
      weg.forEach((k) => window.localStorage.removeItem(k));
    }
  } catch { /* ignorieren */ }
  ersatz.clear();
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return s; }
}
