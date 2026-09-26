import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { VisitorTracker } from '@/components/layout/VisitorTracker';
import { TabTitleHandler } from '@/components/layout/TabTitleHandler';
import { JsonLd } from '@/components/ui/JsonLd';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARILHA — Modern Indian Jewellery | Anti-Tarnish & Everyday Jewellery',
  description: 'Discover ARILHA by Irsa Khan — modern Indian jewellery designed for everyday wear, celebrations and every version of you. Explore gold-plated, anti-tarnish, kundan and statement jewellery.',
  metadataBase: new URL('https://arilha.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'ARILHA — Modern Indian Jewellery',
    description: 'Modern Indian jewellery designed for everyday moments, celebrations and every version of you.',
    type: 'website',
    url: 'https://arilha.com',
    siteName: 'ARILHA',
    images: [
      {
        url: 'https://arilha.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'ARILHA - Modern Indian Jewellery by Irsa Khan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARILHA — Modern Indian Jewellery',
    description: 'Modern Indian jewellery designed for everyday moments, celebrations and every version of you. ARILHA by Irsa Khan.',
    images: ['https://arilha.com/logo.png'],
  },
  verification: {
    other: {
      'p:domain_verify': 'eac7e6d6b0859b4055a5c532daddb477',
    },
  },
};

import { AnalyticsTrackerProvider } from '@/components/analytics/AnalyticsTrackerProvider';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${playfair.variable} ${jakarta.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.svg" />
        <meta name="p:domain_verify" content="eac7e6d6b0859b4055a5c532daddb477" />
      </head>
      <body className="flex flex-col min-h-screen bg-[#FDFBF7] text-neutral-900 antialiased selection:bg-[#B38548] selection:text-white font-sans">
        <Suspense fallback={null}>
          <AnalyticsTrackerProvider>
            <VisitorTracker />
            <TabTitleHandler />
            <JsonLd type="Organization" />
            <JsonLd type="WebSite" />
            <Header />
            <main className="flex-1 pb-16 sm:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </AnalyticsTrackerProvider>
        </Suspense>
      </body>
    </html>
  );
}

