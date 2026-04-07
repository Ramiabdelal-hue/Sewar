import './globals.css';
import { LangProvider } from '@/context/LangContext';

export const metadata = {
  title: 'S & A',
  description: 'Next.js + Tailwind example',
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
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
