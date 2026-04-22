import './globals.css';
import { LangProvider } from '@/context/LangContext';
import ScreenProtection from '@/components/ScreenProtection';

export const metadata = {
  title: 'S & A',
  description: 'Next.js + Tailwind example',
  manifest: '/manifest.json',
  icons: {
    icon: '/her.jpeg',
    apple: '/her.jpeg',
    shortcut: '/her.jpeg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="apple-touch-icon" href="/her.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/her.jpeg" />
        <link rel="icon" type="image/jpeg" href="/her.jpeg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sewar" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'nl',
                  includedLanguages: 'nl,fr,ar,en',
                  autoDisplay: false,
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
      </head>
      <body>
        <style>{`
          .wa-btn:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(37,211,102,0.7) !important; }
          .wa-btn { transition: transform 0.2s, box-shadow 0.2s; }
        `}</style>

        {/* حماية من Screenshot */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // منع Ctrl+P (طباعة)
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                return false;
              }
            });
          })();
        `}} />

        {/* تتبع النشاط والزوار */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function getEmail() {
              try { return localStorage.getItem('userEmail') || null; } catch { return null; }
            }
            function track(eventType, extra) {
              try {
                fetch('/api/activity', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userEmail: getEmail(),
                    eventType: eventType,
                    page: extra || window.location.pathname
                  })
                });
              } catch(e) {}
            }

            // تسجيل زيارة الصفحة
            track('pageview');

            // تتبع التنقل بين الصفحات
            var _pushState = history.pushState;
            history.pushState = function() {
              _pushState.apply(history, arguments);
              setTimeout(function() { track('pageview'); }, 100);
            };
            window.addEventListener('popstate', function() { track('pageview'); });

            // كشف محاولات Screenshot
            // 1. مفاتيح لوحة المفاتيح
            document.addEventListener('keyup', function(e) {
              if (e.key === 'PrintScreen' ||
                  (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5')) ||
                  (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
                track('screenshot_attempt', 'keyboard: ' + e.key);
              }
            });

            // 2. تغيير visibility (قد يدل على screenshot على موبايل)
            document.addEventListener('visibilitychange', function() {
              if (document.visibilityState === 'hidden') {
                track('screenshot_attempt', 'visibility_hidden');
              }
            });

            // 3. كشف screenshot API على Android
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
              var origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
              navigator.mediaDevices.getDisplayMedia = function(opts) {
                track('screenshot_attempt', 'getDisplayMedia');
                return origGetDisplayMedia(opts);
              };
            }
          })();
        `}} />

        <LangProvider>
          <ScreenProtection />
          <div>
            {children}
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
