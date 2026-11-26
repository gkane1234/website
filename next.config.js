/** @type {import('next').NextConfig} */
// Vercel project gravity-website, from gkane1234/gravity `website/`.
const gravitySite = 'https://gravity-website-gabes-projects-3f71fd6a.vercel.app'

const nextConfig = {
  async redirects() {
    return [
      { source: '/contact', destination: '/#contact', permanent: false },
      { source: '/projects', destination: '/#work', permanent: false },
      { source: '/projects/gravity', destination: gravitySite, permanent: false },
      { source: '/gravity', destination: gravitySite, permanent: false },
      { source: '/gravity/index.html', destination: gravitySite, permanent: false },
      { source: '/gravity/:path*', destination: `${gravitySite}/:path*`, permanent: false },
    ]
  },
}

module.exports = nextConfig
