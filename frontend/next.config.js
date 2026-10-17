/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Required to generate the frontend/out folder for Express
  images: {
    unoptimized: true // Required when using static export
  }
};

module.exports = nextConfig;
