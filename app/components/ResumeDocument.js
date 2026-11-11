function labeled(text) {
  const index = text.indexOf(':')
  if (index > 0 && index < 28) {
    return (
      <>
        <strong>{text.slice(0, index)}:</strong>
        {text.slice(index + 1)}
      </>
    )
  }
  return text
}

function Entry({ item }) {
  return (
    <article className="resume-entry">
      <h3>
        <a className="resume-source" href={item.siteHref}>
          {item.titleLine}
        </a>
        {item.link ? (
          <>
            {item.linkSeparator}
            <a href={item.link.href}>{item.link.label}</a>
          </>
        ) : null}
      </h3>
      {item.degree ? <p className="resume-degree">{item.degree}</p> : null}
      <ul>
        {item.bullets.map((bullet) => (
          <li key={bullet}>{labeled(bullet)}</li>
        ))}
      </ul>
    </article>
  )
}

export default function ResumeDocument({ resume }) {
  const site = resume.profile.site
  const withSite = (item) => ({
    ...item,
    siteHref: `${site}/#${item.id}`,
    linkSeparator: resume.audience === 'teaching' ? ' | ' : ', ',
  })

  return (
    <main className="resume-page">
      <article className="resume-sheet">
        <header className="resume-top">
          <h1>{resume.profile.name}</h1>
          <p className="resume-contact">
            <span>{resume.profile.phone}</span>
            {' | '}
            <a href={`mailto:${resume.profile.email}`}>{resume.profile.email}</a>
            {' | '}
            <a href={resume.profile.github}>{resume.profile.githubLabel}</a>
          </p>
          <p className="resume-place">{resume.profile.location}</p>
        </header>

        {resume.objective ? (
          <section>
            <h2>Objective</h2>
            <p className="resume-objective">{resume.objective}</p>
          </section>
        ) : null}

        <section>
          <h2>Education</h2>
          {resume.education.map((item) => (
            <article key={item.id} className="resume-entry">
              <h3>
                <a className="resume-source" href={`${site}/#${item.id}`}>
                  {item.org || item.titleLine}
                </a>
              </h3>
              {item.degree ? <p className="resume-degree">{item.degree}</p> : null}
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{labeled(bullet)}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {resume.experience.length ? (
          <section>
            <h2>Experience</h2>
            {resume.experience.map((item) => (
              <Entry key={item.id} item={withSite(item)} />
            ))}
          </section>
        ) : null}

        {resume.projects.length ? (
          <section>
            <h2>{resume.audience === 'teaching' ? 'Selected Projects' : 'Projects'}</h2>
            {resume.projects.map((item) => (
              <Entry key={item.id} item={withSite(item)} />
            ))}
          </section>
        ) : null}

        <section>
          <h2>Skills</h2>
          {resume.skills.map((block) =>
            block.label ? (
              <p key={block.label} className="resume-skills">
                <strong>{block.label}:</strong> {block.text}
              </p>
            ) : (
              <p key={block.text} className="resume-skills">
                {block.text}
              </p>
            )
          )}
        </section>
      </article>
    </main>
  )
}
