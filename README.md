# Gabriel Kane — Portfolio

Personal portfolio site for **Gabriel Kane** (MIT B.S. Mathematics & Music): resume, selected projects, and contact. Built with [Next.js](https://nextjs.org/) and deployed on [Vercel](https://vercel.com/).

## What’s here

- **Home** — hero, resume (experience, education, skills), and project highlights
- **Projects** — case studies and embeds for selected work
- **About** / **Contact** — bio and ways to reach out

### Featured projects

| Project | Summary |
| --- | --- |
| [Maternal Health Analytics (WotW)](./app/projects/wotw) | End-to-end analytics for Well on Their Way (Gulu, Uganda): Python/Pandas cleaning, QGIS boundaries, Tableau dashboards |
| [Elementary Math Worksheet Generator](./app/projects/elementary-math) | Printable worksheets with randomized questions, KaTeX preview, and PDF export (grade 6 through calculus) |
| [Inequivalent Expression Solver](./app/projects/inequivalent) | Algorithm for producing inequivalent algebraic expressions; custom data structures and compression |
| [Compute Shader Barnes–Hut N-Body](https://github.com/gkane1234/gravity) | Real-time n-body simulation with compute shaders (Java, GLSL, Python) — external repo |

Project metadata lives in [`app/data/projects.js`](./app/data/projects.js).

## Stack

- **Next.js 14** (App Router) + React 18
- Static/content-driven pages under `app/`
- Hosted on Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # serve the production build
```

## Deploy

Push to GitHub and import the repo in [Vercel](https://vercel.com/). Next.js is auto-detected; no special build config is required for a basic deploy.
