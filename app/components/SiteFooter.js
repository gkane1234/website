'use client'

import { usePathname } from 'next/navigation'

export default function SiteFooter() {
  const pathname = usePathname()
  // Full-bleed embeds hide the footer; case-study project pages keep site chrome.
  if (
    pathname === '/projects/elementary-math' ||
    pathname === '/projects/inequivalent'
  ) {
    return null
  }

  return (
    <footer className="footer">
      &copy; {new Date().getFullYear()} Gabriel Kane. All rights reserved.
    </footer>
  )
}
