import { ProjectsGrid } from './components/ProjectsGrid'
import { skills, contact, experience, education } from './data/projects'

export default function Home() {
  return (
    <main className="home">
      <section className="hero hero-home">
        <h1>Gabriel Kane</h1>
        <p className="hero-contact">
          <a href={contact.phoneHref}>{contact.phone}</a>
          <span aria-hidden="true"> · </span>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <span aria-hidden="true"> · </span>
          <a href={contact.github} target="_blank" rel="noopener noreferrer">
            {contact.githubLabel}
          </a>
          <span aria-hidden="true"> · </span>
          <span>{contact.location}</span>
        </p>
        <p className="tagline">{contact.objective}</p>
        <div className="hero-actions">
          <a href="#resume" className="cta">
            View resume
          </a>
          <a href="#projects" className="cta cta-ghost">
            Projects
          </a>
        </div>
      </section>

      <section id="resume" className="home-section container">
        <div className="resume-header">
          <div>
            <h2 className="section-title">Resume</h2>
            <p className="section-lead">{contact.objective}</p>
          </div>
        </div>

        <div className="resume-grid">
          <div className="resume-block">
            <h3>Experience</h3>
            <ul className="resume-list">
              {experience.map((job) => (
                <li key={job.title + job.meta}>
                  <strong>{job.title}</strong>
                  <span className="resume-meta">{job.meta}</span>
                  {job.bullets.map((bullet) => (
                    <p key={bullet}>{bullet}</p>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          <div className="resume-block">
            <h3>Education</h3>
            <ul className="resume-list">
              {education.map((school) => (
                <li key={school.title}>
                  <strong>{school.title}</strong>
                  <span className="resume-meta">{school.meta}</span>
                  <p>{school.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="resume-block resume-skills">
          <h3>Skills</h3>
          <div className="skills">
            {skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="home-section container">
        <h2 className="section-title">Projects</h2>
        <p className="section-lead">
          Selected work — interactive apps and case studies.
        </p>
        <ProjectsGrid />
      </section>

      <section id="contact" className="home-section container home-contact">
        <h2 className="section-title">Contact</h2>
        <div className="contact-strip">
          <a href={`mailto:${contact.email}`}>
            <span className="label">Email</span>
            <span className="value">{contact.email}</span>
          </a>
          <a href={contact.phoneHref}>
            <span className="label">Phone</span>
            <span className="value">{contact.phone}</span>
          </a>
          <a href={contact.github} target="_blank" rel="noopener noreferrer">
            <span className="label">GitHub</span>
            <span className="value">{contact.githubLabel}</span>
          </a>
          <div>
            <span className="label">Location</span>
            <span className="value">{contact.location}</span>
          </div>
        </div>
      </section>
    </main>
  )
}
