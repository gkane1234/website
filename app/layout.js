import './globals.css'
import Nav from './components/Nav'

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
        <footer className="footer">
          &copy; {new Date().getFullYear()} Your Name. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
