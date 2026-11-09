import { timeline } from '../../data/projects'

const entry = timeline.find((item) => item.href === '/projects/inequivalent')

export const metadata = {
  title: 'Inequivalent Expression Solver',
  description:
    'Build algebraically inequivalent expressions and search for ways to hit a goal with +, −, ×, ÷.',
}

export default function InequivalentProject() {
  return (
    <div className="embed-page">
      <p className="embed-intro">
        <span className="embed-year">{entry.year}</span>
        {entry.summary}
      </p>
      <iframe
        src="/inequivalent/index.html"
        title="Inequivalent Expression Solver"
        className="project-embed-frame"
        allow="clipboard-write"
      />
    </div>
  )
}
