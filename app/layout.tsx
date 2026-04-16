import './globals.css';
import { LangProvider } from '@/context/LangContext';

export const metadata = {
  title: 'S & A',
  description: 'Next.js + Tailwind example',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
            // إخفاء المحتوى عند الضغط على Print Screen
            document.addEventListener('keyup', function(e) {
              if (e.key === 'PrintScreen' || e.keyCode === 44) {
                document.body.style.filter = 'blur(20px)';
                setTimeout(function() { document.body.style.filter = ''; }, 300);
                navigator.clipboard && navigator.clipboard.writeText('');
              }
            });

            // منع Ctrl+P (طباعة)
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                return false;
              }
            });

            // اكتشاف تغيير visibility (بعض أدوات screenshot تخفي الصفحة)
            document.addEventListener('visibilitychange', function() {
              if (document.hidden) {
                document.body.style.filter = 'blur(20px)';
              } else {
                setTimeout(function() { document.body.style.filter = ''; }, 200);
              }
            });
          })();
        `}} />

        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
