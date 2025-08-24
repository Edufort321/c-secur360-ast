/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'mdl.ca', 'vercel.app'],
  },
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  typescript: {
    // Allow production builds to successfully complete even if
    // your project has type errors (for demo purposes)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even if
    // your project has ESLint errors (for demo purposes)
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
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
