import React from 'react';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'GINIE Cockpit — Master Administrator',
  description: 'Smart CRM & Lead Discovery Cockpit for Solo Founders & Administrators',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
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
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
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
