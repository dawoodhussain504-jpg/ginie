'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings?tab=owner-control');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <p style={{ color: '#8c8c8c' }}>Redirecting to Owner Control Panel in Settings...</p>
    </div>
  );
}
