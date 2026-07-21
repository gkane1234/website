import { contact } from '../data/projects'

export default function Contact() {
  return (
    <div className="container">
      <h2 className="section-title">Contact</h2>
      <div className="contact-info">
        <a href={`mailto:${contact.email}`} className="contact-item">
          <div>
            <div className="label">Email</div>
            <div className="value">{contact.email}</div>
          </div>
        </a>
        <a href={contact.phoneHref} className="contact-item">
          <div>
            <div className="label">Phone</div>
            <div className="value">{contact.phone}</div>
          </div>
        </a>
        <a
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-item"
        >
          <div>
            <div className="label">GitHub</div>
            <div className="value">{contact.githubLabel}</div>
          </div>
        </a>
        <div className="contact-item">
          <div>
            <div className="label">Location</div>
            <div className="value">{contact.location}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
