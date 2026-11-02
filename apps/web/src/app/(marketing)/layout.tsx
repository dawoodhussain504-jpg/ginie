'use client';

import React from 'react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a' }}>
      {children}
    </div>
  );
}
