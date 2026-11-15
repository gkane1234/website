'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { timeline } from '../data/projects'

function TimelineLink({ item }) {
  if (!item.href) return null

  // A static document (the GravityChunk page) needs a full navigation.
  // Client-side Link only resolves app routes.
  if (item.external || item.document) {
    const newTab = item.external
    return (
      <a
        className="timeline-link"
        href={item.href}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {item.linkLabel}
      </a>
    )
  }

  return (
    <Link className="timeline-link" href={item.href}>
      {item.linkLabel}
    </Link>
  )
}

export default function Timeline() {
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (timeline.some((item) => item.id === id)) setOpenId(id)
  }, [])

  return (
    <ol className="timeline">
      {timeline.map((item) => {
        const open = openId === item.id
        const canOpen = Boolean(item.href)
        return (
          <li key={item.id} id={item.id}>
            <span className="timeline-year">{item.year}</span>
            <div>
              <h3>
                {canOpen ? (
                  <button
                    type="button"
                    className="timeline-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    {item.title}
                  </button>
                ) : (
                  item.title
                )}
              </h3>
              {item.context ? (
                <p className="timeline-context">{item.context}</p>
              ) : null}
              <p className="timeline-summary">{item.summary}</p>
              {item.tech ? (
                <div className="tech">
                  {item.tech.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>
              ) : null}
              {open ? (
                <div className="timeline-more">
                  <TimelineLink item={item} />
                </div>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
