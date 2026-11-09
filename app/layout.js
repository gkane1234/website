import './globals.css'
import Nav from './components/Nav'
import SiteFooter from './components/SiteFooter'

export const metadata = {
  title: 'Gabriel Kane — Portfolio',
  description:
    'Gabriel Kane, shifting from teaching into data science and analysis. Chronological work, skills, and contact.',
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
