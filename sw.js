// Service Worker – klasseSachsen Demonstrator (erzeugt von tools/baue_precache.py, nicht von Hand bearbeiten)
// Lädt beim Installieren alle Dateien (App, Questpakete, Vorlese-Audio) in den Cache und
// liefert sie danach ohne Netz aus. Keine Anfragen an fremde Server.
const VERSION = 'b3290605e17d';
const CACHE = `ks-${VERSION}`;
const DATEIEN = ["./", "LICENSE", "LICENSE-CONTENT.md", "QUELLEN.md", "README.md", "audio/allgemein/album.intro.e.mp3", "audio/allgemein/album.intro.n.mp3", "audio/allgemein/album.sachsen.e.mp3", "audio/allgemein/album.sachsen.n.mp3", "audio/allgemein/beweis.falsch.e.mp3", "audio/allgemein/beweis.falsch.n.mp3", "audio/allgemein/beweis.ok.e.mp3", "audio/allgemein/beweis.ok.n.mp3", "audio/allgemein/collage.freigabe.e.mp3", "audio/allgemein/collage.freigabe.n.mp3", "audio/allgemein/collage.gesperrt.e.mp3", "audio/allgemein/collage.gesperrt.n.mp3", "audio/allgemein/collage.intro.e.mp3", "audio/allgemein/collage.intro.n.mp3", "audio/allgemein/collage.regel.e.mp3", "audio/allgemein/collage.regel.n.mp3", "audio/allgemein/feedback.loesung_markiert.e.mp3", "audio/allgemein/feedback.loesung_markiert.n.mp3", "audio/allgemein/feedback.schon.e.mp3", "audio/allgemein/feedback.schon.n.mp3", "audio/allgemein/feedback.spaeter.e.mp3", "audio/allgemein/feedback.spaeter.n.mp3", "audio/allgemein/fertig.gurri.e.mp3", "audio/allgemein/fertig.gurri.n.mp3", "audio/allgemein/gruppe.frei.e.mp3", "audio/allgemein/gruppe.frei.n.mp3", "audio/allgemein/gruppe.intro.e.mp3", "audio/allgemein/gruppe.intro.n.mp3", "audio/allgemein/karte.fertig.e.mp3", "audio/allgemein/karte.fertig.n.mp3", "audio/allgemein/karte.gurri.e.mp3", "audio/allgemein/karte.gurri.n.mp3", "audio/allgemein/rolle.navigation.e.mp3", "audio/allgemein/rolle.navigation.n.mp3", "audio/allgemein/rolle.protokoll.e.mp3", "audio/allgemein/rolle.protokoll.n.mp3", "audio/allgemein/rolle.recherche.e.mp3", "audio/allgemein/rolle.recherche.n.mp3", "audio/allgemein/rollen.wechsel.e.mp3", "audio/allgemein/rollen.wechsel.n.mp3", "audio/allgemein/schaetz.beraten.e.mp3", "audio/allgemein/schaetz.beraten.n.mp3", "audio/allgemein/schaetz.einig.e.mp3", "audio/allgemein/schaetz.einig.n.mp3", "audio/allgemein/schaetz.vergleich.e.mp3", "audio/allgemein/schaetz.vergleich.n.mp3", "audio/allgemein/start.ablauf.e.mp3", "audio/allgemein/start.ablauf.n.mp3", "audio/allgemein/start.gurri.e.mp3", "audio/allgemein/start.gurri.n.mp3", "audio/allgemein/startklar.intro.e.mp3", "audio/allgemein/startklar.intro.n.mp3", "audio/allgemein/zeiten.json", "audio/allgemein/zeitstrahl.teil.e.mp3", "audio/allgemein/zeitstrahl.teil.n.mp3", "audio/allgemein/zuordnen.teil.e.mp3", "audio/allgemein/zuordnen.teil.n.mp3", "audio/stille.mp3", "barrierefreiheit.html", "css/app.css", "datenschutz.html", "fonts/OFL-Atkinson-Hyperlegible.txt", "fonts/OFL-Fredoka.txt", "fonts/atkinson-hyperlegible-latin-400-italic.woff2", "fonts/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-700-normal.woff2", "fonts/fredoka-latin-600-normal.woff2", "img/apple-touch-icon.png", "img/favicon.svg", "img/icon-192.png", "img/icon-512.png", "img/icon-maskable-512.png", "impressum.html", "index.html", "inhalt/allgemein.json", "js/ansichten/album.js", "js/ansichten/beweis.js", "js/ansichten/collage.js", "js/ansichten/gruppe.js", "js/ansichten/karte.js", "js/ansichten/lehrkraefte.js", "js/ansichten/material.js", "js/ansichten/ort.js", "js/ansichten/spiel.js", "js/ansichten/start.js", "js/ansichten/startklar.js", "js/ansichten/teile.js", "js/ansichten/ueber.js", "js/app.js", "js/collage/generator.js", "js/collage/webp.js", "js/daten.js", "js/einstellungen.js", "js/grafik/figur.js", "js/grafik/items.js", "js/grafik/karte-daten.js", "js/grafik/karte.js", "js/grafik/symbole.js", "js/grafik/szenen.js", "js/inhalt.js", "js/router.js", "js/seite.js", "js/speicher.js", "js/spiele/schaetzfrage.js", "js/spiele/spurensuche.js", "js/spiele/zeitstrahl.js", "js/spiele/zuordnen.js", "js/text.js", "js/ui.js", "js/vendor/qrcode-generator.js", "js/vorlesen.js", "js/zerlegung.js", "manifest.webmanifest", "audio/meissen/meissen.beweis.e.mp3", "audio/meissen/meissen.beweis.n.mp3", "audio/meissen/meissen.facette.e.mp3", "audio/meissen/meissen.facette.n.mp3", "audio/meissen/meissen.intro.e.mp3", "audio/meissen/meissen.intro.n.mp3", "audio/meissen/meissen.item.tasse.e.mp3", "audio/meissen/meissen.item.tasse.n.mp3", "audio/meissen/meissen.item.teller.e.mp3", "audio/meissen/meissen.item.teller.n.mp3", "audio/meissen/meissen.sp.a1.e.mp3", "audio/meissen/meissen.sp.a1.fund.e.mp3", "audio/meissen/meissen.sp.a1.fund.n.mp3", "audio/meissen/meissen.sp.a1.n.mp3", "audio/meissen/meissen.sp.a1.t1.e.mp3", "audio/meissen/meissen.sp.a1.t1.n.mp3", "audio/meissen/meissen.sp.a1.t2.e.mp3", "audio/meissen/meissen.sp.a1.t2.n.mp3", "audio/meissen/meissen.sp.a2.e.mp3", "audio/meissen/meissen.sp.a2.fund.e.mp3", "audio/meissen/meissen.sp.a2.fund.n.mp3", "audio/meissen/meissen.sp.a2.n.mp3", "audio/meissen/meissen.sp.a2.t1.e.mp3", "audio/meissen/meissen.sp.a2.t1.n.mp3", "audio/meissen/meissen.sp.a2.t2.e.mp3", "audio/meissen/meissen.sp.a2.t2.n.mp3", "audio/meissen/meissen.sp.a3.e.mp3", "audio/meissen/meissen.sp.a3.fund.e.mp3", "audio/meissen/meissen.sp.a3.fund.n.mp3", "audio/meissen/meissen.sp.a3.n.mp3", "audio/meissen/meissen.sp.a3.t1.e.mp3", "audio/meissen/meissen.sp.a3.t1.n.mp3", "audio/meissen/meissen.sp.a3.t2.e.mp3", "audio/meissen/meissen.sp.a3.t2.n.mp3", "audio/meissen/meissen.sp.bild.e.mp3", "audio/meissen/meissen.sp.bild.n.mp3", "audio/meissen/meissen.sp.ende.e.mp3", "audio/meissen/meissen.sp.ende.n.mp3", "audio/meissen/meissen.sp.intro.e.mp3", "audio/meissen/meissen.sp.intro.n.mp3", "audio/meissen/meissen.sp.klassenzimmer.e.mp3", "audio/meissen/meissen.sp.klassenzimmer.n.mp3", "audio/meissen/meissen.sp.o.fenster.e.mp3", "audio/meissen/meissen.sp.o.fenster.n.mp3", "audio/meissen/meissen.sp.o.katze.e.mp3", "audio/meissen/meissen.sp.o.katze.n.mp3", "audio/meissen/meissen.sp.o.regal.e.mp3", "audio/meissen/meissen.sp.o.regal.n.mp3", "audio/meissen/meissen.zu.aufgabe.e.mp3", "audio/meissen/meissen.zu.aufgabe.n.mp3", "audio/meissen/meissen.zu.ende.e.mp3", "audio/meissen/meissen.zu.ende.n.mp3", "audio/meissen/meissen.zu.f.feldspat.e.mp3", "audio/meissen/meissen.zu.f.feldspat.n.mp3", "audio/meissen/meissen.zu.f.gold.e.mp3", "audio/meissen/meissen.zu.f.gold.n.mp3", "audio/meissen/meissen.zu.f.kaolin.e.mp3", "audio/meissen/meissen.zu.f.kaolin.n.mp3", "audio/meissen/meissen.zu.f.mehl.e.mp3", "audio/meissen/meissen.zu.f.mehl.n.mp3", "audio/meissen/meissen.zu.f.quarz.e.mp3", "audio/meissen/meissen.zu.f.quarz.n.mp3", "audio/meissen/meissen.zu.f.silber.e.mp3", "audio/meissen/meissen.zu.f.silber.n.mp3", "audio/meissen/meissen.zu.intro.e.mp3", "audio/meissen/meissen.zu.intro.n.mp3", "audio/meissen/meissen.zu.t1.e.mp3", "audio/meissen/meissen.zu.t1.n.mp3", "audio/meissen/meissen.zu.t2.e.mp3", "audio/meissen/meissen.zu.t2.n.mp3", "audio/meissen/zeiten.json", "inhalt/meissen.json", "audio/freiberg/freiberg.beweis.e.mp3", "audio/freiberg/freiberg.beweis.n.mp3", "audio/freiberg/freiberg.facette.e.mp3", "audio/freiberg/freiberg.facette.n.mp3", "audio/freiberg/freiberg.intro.e.mp3", "audio/freiberg/freiberg.intro.n.mp3", "audio/freiberg/freiberg.item.erz.e.mp3", "audio/freiberg/freiberg.item.erz.n.mp3", "audio/freiberg/freiberg.item.lampe.e.mp3", "audio/freiberg/freiberg.item.lampe.n.mp3", "audio/freiberg/freiberg.sf.ende.e.mp3", "audio/freiberg/freiberg.sf.ende.n.mp3", "audio/freiberg/freiberg.sf.frage.e.mp3", "audio/freiberg/freiberg.sf.frage.n.mp3", "audio/freiberg/freiberg.sf.intro.e.mp3", "audio/freiberg/freiberg.sf.intro.n.mp3", "audio/freiberg/freiberg.sf.loesung.e.mp3", "audio/freiberg/freiberg.sf.loesung.n.mp3", "audio/freiberg/freiberg.sf.rechenweg.e.mp3", "audio/freiberg/freiberg.sf.rechenweg.n.mp3", "audio/freiberg/freiberg.sf.t1.e.mp3", "audio/freiberg/freiberg.sf.t1.n.mp3", "audio/freiberg/freiberg.sf.t2.e.mp3", "audio/freiberg/freiberg.sf.t2.n.mp3", "audio/freiberg/freiberg.sp.a1.e.mp3", "audio/freiberg/freiberg.sp.a1.fund.e.mp3", "audio/freiberg/freiberg.sp.a1.fund.n.mp3", "audio/freiberg/freiberg.sp.a1.n.mp3", "audio/freiberg/freiberg.sp.a1.t1.e.mp3", "audio/freiberg/freiberg.sp.a1.t1.n.mp3", "audio/freiberg/freiberg.sp.a1.t2.e.mp3", "audio/freiberg/freiberg.sp.a1.t2.n.mp3", "audio/freiberg/freiberg.sp.a2.e.mp3", "audio/freiberg/freiberg.sp.a2.fund.e.mp3", "audio/freiberg/freiberg.sp.a2.fund.n.mp3", "audio/freiberg/freiberg.sp.a2.n.mp3", "audio/freiberg/freiberg.sp.a2.t1.e.mp3", "audio/freiberg/freiberg.sp.a2.t1.n.mp3", "audio/freiberg/freiberg.sp.a2.t2.e.mp3", "audio/freiberg/freiberg.sp.a2.t2.n.mp3", "audio/freiberg/freiberg.sp.a3.e.mp3", "audio/freiberg/freiberg.sp.a3.fund.e.mp3", "audio/freiberg/freiberg.sp.a3.fund.n.mp3", "audio/freiberg/freiberg.sp.a3.n.mp3", "audio/freiberg/freiberg.sp.a3.t1.e.mp3", "audio/freiberg/freiberg.sp.a3.t1.n.mp3", "audio/freiberg/freiberg.sp.a3.t2.e.mp3", "audio/freiberg/freiberg.sp.a3.t2.n.mp3", "audio/freiberg/freiberg.sp.bild.e.mp3", "audio/freiberg/freiberg.sp.bild.n.mp3", "audio/freiberg/freiberg.sp.ende.e.mp3", "audio/freiberg/freiberg.sp.ende.n.mp3", "audio/freiberg/freiberg.sp.intro.e.mp3", "audio/freiberg/freiberg.sp.intro.n.mp3", "audio/freiberg/freiberg.sp.klassenzimmer.e.mp3", "audio/freiberg/freiberg.sp.klassenzimmer.n.mp3", "audio/freiberg/freiberg.sp.o.fledermaus.e.mp3", "audio/freiberg/freiberg.sp.o.fledermaus.n.mp3", "audio/freiberg/freiberg.sp.o.kiste.e.mp3", "audio/freiberg/freiberg.sp.o.kiste.n.mp3", "audio/freiberg/freiberg.sp.o.werkzeug.e.mp3", "audio/freiberg/freiberg.sp.o.werkzeug.n.mp3", "audio/freiberg/freiberg.sp.o.zwerg.e.mp3", "audio/freiberg/freiberg.sp.o.zwerg.n.mp3", "audio/freiberg/zeiten.json", "inhalt/freiberg.json", "audio/leipzig/leipzig.beweis.e.mp3", "audio/leipzig/leipzig.beweis.n.mp3", "audio/leipzig/leipzig.facette.e.mp3", "audio/leipzig/leipzig.facette.n.mp3", "audio/leipzig/leipzig.intro.e.mp3", "audio/leipzig/leipzig.intro.n.mp3", "audio/leipzig/leipzig.item.kerze.e.mp3", "audio/leipzig/leipzig.item.kerze.n.mp3", "audio/leipzig/leipzig.item.saeule.e.mp3", "audio/leipzig/leipzig.item.saeule.n.mp3", "audio/leipzig/leipzig.sf.ende.e.mp3", "audio/leipzig/leipzig.sf.ende.n.mp3", "audio/leipzig/leipzig.sf.frage.e.mp3", "audio/leipzig/leipzig.sf.frage.n.mp3", "audio/leipzig/leipzig.sf.intro.e.mp3", "audio/leipzig/leipzig.sf.intro.n.mp3", "audio/leipzig/leipzig.sf.loesung.e.mp3", "audio/leipzig/leipzig.sf.loesung.n.mp3", "audio/leipzig/leipzig.sf.rechenweg.e.mp3", "audio/leipzig/leipzig.sf.rechenweg.n.mp3", "audio/leipzig/leipzig.sf.t1.e.mp3", "audio/leipzig/leipzig.sf.t1.n.mp3", "audio/leipzig/leipzig.sf.t2.e.mp3", "audio/leipzig/leipzig.sf.t2.n.mp3", "audio/leipzig/leipzig.zs.aufgabe.e.mp3", "audio/leipzig/leipzig.zs.aufgabe.n.mp3", "audio/leipzig/leipzig.zs.ende.e.mp3", "audio/leipzig/leipzig.zs.ende.n.mp3", "audio/leipzig/leipzig.zs.intro.e.mp3", "audio/leipzig/leipzig.zs.intro.n.mp3", "audio/leipzig/leipzig.zs.k.einheit.e.mp3", "audio/leipzig/leipzig.zs.k.einheit.n.mp3", "audio/leipzig/leipzig.zs.k.gebet.e.mp3", "audio/leipzig/leipzig.zs.k.gebet.n.mp3", "audio/leipzig/leipzig.zs.k.mauer.e.mp3", "audio/leipzig/leipzig.zs.k.mauer.n.mp3", "audio/leipzig/leipzig.zs.k.plakate.e.mp3", "audio/leipzig/leipzig.zs.k.plakate.n.mp3", "audio/leipzig/leipzig.zs.k.ring.e.mp3", "audio/leipzig/leipzig.zs.k.ring.n.mp3", "audio/leipzig/leipzig.zs.loesung.e.mp3", "audio/leipzig/leipzig.zs.loesung.n.mp3", "audio/leipzig/leipzig.zs.t1.e.mp3", "audio/leipzig/leipzig.zs.t1.n.mp3", "audio/leipzig/leipzig.zs.t2.e.mp3", "audio/leipzig/leipzig.zs.t2.n.mp3", "audio/leipzig/zeiten.json", "inhalt/leipzig.json", "precache.json"];

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (let i = 0; i < DATEIEN.length; i += 25) {
      await cache.addAll(DATEIEN.slice(i, i + 25).map((d) => new Request(d, { cache: 'reload' })));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil((async () => {
    const namen = await caches.keys();
    await Promise.all(namen.filter((n) => n.startsWith('ks-') && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function teilantwort(antwort, bereich) {
  const blob = await antwort.blob();
  const m = /bytes=(\d*)-(\d*)/.exec(bereich || '');
  const groesse = blob.size;
  let start = m && m[1] ? parseInt(m[1], 10) : 0;
  let ende = m && m[2] ? parseInt(m[2], 10) : groesse - 1;
  if (!m || Number.isNaN(start) || start >= groesse) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${groesse}` } });
  }
  ende = Math.min(ende, groesse - 1);
  const teil = blob.slice(start, ende + 1);
  return new Response(teil, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': antwort.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${ende}/${groesse}`,
      'Content-Length': String(teil.size),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request;
  if (anfrage.method !== 'GET') return;
  const url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) return;

  if (anfrage.mode === 'navigate') {
    ereignis.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const treffer = await cache.match(anfrage, { ignoreSearch: true });
      if (treffer) return treffer;
      try {
        return await fetch(anfrage);
      } catch {
        return (await cache.match('index.html')) || Response.error();
      }
    })());
    return;
  }

  ereignis.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const treffer = await cache.match(anfrage, { ignoreSearch: true, ignoreVary: true });
    if (treffer) {
      const bereich = anfrage.headers.get('range');
      return bereich ? teilantwort(treffer, bereich) : treffer;
    }
    try {
      return await fetch(anfrage);
    } catch {
      return new Response('', { status: 504, statusText: 'Offline und nicht im Cache' });
    }
  })());
});
