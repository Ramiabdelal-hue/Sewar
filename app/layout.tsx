import './globals.css';
import { LangProvider } from '@/context/LangContext';

export const metadata = {
  title: 'S & A',
  description: 'Next.js + Tailwind example',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
