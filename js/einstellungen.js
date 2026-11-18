// Anzeige- und Vorlese-Einstellungen. Werden nur lokal gespeichert.
import { lesen, schreiben } from './speicher.js';

const STANDARD = {
  einfach: false,
  tempo: 1,
  markierung: true,
  auto: false,
  geraetestimme: false,
  schrift: 'normal',
  kontrast: false,
  ruhig: false,
};

let aktuell = { ...STANDARD, ...(lesen('einstellungen', {}) || {}) };

export function einstellungen() {
  return aktuell;
}

export function setze(teil) {
  const vorher = aktuell;
  aktuell = { ...aktuell, ...teil };
  schreiben('einstellungen', aktuell);
  anwenden();
  const geaendert = Object.keys(teil).filter((k) => vorher[k] !== aktuell[k]);
  if (geaendert.length) document.dispatchEvent(new CustomEvent('ks:einstellungen', { detail: { geaendert } }));
}

export function anwenden() {
  const html = document.documentElement;
  html.classList.toggle('kontrast', !!aktuell.kontrast);
  html.classList.toggle('ruhig', !!aktuell.ruhig);
  html.classList.toggle('schrift-gross', aktuell.schrift === 'gross');
  html.classList.toggle('schrift-sehr-gross', aktuell.schrift === 'sehr-gross');
  html.classList.toggle('einfach', !!aktuell.einfach);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', aktuell.kontrast ? '#000000' : '#2350A8');
  const schalter = document.getElementById('schalter-einfach');
  if (schalter) schalter.setAttribute('aria-pressed', String(!!aktuell.einfach));
  const tempo = document.getElementById('vorleser-tempo');
  if (tempo) tempo.value = String(aktuell.tempo);
}

export function bewegungReduziert() {
  return aktuell.ruhig || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initEinstellungen() {
  anwenden();
  const schalter = document.getElementById('schalter-einfach');
  schalter.addEventListener('click', () => setze({ einfach: !aktuell.einfach }));

  const dlg = document.getElementById('dialog-einstellungen');
  const form = document.getElementById('form-einstellungen');
  const oeffnen = document.getElementById('knopf-einstellungen');

  const fuellen = () => {
    form.elements.einfach.checked = aktuell.einfach;
    form.elements.markierung.checked = aktuell.markierung;
    form.elements.auto.checked = aktuell.auto;
    form.elements.geraetestimme.checked = aktuell.geraetestimme;
    form.elements.kontrast.checked = aktuell.kontrast;
    form.elements.ruhig.checked = aktuell.ruhig;
    for (const r of form.querySelectorAll('input[name="tempo"]')) r.checked = Number(r.value) === Number(aktuell.tempo);
    for (const r of form.querySelectorAll('input[name="schrift"]')) r.checked = r.value === aktuell.schrift;
  };

  oeffnen.addEventListener('click', () => {
    fuellen();
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  });
  form.addEventListener('change', (e) => {
    const el = e.target;
    if (!el.name) return;
    if (el.type === 'checkbox') setze({ [el.name]: el.checked });
    else if (el.name === 'tempo') setze({ tempo: Number(el.value) });
    else if (el.name === 'schrift') setze({ schrift: el.value });
  });
  dlg.addEventListener('close', () => oeffnen.focus());

  const tempo = document.getElementById('vorleser-tempo');
  tempo.addEventListener('change', () => setze({ tempo: Number(tempo.value) }));
}
