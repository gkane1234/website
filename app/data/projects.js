// Newest end year first. Within one end year, projects come before
// experiences, then education. Within a group, a later start year comes first.
// coding / teaching are resume relevance scores: 2 leads, 1 is included, 0 is omitted.
export const timeline = [
  {
    id: 'worksheet',
    year: '2026',
    title: 'Elementary Math Worksheet Generator',
    summary:
      'Built a web app that generates highly customizable printable math worksheets covering specific topics and learned difficulty levels for grade 6 through calculus. Includes Stripe integration for payments.',
    tech: ['Next.js', 'Python', 'KaTeX', 'Vercel', 'Stripe'],
    href: '/projects/elementary-math',
    linkLabel: 'Open',
    repo: 'https://github.com/gkane1234/elementary_math',
    kind: 'project',
    coding: 2,
    teaching: 2,
  },
  {
    id: 'nbody',
    year: '2025 – 2026',
    title: 'Compute Shader Barnes–Hut N-Body',
    summary:
      'Real-time Barnes–Hut n-body simulation made with compute shaders in GLSL, built to handle tens of millions of bodies in real-time.',
    tech: ['Java', 'GLSL', 'Python', 'Compute Shaders'],
    // GravityChunk landing page from gkane1234/gravity `website/` (gravity-website).
    href: '/projects/gravity',
    linkLabel: 'Open',
    repo: 'https://github.com/gkane1234/gravity',
    kind: 'project',
    coding: 2,
    teaching: 1,
  },
  {
    id: 'inequivalent',
    year: '2024 – 2026',
    title: 'Inequivalent Expression Solver',
    summary:
      'Deep exploration of the generation of inequivalent algebraic expressions. Using a recreation of a known combinatorial generator, a custom stochastic approach with compression. A web version and a desktop version.',
    tech: ['Java', 'JavaScript', 'Python', 'Web Workers'],
    href: '/projects/inequivalent',
    linkLabel: 'Open',
    repo: 'https://github.com/gkane1234/Inequivalent',
    kind: 'project',
    coding: 2,
    teaching: 0,
  },
  {
    id: 'wotw',
    year: '2026',
    title: 'Maternal Health Analytics',
    context: 'Well on Their Way',
    summary:
      'Turned fragmented Excel health records for a maternal-health nonprofit in Gulu, Uganda into a Python pipeline, used Tableau dashboards for training coverage and district impact. Maintains a google sheets dashboard for tracking and visualizing data.',
    tech: ['Python', 'Pandas', 'Tableau', 'Google Sheets'],
    href: '/projects/wotw',
    linkLabel: 'Case study',
    kind: 'experience',
    teachingSection: 'project',
    coding: 2,
    teaching: 2,
  },
  {
    id: 'private-instructor',
    year: '2024 – 2026',
    title: 'Private Instructor',
    summary: 'Tutored calculus (AP and college-level), statistics, college computer science, elementary math, early algebra, and more.',
    kind: 'experience',
    coding: 1,
    teaching: 2,
  },
  {
    id: 'encore',
    year: '2025',
    title: 'Encore',
    summary:
      'Shipped features and fixes on a collaborative codebase in SQL, React, HTML, and JavaScript, and took part in design and feature discussions.',
    kind: 'experience',
    coding: 2,
    teaching: 0,
  },
  {
    id: 'faculty',
    year: '2021 – 2024',
    title: 'Mathematics Faculty',
    context: 'Cambridge School of Weston · Weston, MA',
    summary:
      'Taught advanced high-school mathematics at a small private high-school. Worked with faculty to improve the curriculum and teaching methods.',
    kind: 'experience',
    coding: 1,
    teaching: 2,
  },
  {
    id: 'mit',
    year: '2021',
    title: 'Massachusetts Institute of Technology',
    context: 'B.S. Mathematics and Music · Cambridge, MA',
    summary:
      'GPA 4.8 / 5.0. Coursework included probability, linear algebra, real analysis, differential equations, complex analysis, and programming in Python.',
    kind: 'education',
    coding: 2,
    teaching: 2,
    org: 'Massachusetts Institute of Technology (MIT), Cambridge, MA',
    degree: 'Bachelor of Science (B.S.) Mathematics and Music (Double Major), 2021',
    resumeBullets: [
      'GPA: 4.8 out of 5.0',
      'Coursework: Probability and Random Variables, Linear Algebra, Real Analysis, Differential Equations, Complex Analysis, and programming in Python.',
    ],
  },
]

export const primarySkills = [
  'Java',
  'Python',
  'Pandas',
  'SQL',
  'JavaScript',
  'React',
  'Next.js',
  'Vercel',
  'GLSL',
  'Tableau',
  'Google Sheets',
  'Stripe',
]

export const otherSkills = [
  'Git',
  'LaTeX',
  'Excel',
  'QGIS',
  'Data Cleaning',
  'Data Transformation',
]

export const contact = {
  email: 'gkane@alum.mit.edu',
  github: 'https://github.com/gkane1234/',
  githubLabel: 'github.com/gkane1234',
  linkedin: 'https://www.linkedin.com/in/gabriel-kane',
  linkedinLabel: 'linkedin.com/in/gabriel-kane',
  location: 'Los Angeles, CA',
  objective:
    'Software development, teaching, and data analytics. Using quantitative skills, a knack for distilling data and knowledge into key insights, and a joy for tough challenges.',
}
