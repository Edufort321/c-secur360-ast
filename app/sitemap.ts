import type { MetadataRoute } from 'next';

// SEO (#23) : sitemap des pages PUBLIQUES uniquement (jamais d'admin/tenant).
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://csecur360.ca';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/pricing', '/privacy'];
  return pages.map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.6,
  }));
}
