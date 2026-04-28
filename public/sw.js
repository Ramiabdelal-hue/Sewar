const CACHE_NAME = 'sewar-images-v1';

// تخزين الصور من Cloudinary فقط
const shouldCache = (url) => {
  return url.includes('res.cloudinary.com');
};

// عند تثبيت Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // حذف الـ cache القديم
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// اعتراض طلبات الصور
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (!shouldCache(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // تحقق من الـ cache أولاً
      const cached = await cache.match(event.request);
      if (cached) {
        return cached;
      }

      // إذا لم تكن في الـ cache، حملها من الإنترنت
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return cached || new Response('Image not available', { status: 503 });
      }
    })
  );
});
