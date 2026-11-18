// Questpakete laden (JSON, offline aus dem Cache des Service Workers).
// Ein Paket = Ort mit Minigames, Items und allen Texten in zwei Sprachstufen.

export const PAKETE = ['allgemein', 'meissen', 'freiberg', 'leipzig'];
export const ORTE = ['meissen', 'freiberg', 'leipzig'];

const texte = new Map();      // id -> { n, e }
const textPaket = new Map();  // id -> paketname
const orte = new Map();       // id -> ort
const spiele = new Map();     // id -> spiel (mit ort)
const items = new Map();      // id -> item (mit ort)
const reihenfolge = [];       // alle Spiel-IDs in fester Reihenfolge

export async function ladeInhalte() {
  const geladen = await Promise.all(PAKETE.map(async (name) => {
    const antwort = await fetch(`inhalt/${name}.json`);
    if (!antwort.ok) throw new Error(`Paket ${name} fehlt`);
    return antwort.json();
  }));
  for (const paket of geladen) {
    for (const [id, tx] of Object.entries(paket.texte || {})) {
      texte.set(id, tx);
      textPaket.set(id, paket.paket);
    }
    if (paket.ort) {
      const ort = { ...paket.ort, spiele: paket.spiele.map((s) => s.id), items: paket.items.map((i) => i.id) };
      orte.set(ort.id, ort);
      for (const s of paket.spiele) { spiele.set(s.id, { ...s, ort: ort.id }); reihenfolge.push(s.id); }
      for (const it of paket.items) items.set(it.id, { ...it, ort: ort.id });
    }
  }
}

export const text = (id) => texte.get(id);
export const paketVon = (id) => textPaket.get(id) || 'allgemein';
export const ort = (id) => orte.get(id);
export const alleOrte = () => ORTE.map((id) => orte.get(id)).filter(Boolean);
export const spiel = (id) => spiele.get(id);
export const alleSpiele = () => reihenfolge.map((id) => spiele.get(id));
export const item = (id) => items.get(id);
export const alleItems = () => alleSpiele().map((s) => items.get(s.item));

export const SPIELTYP = {
  spurensuche: { name: 'Spurensuche', kompetenz: 'Einblick gewinnen' },
  schaetzfrage: { name: 'Schätzfrage im Team', kompetenz: 'Kennen, Anwenden' },
  zeitstrahl: { name: 'Zeitstrahl', kompetenz: 'Kennen' },
  zuordnen: { name: 'Zuordnen', kompetenz: 'Anwenden' },
};
