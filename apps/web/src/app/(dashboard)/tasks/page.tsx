'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TasksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sales?tab=tasks');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <p style={{ color: '#8c8c8c' }}>Redirecting to Tasks...</p>
    </div>
  );
}
