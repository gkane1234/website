import Timeline from './components/Timeline'
import { contact, otherSkills, primarySkills } from './data/projects'

export default function Home() {
  return (
    <main className="home">
      <section className="hero hero-home">
        <h1>Gabriel Kane</h1>
        <p className="hero-contact">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <span aria-hidden="true"> · </span>
          <a href={contact.github} target="_blank" rel="noopener noreferrer">
            {contact.githubLabel}
          </a>
          <span aria-hidden="true"> · </span>
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
            {contact.linkedinLabel}
          </a>
          <span aria-hidden="true"> · </span>
          <span>{contact.location}</span>
        </p>
        <p className="tagline">{contact.objective}</p>
      </section>

      <section id="work" className="home-section container">
        <h2 className="section-title">Work</h2>
        <Timeline />
      </section>

      <section id="skills" className="home-section container">
        <h2 className="section-title">Skills</h2>
        <div className="skills">
          {primarySkills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
        <p className="skills-also-label">Also</p>
        <div className="skills skills-also">
          {otherSkills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
