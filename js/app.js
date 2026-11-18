// klasseSachsen – Demonstrator der N.A.I.L.A. UG (haftungsbeschränkt)
// Lizenz: EUPL-1.2 · Inhalte: CC BY-SA 4.0
import { initEinstellungen } from './einstellungen.js';
import { ladeInhalte } from './inhalt.js';
import { initVorlesen } from './vorlesen.js';
import { route, startRouter } from './router.js';
import { lesetexteAktualisieren } from './text.js';
import { automatischLoeschen, offlinePhase } from './daten.js';
import { gurriKopfSvg } from './grafik/figur.js';
import { icon } from './ui.js';

import { startAnsicht } from './ansichten/start.js';
import { gruppeAnsicht } from './ansichten/gruppe.js';
import { karteAnsicht } from './ansichten/karte.js';
import { ortAnsicht } from './ansichten/ort.js';
import { spielAnsicht } from './ansichten/spiel.js';
import { albumAnsicht } from './ansichten/album.js';
import { collageAnsicht } from './ansichten/collage.js';
import { startklarAnsicht } from './ansichten/startklar.js';
import { beweisAnsicht } from './ansichten/beweis.js';
import { lehrkraefteAnsicht } from './ansichten/lehrkraefte.js';
import { materialAnsicht } from './ansichten/material.js';
import { ueberAnsicht } from './ansichten/ueber.js';

async function start() {
  initEinstellungen();
  document.getElementById('marke-bild').innerHTML = gurriKopfSvg();
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  initVorlesen();

  try {
    await ladeInhalte();
  } catch (fehler) {
    document.getElementById('inhalt').textContent = 'Die Questpakete konnten nicht geladen werden. Bitte einmal mit Internet öffnen.';
    return;
  }
  automatischLoeschen();

  document.addEventListener('ks:einstellungen', (e) => {
    if (e.detail.geaendert.includes('einfach')) lesetexteAktualisieren();
  });
  window.addEventListener('offline', () => offlinePhase('beginn'));
  window.addEventListener('online', () => offlinePhase('ende'));

  route('/', startAnsicht);
  route('/gruppe', gruppeAnsicht);
  route('/karte', karteAnsicht);
  route('/ort/:id', ortAnsicht);
  route('/spiel/:id', spielAnsicht);
  route('/album', albumAnsicht);
  route('/collage', collageAnsicht);
  route('/startklar', startklarAnsicht);
  route('/beweis/:ort/:code', beweisAnsicht);
  route('/lehrkraefte', lehrkraefteAnsicht);
  route('/lehrkraefte/:reiter', lehrkraefteAnsicht);
  route('/lehrkraefte/:reiter/:id', lehrkraefteAnsicht);
  route('/material/qr', materialAnsicht);
  route('/ueber', ueberAnsicht);
  startRouter();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ohne SW läuft die App online weiter */ });
  }
}

start();
