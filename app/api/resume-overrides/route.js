import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import {
  editorDefaults,
  editorEntries,
  normalizeOverrides,
} from '../../data/resume'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const filePath = path.join(process.cwd(), 'app/data/resume-overrides.json')

function denied() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return null
}

export async function GET() {
  const blocked = denied()
  if (blocked) return blocked
  const raw = await fs.readFile(filePath, 'utf8')
  const overrides = normalizeOverrides(JSON.parse(raw))
  return NextResponse.json({
    overrides,
    entries: editorEntries(overrides),
    defaults: editorDefaults(),
  })
}

export async function PUT(request) {
  const blocked = denied()
  if (blocked) return blocked
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const overrides = normalizeOverrides(body)
  const encoded = JSON.stringify(overrides)
  if (encoded.length > 100000) {
    return NextResponse.json({ error: 'Overrides are too large' }, { status: 400 })
  }
  await fs.writeFile(filePath, `${JSON.stringify(overrides, null, 2)}\n`)
  return NextResponse.json({
    overrides,
    entries: editorEntries(overrides),
    defaults: editorDefaults(),
  })
}
