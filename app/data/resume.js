import overrides from './resume-overrides.json'
import { contact, otherSkills, primarySkills, timeline } from './projects'

export const resumeProfile = {
  name: 'Gabriel Kane',
  phone: '(703) 901-5591',
  email: contact.email,
  github: contact.github,
  githubLabel: 'https://github.com/gkane1234/',
  location: 'Los Angeles, 90025',
  site: 'https://gabriel-kane.com',
}

function blankEntry() {
  return { title: '', degree: '', bullets: '' }
}

export function emptyOverrides() {
  return {
    coding: { objective: '', skills: '', entries: {} },
    teaching: { objective: '', skills: '', entries: {} },
  }
}

export function normalizeOverrides(input) {
  const base = emptyOverrides()
  for (const audience of ['coding', 'teaching']) {
    const source = input?.[audience] || {}
    base[audience].objective = text(source.objective)
    base[audience].skills = text(source.skills)
    const entries = source.entries || {}
    for (const item of timeline) {
      const entry = entries[item.id] || {}
      const next = {
        title: text(entry.title),
        degree: text(entry.degree),
        bullets: text(entry.bullets),
      }
      if (next.title || next.degree || next.bullets) {
        base[audience].entries[item.id] = next
      }
    }
  }
  return base
}

function text(value) {
  return typeof value === 'string' ? value : ''
}

function lines(value) {
  return text(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function years(year) {
  const found = String(year).match(/\d{4}/g)
  if (!found) return { start: 0, end: 0 }
  const nums = found.map(Number)
  return { start: Math.min(...nums), end: Math.max(...nums) }
}

function formatYear(year) {
  return String(year).replace(/\s*–\s*/g, ' - ')
}

function entryOverride(audience, id, source) {
  return source?.[audience]?.entries?.[id] || blankEntry()
}

function resolvedCopy(item, audience, source) {
  const coding = entryOverride('coding', item.id, source)
  const teaching = entryOverride('teaching', item.id, source)
  const chosen = audience === 'teaching' ? teaching : coding
  const fallback = audience === 'teaching' ? coding : blankEntry()

  const title = chosen.title.trim() || fallback.title.trim() || item.title
  const degree = chosen.degree.trim() || fallback.degree.trim() || item.degree || ''
  const replacedTitle = Boolean(chosen.title.trim() || (audience === 'teaching' && fallback.title.trim()))

  let bullets
  if (chosen.bullets.trim()) bullets = lines(chosen.bullets)
  else if (audience === 'teaching' && fallback.bullets.trim()) bullets = lines(fallback.bullets)
  else if (item.resumeBullets?.length) bullets = item.resumeBullets
  else bullets = [item.summary]

  return {
    title,
    degree,
    bullets,
    context: replacedTitle ? '' : item.context || '',
  }
}

function roleLine(copy, year, audience) {
  const parts = [copy.title]
  if (copy.context) parts.push(copy.context.replace(/\s·\s/g, ', '))
  const left = parts.join(', ')
  const when = formatYear(year)
  return audience === 'teaching' ? `${left} | ${when}` : `${left}, ${when}`
}

function projectLink(item) {
  const href = item.repo || (item.external ? item.href : '')
  if (!href) return null
  return {
    href,
    label: href.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  }
}

function sectionFor(item, audience) {
  if (item.kind === 'education') return 'education'
  if (audience === 'teaching' && item.teachingSection) return item.teachingSection
  return item.kind
}

function byRelevance(audience) {
  return (a, b) => {
    const score = b.item[audience] - a.item[audience]
    if (score) return score
    const end = b.span.end - a.span.end
    if (end) return end
    const start = b.span.start - a.span.start
    if (start) return start
    return a.index - b.index
  }
}

function skillLine(source) {
  const custom = source?.coding?.skills?.trim()
  if (custom) return custom
  return [...primarySkills, ...otherSkills].join(', ')
}

function skillBlocks(audience, source) {
  if (audience === 'teaching' && source?.teaching?.skills?.trim()) {
    return lines(source.teaching.skills).map((line) => {
      const index = line.indexOf(':')
      if (index === -1) return { label: '', text: line }
      return {
        label: line.slice(0, index).trim(),
        text: line.slice(index + 1).trim(),
      }
    })
  }
  const codingSkills = source?.coding?.skills?.trim()
  if (audience === 'teaching' && codingSkills) return [{ label: '', text: codingSkills }]
  return [{ label: '', text: skillLine(source) }]
}

export function buildResume(audience, source = overrides) {
  const ranked = timeline
    .map((item, index) => ({ item, index, span: years(item.year) }))
    .filter((row) => row.item[audience] > 0)
    .sort(byRelevance(audience))

  const grouped = { education: [], experience: [], project: [] }
  for (const row of ranked) {
    const copy = resolvedCopy(row.item, audience, source)
    const section = sectionFor(row.item, audience)
    const replacedTitle = copy.title !== row.item.title
    grouped[section].push({
      id: row.item.id,
      org: replacedTitle ? copy.title : row.item.org || copy.title,
      titleLine: roleLine(copy, row.item.year, audience),
      degree: copy.degree,
      bullets: copy.bullets,
      link: section === 'project' ? projectLink(row.item) : null,
    })
  }

  const objectiveOverride = source?.[audience]?.objective?.trim() || ''
  const objective =
    audience === 'teaching' ? objectiveOverride : objectiveOverride || contact.objective

  return {
    audience,
    profile: resumeProfile,
    objective,
    education: grouped.education,
    experience: grouped.experience,
    projects: grouped.project,
    skills: skillBlocks(audience, source),
  }
}

export function editorEntries(source = overrides) {
  return timeline.map((item) => ({
    id: item.id,
    title: item.title,
    year: item.year,
    summary: item.summary,
    kind: item.kind,
    coding: item.coding,
    teaching: item.teaching,
    codingFields: { ...blankEntry(), ...entryOverride('coding', item.id, source) },
    teachingFields: { ...blankEntry(), ...entryOverride('teaching', item.id, source) },
  }))
}

export function editorDefaults() {
  return {
    objective: contact.objective,
    skills: [...primarySkills, ...otherSkills].join(', '),
  }
}
