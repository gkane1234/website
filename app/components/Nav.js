'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  if (pathname?.startsWith('/resume')) return null

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        Gabriel Kane
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/#work">Work</Link>
        </li>
      </ul>
    </nav>
  )
}
