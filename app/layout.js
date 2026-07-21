import './globals.css'
import Nav from './components/Nav'
import SiteFooter from './components/SiteFooter'

export const metadata = {
  title: 'Gabriel Kane — Portfolio',
  description: 'Projects, resume, and contact for Gabriel Kane',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
