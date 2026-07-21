import { skills, contact, education } from '../data/projects'

export default function About() {
  return (
    <div className="container">
      <h2 className="section-title">About Me</h2>
      <div className="about-content">
        <p>
          I&apos;m Gabriel Kane, an MIT Mathematics and Music graduate based in{' '}
          {contact.location}. I&apos;m looking for a data science role that uses
          deep research, trend finding, and building clear analytical tools.
        </p>
        <p>
          I&apos;ve taught high school math, tutored calculus and statistics,
          contributed to a startup codebase, and turned messy nonprofit health
          data into Tableau dashboards. Outside of work I trail run and sing jazz.
        </p>

        <div>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Education</h3>
          {education.map((school) => (
            <p key={school.title}>
              <strong>{school.title}</strong>
              <br />
              {school.meta}
              <br />
              {school.detail}
            </p>
          ))}
        </div>

        <div>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>
            Skills &amp; Tools
          </h3>
          <div className="skills">
            {skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
