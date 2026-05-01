// ─── Cache Names ──────────────────────────────────────────────────────────────
const CACHE_IMAGES = 'sewar-images-v3';
const CACHE_STATIC = 'sewar-static-v3';

// مدة صلاحية الـ cache: 7 أيام بالميلي ثانية
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());

// ─── Activate — حذف الـ caches القديمة ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_IMAGES, CACHE_STATIC];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isCloudinaryImage(url) {
  return url.includes('res.cloudinary.com');
}

function isStaticImage(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif|ico)(\?|$)/i.test(url);
}

function isFresh(response) {
  if (!response) return false;
  const dateHeader = response.headers.get('sw-cached-at');
  if (!dateHeader) return false;
  return Date.now() - parseInt(dateHeader) < MAX_AGE_MS;
}

async function cacheResponse(cacheName, request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(cacheName);
  // نضيف header لنعرف وقت الـ cache
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', String(Date.now()));
  const cachedResponse = new Response(await response.clone().blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  cache.put(request, cachedResponse);
  return response;
}

// ─── Fetch — استراتيجية Cache First للصور ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // فقط GET requests
  if (request.method !== 'GET') return;

  // ─── Cloudinary: Cache First (7 أيام) ─────────────────────────────────────
  if (isCloudinaryImage(url)) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(async (cache) => {
        const cached = await cache.match(request);

        // إذا موجود في الـ cache وطازج → ارجعه مباشرة
        if (cached && isFresh(cached)) {
          return cached;
        }

        // إذا موجود لكن قديم → ارجعه وحدّثه في الخلفية (stale-while-revalidate)
        if (cached) {
          fetch(request).then((fresh) => cacheResponse(CACHE_IMAGES, request, fresh)).catch(() => {});
          return cached;
        }

        // غير موجود → حمّله وخزّنه
        try {
          const fresh = await fetch(request);
          return cacheResponse(CACHE_IMAGES, request, fresh);
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // ─── الصور الثابتة (public/): Cache First (يوم واحد) ─────────────────────
  if (isStaticImage(url) && !url.includes('/_next/')) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }
});
