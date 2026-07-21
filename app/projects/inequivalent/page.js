export const metadata = {
  title: 'Inequivalent Expression Solver',
  description:
    'Build algebraically inequivalent expressions and search for ways to hit a goal with +, −, ×, ÷.',
}

export default function InequivalentProject() {
  return (
    <div className="project-embed">
      <iframe
        src="/inequivalent/index.html"
        title="Inequivalent Expression Solver"
        className="project-embed-frame"
        allow="clipboard-write"
      />
    </div>
  )
}
