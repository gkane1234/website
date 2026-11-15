import { spawn } from 'child_process'
import { mkdtemp, rm } from 'fs/promises'
import os from 'os'
import path from 'path'

const base = process.env.RESUME_BASE_URL || 'http://127.0.0.1:3000'
const jobs = [
  ['coding', `${base}/resume/data`, 'public/gabriel-kane-coding.pdf', 2],
  ['teaching', `${base}/resume/teaching`, 'public/gabriel-kane-teaching.pdf', 1],
]

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
    })
    child.stderr.on('data', (chunk) => {
      output += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, output }))
  })
}

const root = process.cwd()
for (const [name, url, file, maxPages] of jobs) {
  const out = path.join(root, file)
  const profile = await mkdtemp(path.join(os.tmpdir(), `resume-${name}-`))
  const chrome = process.env.CHROME_PATH || '/opt/google/chrome/chrome'
  const printed = await run('timeout', [
    '40',
    chrome,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--print-to-pdf=${out}`,
    url,
  ])
  await rm(profile, { recursive: true, force: true })
  if (printed.code !== 0) {
    console.error(printed.output)
    process.exit(printed.code || 1)
  }

  const info = await run('pdfinfo', [out])
  const pages = Number((info.output.match(/Pages:\s+(\d+)/) || [])[1] || 0)
  const fonts = await run('pdffonts', [out])
  const fontList = fonts.output
  const hasGeorgia = /Georgia/i.test(fontList)
  if (!hasGeorgia) {
    console.error(`${name} PDF did not embed Georgia.\n${fontList}`)
    process.exit(1)
  }
  if (pages < 1 || pages > maxPages) {
    console.error(`${name} resume is ${pages} page(s); keep it within ${maxPages}.`)
    process.exit(1)
  }
  console.log(`${file}: ${pages} page(s)`)
}
