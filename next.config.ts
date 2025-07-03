/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'mdl.ca', 'vercel.app'],
  },
  async rewrites() {
    return [
      // Redirection des sous-domaines
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>.*)\\.mdl\\.ca',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
