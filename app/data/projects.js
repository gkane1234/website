// Reverse chronological by when the work started. Ranges stay visible
// when something ran alongside later projects.
export const timeline = [
  {
    year: '2026',
    title: 'Elementary Math Worksheet Generator',
    summary:
      'Built a web app that generates printable math worksheets with randomized questions, KaTeX preview, and PDF export, from grade 6 through calculus.',
    tech: ['Next.js', 'Python', 'KaTeX', 'Vercel'],
    href: '/projects/elementary-math',
    linkLabel: 'Open',
  },
  {
    year: '2026',
    title: 'Maternal Health Analytics',
    context: 'Well on Their Way',
    summary:
      'Turned fragmented Excel health records for a maternal-health nonprofit in Gulu, Uganda into a Python pipeline, cleaned QGIS boundaries, and Tableau dashboards for training coverage and district impact.',
    tech: ['Python', 'Pandas', 'Tableau', 'QGIS', 'Plotly', 'GeoPandas'],
    href: '/projects/wotw',
    linkLabel: 'Case study',
  },
  {
    year: '2025 – 2026',
    title: 'Compute Shader Barnes–Hut N-Body',
    summary:
      'Real-time Barnes–Hut n-body simulation with compute shaders, built to handle tens of millions of bodies across a Java, GLSL, and Python codebase.',
    tech: ['Java', 'GLSL', 'Python', 'Compute Shaders'],
    // GravityChunk landing page from gkane1234/gravity `website/`.
    href: '/gravity/index.html',
    document: true,
    linkLabel: 'Open',
  },
  {
    year: '2025',
    title: 'Encore',
    summary:
      'Shipped features and fixes on a pre-launch startup codebase in SQL, React, HTML, and JavaScript, and took part in design and feature discussions.',
  },
  {
    year: '2024 – 2026',
    title: 'Inequivalent Expression Solver',
    summary:
      'Builds algebraically inequivalent expressions and searches for ways to hit a goal with +, −, ×, and ÷. Custom structures and compression brought a saved file from about 1.7 GB to about 100 MB, and load time from about 20 seconds to about 100 ms.',
    tech: ['JavaScript', 'Python', 'Java', 'Web Workers'],
    href: '/projects/inequivalent',
    linkLabel: 'Open',
  },
  {
    year: '2024 – 2026',
    title: 'Private Instructor',
    summary: 'Tutored calculus (AP and college-level) and statistics.',
  },
  {
    year: '2021 – 2024',
    title: 'Mathematics Faculty',
    context: 'Cambridge School of Weston · Weston, MA',
    summary:
      'Taught high-school mathematics, and wrote problem sets, assessments, and visualizations in LaTeX and Python.',
  },
  {
    year: '2021',
    title: 'Massachusetts Institute of Technology',
    context: 'B.S. Mathematics and Music · Cambridge, MA',
    summary:
      'GPA 4.8 / 5.0. Coursework included probability, linear algebra, real analysis, differential equations, complex analysis, and programming in Python.',
  },
]

export const primarySkills = [
  'Python',
  'Pandas',
  'SQL',
  'Java',
  'JavaScript',
  'React',
  'GLSL',
  'Tableau',
  'QGIS',
  'GeoPandas',
]

export const otherSkills = [
  'Git',
  'LaTeX',
  'Excel',
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
    'Shifting from teaching into data science and analyst work, using quantitative skills, a knack for distilling data and knowledge into key insights, and a joy for tough challenges.',
}
