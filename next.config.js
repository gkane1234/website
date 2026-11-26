/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/contact', destination: '/#contact', permanent: false },
      { source: '/projects', destination: '/#work', permanent: false },
    ]
  },
}

module.exports = nextConfig
