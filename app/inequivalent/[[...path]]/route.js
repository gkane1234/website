// The portfolio iframe loads /inequivalent/* from gkane1234/Inequivalent's web/ directory.
// A copy under public/inequivalent would take this URL and freeze the solver again.
//
// These responses used to be cached. Vercel kept the JavaScript from before the
// solver update, and the browser held that file for hours, so a refresh still
// showed the old page. Read GitHub on every request and give the assets a new
// URL so that cached copy is left behind.
const UPSTREAM_ROOT = 'https://raw.githubusercontent.com/gkane1234/Inequivalent/master/web'

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

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Cloudflare-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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

function withFreshAssetUrls(text, contentType, version) {
  if (contentType.startsWith('text/html')) {
    return text.replace(
      /(\s(?:src|href)=["'])(?!(?:[a-z][a-z0-9+.-]*:|\/\/|#|data:))([^"'?#]+)(["'])/gi,
      `$1$2?v=${version}$3`,
    )
  }
  if (contentType.includes('javascript')) {
    return text
      .replace(
        /((?:from|import)\s*["'])(\.\.?\/[^"'?#]+)(["'])/g,
        `$1$2?v=${version}$3`,
      )
      .replace(
        /(new URL\(\s*["'])(\.\.?\/[^"'?#]+)(["'])/g,
        `$1$2?v=${version}$3`,
      )
  }
  return text
}

export async function GET(_request, { params }) {
  const relativePath = upstreamPath(params.path)
  if (!relativePath) {
    return new Response('Not found', { status: 404, headers: RESPONSE_HEADERS })
  }

  let source
  try {
    source = await fetch(`${UPSTREAM_ROOT}/${relativePath}`, { cache: 'no-store' })
  } catch {
    return new Response('Inequivalent source is unavailable.', {
      status: 502,
      headers: RESPONSE_HEADERS,
    })
  }

  if (source.status === 404) {
    return new Response('Not found', { status: 404, headers: RESPONSE_HEADERS })
  }
  if (!source.ok) {
    return new Response('Inequivalent source is unavailable.', {
      status: 502,
      headers: RESPONSE_HEADERS,
    })
  }

  const filename = decodeURIComponent(relativePath.slice(relativePath.lastIndexOf('/') + 1))
  const contentType = contentTypeFor(filename)
  const version = Date.now().toString(36)
  let body
  if (contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json')) {
    const text = await source.text()
    body = withFreshAssetUrls(text, contentType, version)
  } else {
    body = await source.arrayBuffer()
  }

  return new Response(body, {
    status: 200,
    headers: {
      ...RESPONSE_HEADERS,
      'Content-Type': contentType,
    },
  })
}
