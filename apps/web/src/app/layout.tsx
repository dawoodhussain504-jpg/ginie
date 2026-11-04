import React from 'react';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ginie.space'),
  title: {
    default: 'GINIE — All-in-One CRM, Multi-Trade ERP & Digital Storefront Built for India',
    template: '%s | GINIE Business Suite',
  },
  description: '100% Free Core Sales CRM, Multi-Trade Barcode POS ERP for 11 Indian trades, Commission-Free Digital Storefront & ₹599 On-Demand Google Maps Lead Discovery with Zero Auto-Debit.',
  keywords: [
    'CRM for Indian Business',
    'Multi-Trade ERP',
    'Barcode POS Counter',
    'Free Digital Storefront India',
    'Google Maps Lead Discovery',
    'GST Invoicing with UPI QR',
    'Kirana Billing Software',
    'Restaurant KOT POS',
    'Automobile Garage Job Cards',
    'Pharmacy Expiry Tracker',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ginie.space',
    siteName: 'GINIE Business Suite',
    title: 'GINIE — All-in-One CRM, Multi-Trade ERP & Digital Storefront',
    description: 'Empower your Indian business with 100% Free Core CRM, 11-Trade ERP, POS Counter, Digital Storefront and On-Demand Google Maps Leads via UPI.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'GINIE Business Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GINIE — All-in-One CRM, Multi-Trade ERP & Digital Storefront',
    description: '100% Free Core Sales CRM, 11-Trade ERP POS Counter & Commission-Free Digital Storefront built for Indian SMEs.',
    images: ['/icons/icon-512.png'],
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
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
