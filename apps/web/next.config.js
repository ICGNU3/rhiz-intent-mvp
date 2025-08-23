/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@rhiz/db', '@rhiz/core', '@rhiz/workers'],
}

module.exports = nextConfig
