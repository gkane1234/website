'use client'

import { useEffect, useState } from 'react'

const blank = { title: '', degree: '', bullets: '' }

export default function Editor() {
  const [entries, setEntries] = useState([])
  const [defaults, setDefaults] = useState({ objective: '', skills: '' })
  const [objective, setObjective] = useState({ coding: '', teaching: '' })
  const [skills, setSkills] = useState({ coding: '', teaching: '' })
  const [drafts, setDrafts] = useState({})
  const [status, setStatus] = useState('Loading…')

  useEffect(() => {
    let cancel = false
    fetch('/api/resume-overrides')
      .then((response) => {
        if (!response.ok) throw new Error('This page is only available in local development.')
        return response.json()
      })
      .then((data) => {
        if (cancel) return
        setEntries(data.entries)
        setDefaults(data.defaults)
        setObjective({
          coding: data.overrides.coding.objective,
          teaching: data.overrides.teaching.objective,
        })
        setSkills({
          coding: data.overrides.coding.skills,
          teaching: data.overrides.teaching.skills,
        })
        const next = {}
        for (const entry of data.entries) {
          next[entry.id] = {
            coding: { ...blank, ...entry.codingFields },
            teaching: { ...blank, ...entry.teachingFields },
          }
        }
        setDrafts(next)
        setStatus('')
      })
      .catch((error) => {
        if (!cancel) setStatus(error.message)
      })
    return () => {
      cancel = true
    }
  }, [])

  function updateEntry(id, audience, key, value) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [audience]: { ...current[id][audience], [key]: value },
      },
    }))
  }

  async function save() {
    setStatus('Saving…')
    const body = {
      coding: { objective: objective.coding, skills: skills.coding, entries: {} },
      teaching: { objective: objective.teaching, skills: skills.teaching, entries: {} },
    }
    for (const entry of entries) {
      body.coding.entries[entry.id] = drafts[entry.id].coding
      body.teaching.entries[entry.id] = drafts[entry.id].teaching
    }
    const response = await fetch('/api/resume-overrides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      setStatus('Save failed.')
      return
    }
    setStatus('Saved. Preview the resumes, then generate the PDFs.')
  }

  async function generate() {
    setStatus('Writing PDFs…')
    const response = await fetch('/api/resume-pdf', { method: 'POST' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setStatus(data.error || 'PDF generation failed.')
      return
    }
    setStatus(data.message || 'PDFs written.')
  }

  if (!entries.length) {
    return (
      <main className="dev-resumes">
        <p>{status || 'Loading…'}</p>
      </main>
    )
  }

  return (
    <main className="dev-resumes">
      <header className="dev-resumes-bar">
        <div>
          <h1>Resume wording</h1>
          <p>
            A blank field uses the website text. Teaching uses the coding wording when its own field is blank.
            The layout stays fixed.
          </p>
        </div>
        <div className="dev-resumes-actions">
          <button type="button" onClick={save}>
            Save
          </button>
          <a href="/resume/data" target="_blank" rel="noreferrer">
            Preview coding
          </a>
          <a href="/resume/teaching" target="_blank" rel="noreferrer">
            Preview teaching
          </a>
          <button type="button" onClick={generate}>
            Generate PDFs
          </button>
        </div>
      </header>
      {status ? <p className="dev-resumes-status">{status}</p> : null}

      <section className="dev-card">
        <h2>Objective</h2>
        <p className="dev-default">{defaults.objective}</p>
        <label>
          Coding wording
          <textarea
            value={objective.coding}
            onChange={(event) => setObjective({ ...objective, coding: event.target.value })}
            rows={3}
          />
        </label>
        <label>
          Teaching wording
          <textarea
            value={objective.teaching}
            onChange={(event) => setObjective({ ...objective, teaching: event.target.value })}
            rows={3}
            placeholder="Leave blank to omit the objective on the teaching resume."
          />
        </label>
      </section>

      <section className="dev-card">
        <h2>Skills</h2>
        <p className="dev-default">{defaults.skills}</p>
        <label>
          Coding wording
          <textarea
            value={skills.coding}
            onChange={(event) => setSkills({ ...skills, coding: event.target.value })}
            rows={3}
            placeholder="Blank uses the website skills, in one line."
          />
        </label>
        <label>
          Teaching wording
          <textarea
            value={skills.teaching}
            onChange={(event) => setSkills({ ...skills, teaching: event.target.value })}
            rows={5}
            placeholder="One group per line, as Label: words. Blank uses the coding skills."
          />
        </label>
      </section>

      {entries.map((entry) => (
        <section key={entry.id} className="dev-card" id={`edit-${entry.id}`}>
          <h2>
            {entry.title} <span>{entry.year}</span>
          </h2>
          <p className="dev-meta">
            Coding {entry.coding} · Teaching {entry.teaching} · {entry.kind}
          </p>
          <p className="dev-default">{entry.summary}</p>
          {['coding', 'teaching'].map((audience) => (
            <fieldset key={audience}>
              <legend>{audience === 'coding' ? 'Coding wording' : 'Teaching wording'}</legend>
              <label>
                Title
                <input
                  value={drafts[entry.id][audience].title}
                  onChange={(event) => updateEntry(entry.id, audience, 'title', event.target.value)}
                />
              </label>
              {entry.kind === 'education' ? (
                <label>
                  Degree line
                  <input
                    value={drafts[entry.id][audience].degree}
                    onChange={(event) => updateEntry(entry.id, audience, 'degree', event.target.value)}
                  />
                </label>
              ) : null}
              <label>
                Bullets, one per line
                <textarea
                  value={drafts[entry.id][audience].bullets}
                  onChange={(event) => updateEntry(entry.id, audience, 'bullets', event.target.value)}
                  rows={4}
                />
              </label>
            </fieldset>
          ))}
        </section>
      ))}
    </main>
  )
}
