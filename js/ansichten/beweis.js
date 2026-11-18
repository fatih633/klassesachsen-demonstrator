// Ortsbeweis per QR-Code: Der Code am Ort öffnet diese Adresse. Gespeichert wird nur „Station erreicht“ –
// keine Standortdaten, keine Uhrzeit, kein Gerätebezug (Anlage 2, 4.3).
import { h, knopfLink } from '../ui.js';
import { seitenkopf, gurriBlase } from './teile.js';
import { ort as holeOrt } from '../inhalt.js';
import { ortsbeweisSetzen } from '../daten.js';

export function beweisAnsicht(main, { ort: ortId, code }) {
  const o = holeOrt(ortId);
  const ok = o && String(code).toUpperCase() === o.beweis.code;
  if (ok) ortsbeweisSetzen(ortId);
  main.append(
    seitenkopf(ok ? `Ortsbeweis: ${o.name}` : 'Ortsbeweis', { zurueck: { href: '#/karte', text: 'Zur Karte' } }),
    h('div', { class: 'stapel' },
      gurriBlase(ok ? 'beweis.ok' : 'beweis.falsch', ok ? 'freut' : 'denkt', { auto: true }),
      ok ? knopfLink({ href: `#/ort/${ortId}`, text: `Weiter nach ${o.name}`, symbol: 'weiter' }) : knopfLink({ href: '#/karte', text: 'Zur Karte', symbol: 'karte' })));
  return { titel: 'Ortsbeweis' };
}
