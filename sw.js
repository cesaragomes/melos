/* =============================================================================
   MELOS — Service Worker
   - Páginas e env-config.js: rede primeiro (sempre a versão mais nova quando online),
     com cópia salva para abrir offline.
   - Imagens/ícones do próprio site: usa a cópia salva e atualiza em segundo plano.
   - Bibliotecas de CDN já fixadas por versão (Tailwind, Supabase, pdf-lib, fontes):
     usa a cópia salva e atualiza em segundo plano.
   - NÃO intercepta Google Drive, login do Google, Supabase, Gemini nem nada fora
     dessa lista: esses pedidos sempre vão direto para a rede.
   Para forçar uma limpeza geral do cache, aumente o número em CACHE_VERSION.
   ============================================================================= */
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'melos-' + CACHE_VERSION;

const PRECACHE = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './public/assets/logo.jpg',
  './public/assets/hero.jpg',
  './public/assets/inbox.jpg'
];

const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

const NETWORK_TIMEOUT_MS = 5000;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // Salva cada item separadamente: se um falhar, os outros continuam.
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(url).catch(function () { /* ignora */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (k) { return k.indexOf('melos-') === 0 && k !== CACHE_NAME; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isStaticAppFile(url) {
  return /\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|json)$/i.test(url.pathname);
}

function strategyFor(request) {
  if (request.method !== 'GET') return null;
  if (request.headers && request.headers.get('range')) return null;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  if (url.origin === self.location.origin) {
    const isPage = request.mode === 'navigate' ||
      url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') ||
      url.pathname.endsWith('/env-config.js') || url.pathname.endsWith('/sw.js');
    if (isPage) return 'network-first';
    if (isStaticAppFile(url)) return 'stale-while-revalidate';
    return 'network-first';
  }
  if (CDN_HOSTS.indexOf(url.hostname) !== -1) return 'stale-while-revalidate';
  return null; // tudo o mais vai direto para a rede
}

function networkFirst(request) {
  const isNavigation = request.mode === 'navigate';
  // 'no-cache' faz o navegador revalidar em vez de usar a cópia do cache HTTP.
  const networkRequest = isNavigation
    ? new Request(request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : new Request(request, { cache: 'no-cache' });

  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request, { ignoreSearch: false }).then(function (cached) {
      const fromNetwork = fetch(networkRequest).then(function (response) {
        if (response && response.ok) {
          cache.put(isNavigation ? request.url : request, response.clone());
        }
        return response;
      });

      if (!cached) {
        // Sem cópia salva: depende só da rede (e cai no './' salvo se estiver offline).
        return fromNetwork.catch(function () {
          return cache.match('./').then(function (shell) {
            return shell || Response.error();
          });
        });
      }

      // Com cópia salva: espera a rede por um tempo e, se demorar ou falhar, usa a cópia.
      const timeout = new Promise(function (resolve) {
        setTimeout(function () { resolve(cached); }, NETWORK_TIMEOUT_MS);
      });
      return Promise.race([fromNetwork.catch(function () { return cached; }), timeout]);
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request).then(function (cached) {
      const fromNetwork = fetch(request).then(function (response) {
        // Respostas "opacas" (CDN sem CORS) têm status 0 e também podem ser salvas.
        if (response && (response.ok || response.type === 'opaque')) {
          cache.put(request, response.clone());
        }
        return response;
      });
      if (cached) {
        fromNetwork.catch(function () { /* offline: mantém a cópia */ });
        return cached;
      }
      return fromNetwork;
    });
  });
}

self.addEventListener('fetch', function (event) {
  const strategy = strategyFor(event.request);
  if (!strategy) return; // deixa o navegador resolver normalmente
  event.respondWith(strategy === 'network-first'
    ? networkFirst(event.request)
    : staleWhileRevalidate(event.request));
});
