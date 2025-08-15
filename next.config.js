/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'vercel.app', 'csecur360.com'],
  },
  async rewrites() {
    return [
      // Redirection des sous-domaines vers les tenants
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>.*)\\.csecur360\\.com',
          },
        ],
        destination: '/:tenant/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
