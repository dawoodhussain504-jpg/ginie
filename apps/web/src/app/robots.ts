import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ginie.space';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/privacy', '/terms', '/refund-policy', '/contact', '/store/'],
        disallow: ['/admin', '/dashboard', '/customers', '/sales', '/erp', '/digital-store', '/billing', '/settings', '/whatsapp', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
