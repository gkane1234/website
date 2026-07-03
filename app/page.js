import Link from 'next/link'

export default function Home() {
  return (
    <section className="hero">
      <h1>Hi, I&apos;m Your Name</h1>
      <p className="tagline">
        {/* TODO: Replace with your tagline */}
        A developer / designer / creator building things for the web.
      </p>
      <Link href="/projects" className="cta">
        View My Work
      </Link>
    </section>
  )
}
