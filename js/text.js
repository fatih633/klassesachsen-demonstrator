// Textbausteine: Zerlegung in Wörter (für die Wortmarkierung) und Lesetext-Bausteine
// mit Vorlese-Knopf. Die Zerlegung entspricht exakt tools/tts/baue_audio.py (zerlege).

import { h, icon } from './ui.js';
import { text as holeText, paketVon } from './inhalt.js';
import { einstellungen } from './einstellungen.js';
import { vorlesen, istAktiv } from './vorlesen.js';
import { zerlege } from './zerlegung.js';

export { zerlege };

/** Reiner Anzeigetext ohne Sprech-Markierungen. */
export function anzeigeText(roh) {
  return zerlege(roh || '').join(' ');
}

export function variante() {
  return einstellungen().einfach ? 'e' : 'n';
}

/** Anzeigetext eines Bausteins in der gewählten Sprachstufe. */
export function t(id) {
  const tx = holeText(id);
  if (!tx) return `[${id}]`;
  return anzeigeText(tx[variante()] || tx.n);
}

function fuelleWoerter(p, id) {
  const tx = holeText(id);
  const v = variante();
  const roh = tx ? (tx[v] || tx.n) : `[${id}]`;
  const woerter = zerlege(roh);
  p.textContent = '';
  woerter.forEach((w, i) => {
    if (i > 0) p.append(document.createTextNode(' '));
    const s = document.createElement('span');
    s.className = 'w';
    s.dataset.i = String(i);
    s.textContent = w;
    p.append(s);
  });
  p.dataset.variante = v;
  return woerter;
}

/**
 * Lesetext-Baustein: Text mit Vorlese-Knopf.
 * opts: { tag: 'p', klasse: '', gross: false, ohneKnopf: false, auto: false }
 */
export function lesetext(id, opts = {}) {
  const tag = opts.tag || 'p';
  const p = h(tag, { class: 'lesbar__text', 'data-text-id': id });
  const woerter = fuelleWoerter(p, id);
  const kurz = woerter.slice(0, 5).join(' ') + (woerter.length > 5 ? ' …' : '');
  const huelle = h('div', { class: 'lesbar' + (opts.gross ? ' lesbar--gross' : '') + (opts.klasse ? ' ' + opts.klasse : '') });
  if (!opts.ohneKnopf) {
    const b = h('button', {
      type: 'button',
      class: 'vorlesen-knopf',
      'aria-pressed': 'false',
      'aria-label': 'Vorlesen: ' + kurz,
      svg: icon('lautsprecher'),
      onclick: () => vorlesen(p, id, b),
    });
    b.dataset.vorlesenFuer = id;
    huelle.append(b);
  }
  huelle.append(p);
  if (opts.auto) huelle.dataset.auto = '1';
  return huelle;
}

/** Nach Umschalten der Sprachstufe alle sichtbaren Lesetexte neu füllen. */
export function lesetexteAktualisieren(wurzel = document) {
  wurzel.querySelectorAll('[data-text-id]').forEach((p) => {
    if (istAktiv(p)) return;
    const woerter = fuelleWoerter(p, p.dataset.textId);
    const knopf = p.parentElement && p.parentElement.querySelector('.vorlesen-knopf');
    if (knopf) knopf.setAttribute('aria-label', 'Vorlesen: ' + woerter.slice(0, 5).join(' ') + (woerter.length > 5 ? ' …' : ''));
  });
}

export { paketVon };
