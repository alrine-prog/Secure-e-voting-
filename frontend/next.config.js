/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Development proxy: forwards /api/* calls from Next.js (port 3000) to Express (port 5000)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000/api/:path*' 
          : '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
