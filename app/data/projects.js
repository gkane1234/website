export const projects = [
  {
    title: 'Elementary Math Worksheet Generator',
    description:
      'Generate printable math worksheets with randomized questions, KaTeX preview, and PDF export. Covers grade 6 through calculus.',
    tech: ['Next.js', 'Python', 'KaTeX', 'Vercel'],
    href: '/projects/elementary-math',
    external: false,
  },
  {
    title: 'Inequivalent Expression Solver',
    description:
      'Novel algorithm for producing inequivalent algebraic expressions, with applications in machine-assisted formula creation. Optimized custom data structures and compression for memory and compute.',
    tech: ['JavaScript', 'Python', 'Java', 'Web Workers'],
    href: '/projects/inequivalent',
    external: false,
  },
  {
    title: 'Compute Shader Barnes–Hut N-Body',
    description:
      'Barnes–Hut n-body simulation with compute shaders — researched optimizations to simulate tens of millions of objects in real time across a large Java, GLSL, and Python codebase.',
    tech: ['Java', 'GLSL', 'Python', 'Compute Shaders'],
    href: 'https://github.com/gkane1234/gravity',
    external: true,
  },
  {
    title: 'Maternal Health Analytics (Well on Their Way)',
    description:
      'End-to-end analytics for a maternal-health nonprofit in Gulu, Uganda: Python data cleaning, QGIS boundary layers, and Tableau dashboards for VHT training and district impact.',
    tech: ['Python', 'Pandas', 'Tableau', 'QGIS', 'Plotly', 'GeoPandas'],
    href: '/projects/wotw',
    external: false,
  },
]

export const skills = [
  'Python',
  'Pandas',
  'SQL',
  'Java',
  'JavaScript',
  'React',
  'Git',
  'LaTeX',
  'GLSL',
  'Tableau',
  'QGIS',
  'GeoPandas',
  'Excel',
  'Data Cleaning',
  'Data Transformation',
]

export const experience = [
  {
    title: 'Well on Their Way',
    meta: '2026',
    bullets: [
      'Standardized fragmented nonprofit Excel health data into analysis-ready datasets with Pandas.',
      'Automated import and restructuring in Python to cut manual prep on recurring updates.',
      'Cleaned district boundary layers in QGIS and joined them to metrics for maps.',
      'Built dynamic Tableau dashboards on cleaned data using hand-vectored boundary layers.',
    ],
  },
  {
    title: 'Private Instructor',
    meta: '2024 – 2026',
    bullets: [
      'Delivered personalized instruction in Calculus (AP, college-level) and Statistics.',
    ],
  },
  {
    title: 'Encore',
    meta: '2025',
    bullets: [
      'Contributed features and bug fixes to a pre-launch startup codebase in SQL, React, HTML, and JavaScript.',
      'Participated in discussions on design best practices and feature creation.',
    ],
  },
  {
    title: 'Mathematics Faculty, Cambridge School of Weston',
    meta: '2021 – 2024 · Weston, MA',
    bullets: [
      'Planned, organized, and taught mathematics courses to high school students.',
      'Collaborated on courses, budget, and individual students in faculty meetings.',
      'Used LaTeX and Python to create problem sets, assessments, and visualizations.',
    ],
  },
]

export const education = [
  {
    title: 'Massachusetts Institute of Technology (MIT)',
    meta: 'B.S. Mathematics and Music (Double Major) · 2021 · Cambridge, MA',
    detail: 'GPA 4.8 / 5.0. Coursework: Probability and Random Variables, Linear Algebra, Project Lab in Mathematics, Fundamentals of Programming (Python), Real Analysis, Differential Equations, Complex Analysis.',
  },
]

export const contact = {
  email: 'gkane@alum.mit.edu',
  phone: '(703) 901-5591',
  phoneHref: 'tel:+17039015591',
  github: 'https://github.com/gkane1234/',
  githubLabel: 'github.com/gkane1234',
  location: 'Los Angeles, CA 90025',
  objective:
    'Data science role utilizing MIT education, passion for deep research, and trend finding.',
}
