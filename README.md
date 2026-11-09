# Gabriel Kane — Portfolio

Personal portfolio site for **Gabriel Kane** (MIT B.S. Mathematics & Music). One chronological list of work — recent projects and earlier teaching — plus skills and contact. Built with [Next.js](https://nextjs.org/) and deployed on [Vercel](https://vercel.com/).

## What’s here

- **Home** — objective, work in reverse chronological order, and skills
- **Project pages** — the worksheet generator, the expression solver, the GravityChunk landing page, and the Well on Their Way case study

Work entries, skills, and contact details live in [`app/data/projects.js`](./app/data/projects.js).

### Work

| When | What |
| --- | --- |
| 2026 | [Maternal Health Analytics (Well on Their Way)](./app/projects/wotw) |
| 2026 | [Elementary Math Worksheet Generator](./app/projects/elementary-math) |
| 2025 – 2026 | [Compute Shader Barnes–Hut N-Body (GravityChunk)](./public/gravity/index.html) |
| 2025 | Encore |
| 2024 – 2026 | [Inequivalent Expression Solver](./app/projects/inequivalent) |
| 2024 – 2026 | Private instruction in calculus and statistics |
| 2021 – 2024 | Mathematics faculty, Cambridge School of Weston |
| 2021 | MIT, B.S. Mathematics and Music |

Well on Their Way figures are omitted until real dashboard and map exports replace the old placeholders.

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
