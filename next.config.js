/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'mdl.ca', 'vercel.app'],
  },
  async rewrites() {
    return [
      // Redirection des sous-domaines vers les tenants (EXCLUT les assets statiques)
      {
        source: '/((?!_next|api|favicon.ico|logo.png|manifest.json|.*\\.(png|jpg|jpeg|gif|svg|ico|css|js)).*)/:path*',
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
