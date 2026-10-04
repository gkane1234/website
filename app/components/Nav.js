'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
]

const TRAVEL_LOG_LOGIN = 'https://gabriel-kane.com/travel-log/login'

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        Gabriel Kane
      </Link>
      <ul className="nav-links">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={
                pathname === href || (href !== '/' && pathname?.startsWith(href + '/'))
                  ? 'active'
                  : ''
              }
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          <a href={TRAVEL_LOG_LOGIN} className="nav-login">
            Login
          </a>
        </li>
      </ul>
    </nav>
  )
}
