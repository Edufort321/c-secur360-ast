/** @type {import('next').NextConfig} */
const nextConfig = {
  // Retire les console.* (sauf error/warn) des bundles de PRODUCTION uniquement.
  // Nettoie le bruit (ex. logs verbeux du Gantt du planificateur) sans toucher au dev.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    domains: ['localhost', 'mdl.ca', 'vercel.app'],
  },
  // Securite (#22) : en-tetes HTTP de securite sur toutes les reponses.
  // CSP volontairement laissee en suivi (necessite un reglage fin par source : Supabase, Google Maps,
  // OpenWeatherMap, Stripe, Twilio - une CSP trop stricte casserait l'app).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
