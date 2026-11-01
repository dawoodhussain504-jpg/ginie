'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PeopleRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/customers?tab=people');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <p style={{ color: '#8c8c8c' }}>Redirecting to Customers...</p>
    </div>
  );
}
