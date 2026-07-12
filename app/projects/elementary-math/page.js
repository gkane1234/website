export const metadata = {
  title: 'Elementary Math Worksheet Generator',
  description: 'Generate printable math worksheets with randomized questions and PDF export.',
}

export default function ElementaryMathProject() {
  return (
    <div className="project-embed">
      <iframe
        src="https://elementary-math.vercel.app"
        title="Elementary Math Worksheet Generator"
        className="project-embed-frame"
        allow="clipboard-write"
      />
    </div>
  )
}
