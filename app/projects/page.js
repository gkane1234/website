const projects = [
  {
    title: 'Project One',
    description: 'A short description of what this project does and why it matters.',
    tech: ['React', 'Node.js', 'MongoDB'],
    link: '#',
  },
  {
    title: 'Project Two',
    description: 'A short description of what this project does and why it matters.',
    tech: ['Next.js', 'Tailwind', 'Vercel'],
    link: '#',
  },
  {
    title: 'Project Three',
    description: 'A short description of what this project does and why it matters.',
    tech: ['Python', 'Flask', 'PostgreSQL'],
    link: '#',
  },
]

export default function Projects() {
  return (
    <div className="container">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="tech">
              {project.tech.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
