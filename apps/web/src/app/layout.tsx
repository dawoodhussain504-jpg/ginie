import React from 'react';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ginie.space'),
  title: {
    default: 'GINIE — All-in-One CRM, Multi-Trade ERP & Digital Storefront',
    template: '%s | GINIE',
  },
  description: '100% Free Core Sales CRM, Multi-Trade Barcode POS ERP for 11 Indian trades, Commission-Free Digital Storefront & ₹599 On-Demand Google Maps Customer Discovery with Zero Auto-Debit.',
  keywords: [
    'GINIE',
    'CRM for Indian Business',
    'Multi-Trade ERP',
    'Barcode POS Counter',
    'Free Digital Storefront India',
    'Google Maps Customer Discovery',
    'GST Invoicing with UPI QR',
    'Kirana Billing Software',
    'Restaurant KOT POS',
    'Automobile Garage Job Cards',
    'Pharmacy Expiry Tracker',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ginie.space',
    siteName: 'GINIE',
    title: 'GINIE — All-in-One CRM, Multi-Trade ERP & Digital Storefront',
    description: 'Empower your Indian business with 100% Free Core CRM, 11-Trade ERP, POS Counter, Digital Storefront and On-Demand Google Maps Customer Discovery via UPI.',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'GINIE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GINIE — All-in-One CRM, Multi-Trade ERP & Digital Storefront',
    description: '100% Free Core Sales CRM, 11-Trade ERP POS Counter & Commission-Free Digital Storefront built for Indian SMEs.',
    images: ['/logo.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GINIE',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AntdRegistry>
          <AppProvider>{children}</AppProvider>
        </AntdRegistry>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  reg.update();
                }).catch(function(err) {
                  console.log('SW registration skipped:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
