import { ProjectsGrid } from '../components/ProjectsGrid'

export default function Projects() {
  return (
    <div className="container">
      <h2 className="section-title">Projects</h2>
      <p className="section-lead">Selected work you can open and try.</p>
      <ProjectsGrid />
    </div>
  )
}
