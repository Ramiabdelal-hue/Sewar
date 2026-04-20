import './globals.css';
import { LangProvider } from '@/context/LangContext';
import ScreenProtection from '@/components/ScreenProtection';

export const metadata = {
  title: 'S & A',
  description: 'Next.js + Tailwind example',
  manifest: '/manifest.json',
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

        {/* PWA - حفظ الصفحة الحالية لاستعادتها عند فتح التطبيق */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function savePage() {
              var path = window.location.pathname + window.location.search;
              if (path && path !== '/pwa-start') {
                localStorage.setItem('pwa_last_page', path);
              }
            }
            savePage();
            var _pushState = history.pushState;
            history.pushState = function() {
              _pushState.apply(history, arguments);
              setTimeout(savePage, 100);
            };
            var _replaceState = history.replaceState;
            history.replaceState = function() {
              _replaceState.apply(history, arguments);
              setTimeout(savePage, 100);
            };
            window.addEventListener('popstate', savePage);
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
