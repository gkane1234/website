import { spawn } from 'child_process'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const script = path.join(process.cwd(), 'scripts/render-resumes.mjs')
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      env: { ...process.env, RESUME_BASE_URL: 'http://127.0.0.1:3000' },
    })
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
    })
    child.stderr.on('data', (chunk) => {
      output += chunk
    })
    child.on('close', (code) => resolve({ code, output }))
  })

  if (result.code !== 0) {
    return NextResponse.json(
      { error: result.output.trim() || 'PDF generation failed.' },
      { status: 500 }
    )
  }
  return NextResponse.json({ message: result.output.trim() })
}
