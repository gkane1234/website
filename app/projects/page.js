import Link from 'next/link'

const projects = [
  {
    title: 'Elementary Math Worksheet Generator',
    description:
      'Generate printable math worksheets with randomized questions, KaTeX preview, and PDF export. Covers grade 6 through calculus.',
    tech: ['Next.js', 'Python', 'KaTeX', 'Vercel'],
    href: '/projects/elementary-math',
    external: false,
  },
  {
    title: 'Project Two',
    description: 'A short description of what this project does and why it matters.',
    tech: ['Next.js', 'Tailwind', 'Vercel'],
    href: '#',
    external: false,
  },
  {
    title: 'Project Three',
    description: 'A short description of what this project does and why it matters.',
    tech: ['Python', 'Flask', 'PostgreSQL'],
    href: '#',
    external: false,
  },
]

export default function Projects() {
  return (
    <div className="container">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {projects.map((project) => {
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
                key={project.title}
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
            <Link key={project.title} href={project.href} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
