import { timeline } from '../../data/projects'

const entry = timeline.find((item) => item.href === '/projects/gravity')

export const metadata = {
  title: 'Compute Shader Barnes–Hut N-Body',
  description:
    'Real-time Barnes–Hut n-body simulation with compute shaders on the GPU.',
}

export default function GravityProject() {
  return (
    <div className="embed-page">
      <p className="embed-intro">
        <span className="embed-year">{entry.year}</span>
        {entry.summary}
      </p>
      <iframe
        src="/gravity/index.html"
        title="GravityChunk"
        className="project-embed-frame"
        allow="clipboard-write"
      />
    </div>
  )
}
