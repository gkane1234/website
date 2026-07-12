import './globals.css'
import Nav from './components/Nav'
import SiteFooter from './components/SiteFooter'

export const metadata = {
  title: 'Your Name — Portfolio',
  description: 'Personal portfolio website',
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
