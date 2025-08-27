/** @type {import('next').NextConfig} */
const nextConfig = {
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
