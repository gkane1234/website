'use client'

import { usePathname } from 'next/navigation'
import { contact } from '../data/projects'

export default function SiteFooter() {
  const pathname = usePathname()
  // Full-bleed embeds hide the footer; the case-study page keeps site chrome.
  if (
    pathname === '/projects/elementary-math' ||
    pathname === '/projects/inequivalent'
  ) {
    return null
  }

  return (
    <footer className="footer" id="contact">
      <div className="footer-links">
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <a href={contact.github} target="_blank" rel="noopener noreferrer">
          {contact.githubLabel}
        </a>
        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
          {contact.linkedinLabel}
        </a>
        <span>{contact.location}</span>
      </div>
    </footer>
  )
}
