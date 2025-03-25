/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', '192.168.140.3'],
  },
}

module.exports = nextConfig 