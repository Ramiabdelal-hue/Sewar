import './globals.css';
import { LangProvider } from '@/context/LangContext';
import ScreenProtection from '@/components/ScreenProtection';
import Watermark from '@/components/Watermark';
import ActivityTracker from '@/components/ActivityTracker';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import NewsTicker from '@/components/NewsTicker';

export const metadata = {
  title: 'Sewar Rijbewijs Online',
  description: 'Haal je rijbewijs in één keer! Theorie, Examen & Praktijk.',
  manifest: '/manifest.json',
  icons: {
    icon: '/her.jpeg',
    apple: '/her.jpeg',
  },
  openGraph: {
    title: 'Sewar Rijbewijs Online',
    description: 'Theorie, Examen & Praktijk.',
    url: 'https://your-domain.com',
    siteName: 'Sewar Rijbewijs Online',
    images: [
      {
        url: '/Logo.jpeg',
        width: 800,
        height: 600,
      },
    ],
    locale: 'nl_BE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sewar Rijbewijs Online',
    description: 'Haal je rijbewijs in één keer!',
    images: ['/Logo.jpeg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="apple-touch-icon" href="/her.jpeg" />
        <link rel="icon" href="/her.jpeg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <LangProvider>
          {/* 🛡️ حماية */}
          <ScreenProtection />
          <Watermark />
          {/* 📊 تتبع */}
          <ActivityTracker />
          {/* ⚙️ Service Worker */}
          <ServiceWorkerRegister />
          {/* 📰 شريط أخباري */}
          <NewsTicker />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
