/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@scholarpass/shared', '@scholarpass/ui'],
}

module.exports = nextConfig
