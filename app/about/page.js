export default function About() {
  return (
    <div className="container">
      <h2 className="section-title">About Me</h2>
      <div className="about-content">
        <p>
          {/* TODO: Replace with your bio */}
          Hello! I&apos;m Gabriel Kane, a deep thinker based in Los Angeles.
          I enjoy building [what you build] and I&apos;m passionate about [your interests].
        </p>
        <p>
          {/* TODO: Add more background */}
          When I&apos;m not coding, you can find me trail running or singing jazz.
          I&apos;m currently [what you&apos;re working on or learning].
        </p>

        <div>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Skills &amp; Tools</h3>
          <div className="skills">
            {/* TODO: Replace with your actual skills */}
            {[
              'JavaScript',
              'React',
              'Next.js',
              'Node.js',
              'CSS',
              'Git',
              'Figma',
              'Python',
            ].map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
