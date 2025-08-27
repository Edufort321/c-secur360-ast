/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'mdl.ca', 'vercel.app'],
  },
  async rewrites() {
    return [
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
    ];
  },
};

module.exports = nextConfig;
