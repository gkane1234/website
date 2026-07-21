import Link from 'next/link'
import { projects } from '../data/projects'

export default function ProjectCard({ project }) {
  const className = 'project-card'
  const content = (
    <>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="tech">
        {project.tech.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </>
  )

  if (project.external) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={project.href} className={className}>
      {content}
    </Link>
  )
}

export function ProjectsGrid() {
  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </div>
  )
}
