/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/contact', destination: '/#contact', permanent: false },
      { source: '/projects', destination: '/#work', permanent: false },
      {
        source: '/projects/gravity',
        destination: '/gravity/index.html',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
