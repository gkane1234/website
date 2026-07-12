'use client'

import { usePathname } from 'next/navigation'

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/projects/') && pathname !== '/projects') {
    return null
  }

  return (
    <footer className="footer">
      &copy; {new Date().getFullYear()} Your Name. All rights reserved.
    </footer>
  )
}
