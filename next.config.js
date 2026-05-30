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
