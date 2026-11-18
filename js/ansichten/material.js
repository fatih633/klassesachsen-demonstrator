// Druckbare QR-Codes für den Ortsbeweis (zum Ausprobieren). Erzeugt lokal, ohne Online-Dienst.
import { h, knopf } from '../ui.js';
import { seitenkopf } from './teile.js';
import { alleOrte } from '../inhalt.js';
import qrcode from '../vendor/qrcode-generator.js';

function qrSvg(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + 4} ${y + 4}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + 8} ${n + 8}" xmlns="http://www.w3.org/2000/svg" role="img" shape-rendering="crispEdges"><title>QR-Code</title><rect width="${n + 8}" height="${n + 8}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

export function materialAnsicht(main) {
  const basis = location.href.split('#')[0];
  main.append(
    seitenkopf('QR-Codes für den Ortsbeweis', { zurueck: { href: '#/lehrkraefte/material', text: 'Zum Lehrkräfte-Bereich' } }),
    h('p', { class: 'nicht-drucken' }, 'Zum Ausprobieren: Code mit der Kamera eines zweiten Geräts scannen oder den Text-Code in der App eintippen. Am echten Ort hängt das Schild an der Station. Der Code bestätigt nur „Station erreicht“ – es wird kein Standort gespeichert.'),
    h('div', { class: 'zeile nicht-drucken' }, knopf({ text: 'Drucken', symbol: 'drucken', onclick: () => window.print() })),
    h('div', { class: 'qr-blatt' }, alleOrte().map((o) => {
      const url = `${basis}#/beweis/${o.id}/${o.beweis.code}`;
      return h('section', { class: 'karte-box qr-karte stapel' },
        h('h2', {}, o.name),
        h('div', { svg: qrSvg(url) }),
        h('p', { class: 'qr-code-text' }, o.beweis.code),
        h('p', { class: 'klein', style: { wordBreak: 'break-all' } }, url));
    })));
  return { titel: 'QR-Codes' };
}
