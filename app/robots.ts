import type { MetadataRoute } from 'next';

// Securite/SEO (#23) : bloquer l'indexation des espaces prives (admin, API, dashboards, auth, tenants).
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://csecur360.ca';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/auth/',
          '/*/admin',       // /[tenant]/admin
          '/*/dashboard',   // dashboards de tenant
          '/*/new-dashboard',
          '/*/analytics',
          '/*/planificateur',
          '/*/timesheets',
          '/*/paie',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
