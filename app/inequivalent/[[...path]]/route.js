// The portfolio iframe loads /inequivalent/* from gkane1234/Inequivalent's web/ directory.
// A copy under public/inequivalent would take this URL and freeze the solver again.
const UPSTREAM_ROOT = 'https://raw.githubusercontent.com/gkane1234/Inequivalent/master/web'
const REVALIDATE_SECONDS = 60

const CONTENT_TYPES = {
  css: 'text/css; charset=utf-8',
  gif: 'image/gif',
  html: 'text/html; charset=utf-8',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  map: 'application/json; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  png: 'image/png',
  svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8',
  wasm: 'application/wasm',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
}

function upstreamPath(segments) {
  const parts = segments?.length ? segments : ['index.html']
  if (parts.length > 16) return null
  for (const part of parts) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(part)) return null
  }
  return parts.map((part) => encodeURIComponent(part)).join('/')
}

function contentTypeFor(filename) {
  const extension = filename.includes('.')
    ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
    : ''
  return CONTENT_TYPES[extension] || 'application/octet-stream'
}

export const revalidate = REVALIDATE_SECONDS

export async function GET(_request, { params }) {
  const relativePath = upstreamPath(params.path)
  if (!relativePath) {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }

  let source
  try {
    source = await fetch(`${UPSTREAM_ROOT}/${relativePath}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
  } catch {
    return new Response('Inequivalent source is unavailable.', {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  if (source.status === 404) {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }
  if (!source.ok) {
    return new Response('Inequivalent source is unavailable.', {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const filename = relativePath.slice(relativePath.lastIndexOf('/') + 1)
  const body = await source.arrayBuffer()
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentTypeFor(decodeURIComponent(filename)),
      'Cache-Control': `public, max-age=${REVALIDATE_SECONDS}`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
