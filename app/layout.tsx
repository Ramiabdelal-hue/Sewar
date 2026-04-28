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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sewar" />
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
            // تسجيل Service Worker لـ cache الصور
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) { console.log('✅ SW registered'); })
                  .catch(function(err) { console.log('SW error:', err); });
              });
            }

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
