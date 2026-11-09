import { timeline } from '../../data/projects'

const entry = timeline.find((item) => item.href === '/projects/elementary-math')

export const metadata = {
  title: 'Elementary Math Worksheet Generator',
  description:
    'Generate printable math worksheets with randomized questions and PDF export.',
}

export default function ElementaryMathProject() {
  return (
    <div className="embed-page">
      <p className="embed-intro">
        <span className="embed-year">{entry.year}</span>
        {entry.summary}
      </p>
      <iframe
        src="https://elementary-math.vercel.app"
        title="Elementary Math Worksheet Generator"
        className="project-embed-frame"
        allow="clipboard-write"
      />
    </div>
  )
}
