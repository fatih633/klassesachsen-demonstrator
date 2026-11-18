// Service Worker – klasseSachsen Demonstrator (erzeugt von tools/baue_precache.py, nicht von Hand bearbeiten)
// Lädt beim Installieren alle Dateien (App, Questpakete, Vorlese-Audio) in den Cache und
// liefert sie danach ohne Netz aus. Keine Anfragen an fremde Server.
const VERSION = '__VERSION__';
const CACHE = `ks-${VERSION}`;
const DATEIEN = __DATEIEN__;

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
