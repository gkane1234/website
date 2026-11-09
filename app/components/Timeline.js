import Link from 'next/link'
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
  return (
    <ol className="timeline">
      {timeline.map((item) => (
        <li key={item.title}>
          <span className="timeline-year">{item.year}</span>
          <div>
            <h3>{item.title}</h3>
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
            <TimelineLink item={item} />
          </div>
        </li>
      ))}
    </ol>
  )
}
