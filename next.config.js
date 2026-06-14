/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sécurité : ne pas exposer la techno (X-Powered-By) ni le code source en prod.
  poweredByHeader: false,
  productionBrowserSourceMaps: false, // pas de source maps client en production (code non exposé)
  // Retire les console.* (sauf error/warn) des bundles de PRODUCTION uniquement.
  // Nettoie le bruit (ex. logs verbeux du Gantt du planificateur) sans toucher au dev.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Inclut le binaire ffmpeg-static dans le bundle serverless de la route de conversion vidéo
  // (sinon le file-tracing de Next ne l'embarque pas et la conversion échoue sur Vercel).
  experimental: {
    // Ne pas bundler ces paquets serveur (requires dynamiques + binaires) — les laisser externes (Next 14).
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
    outputFileTracingIncludes: {
      '/api/admin/marketing/convert': ['./node_modules/ffmpeg-static/ffmpeg*'],
      '/api/admin/marketing/capture': ['./node_modules/@sparticuz/chromium/**'],
    },
  },
  images: {
    domains: ['localhost', 'mdl.ca', 'vercel.app'],
  },
  // Securite (#22) : en-tetes HTTP de securite sur toutes les reponses.
  async headers() {
    // Content-Security-Policy reglee par source reelle de l'app.
    // 'unsafe-eval' UNIQUEMENT en dev (le HMR de Next l'exige) ; retire en production.
    // 'unsafe-inline' conserve (Next inline ses scripts d'hydratation + styled-jsx/Tailwind)
    // tant qu'un mecanisme de nonce n'est pas en place.
    const isDev = process.env.NODE_ENV !== 'production';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://maps.googleapis.com https://js.stripe.com https://calendly.com https://assets.calendly.com https://static.cloudflareinsights.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' data: blob: https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://*.googleapis.com https://api.stripe.com https://api.openweathermap.org https://cloudflareinsights.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://calendly.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "media-src 'self' blob: data: https://*.supabase.co",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), interest-cohort=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Redirection des sous-domaines vers les tenants
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenant>.*)\\.mdl\\.ca',
            },
          ],
          destination: '/:tenant/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
