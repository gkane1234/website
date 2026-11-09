import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        Gabriel Kane
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/#work">Work</Link>
        </li>
      </ul>
    </nav>
  )
}
