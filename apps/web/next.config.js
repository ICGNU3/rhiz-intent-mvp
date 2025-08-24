/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rhiz/db', '@rhiz/core', '@rhiz/workers'],
}

module.exports = nextConfig
