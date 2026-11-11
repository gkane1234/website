'use client'

import { usePathname } from 'next/navigation'
import { contact } from '../data/projects'

export default function SiteFooter() {
  const pathname = usePathname()
  // Full-bleed embeds hide the footer; the case-study page keeps site chrome.
  if (
    pathname?.startsWith('/resume') ||
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
        <a href="/gabriel-kane-coding.pdf">Coding resume</a>
        <a href="/gabriel-kane-teaching.pdf">Teaching resume</a>
      </div>
    </footer>
  )
}
