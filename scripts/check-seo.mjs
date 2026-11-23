// Checks the built site (dist/) for what search engines and link previews need, and fails the build when a page
// is missing it: a unique <title> (60 characters or fewer) and description (70 to 160), a canonical link, Open
// Graph and Twitter tags with an image that exists, valid JSON-LD (SoftwareApplication, WebSite and Organization on the
// home page, each WebSite and Organization with an alternateName, a BreadcrumbList elsewhere), `noindex` on the 404 page and the design kit, a robots.txt that
// names the sitemap, and an icon search results can show. Run by `pnpm build`, after astro build.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname
const SITE = 'https://circi.dev'
const NOINDEX = new Set(['404.html', 'design-kit/index.html'])
const problems = []
const fail = (page, message) => problems.push(`${page}: ${message}`)

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name === 'pagefind' || name === '_astro' || name === 'og') continue
    if (statSync(path).isDirectory()) yield* htmlFiles(path)
    else if (name.endsWith('.html')) yield path
  }
}

const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
const attr = (tag, name) => {
  const m = new RegExp(`${name}="([^"]*)"`).exec(tag)
  return m ? decode(m[1]) : undefined
}
const metas = (head) => head.match(/<meta [^>]*>/g) ?? []
const metaContent = (head, key, value) => {
  const tag = metas(head).find((t) => attr(t, key) === value)
  return tag ? attr(tag, 'content') : undefined
}

const seen = { title: new Map(), description: new Map() }
const unique = (kind, value, page) => {
  const other = seen[kind].get(value)
  if (other) fail(page, `same ${kind} as ${other}`)
  else seen[kind].set(value, page)
}

for (const file of htmlFiles(dist)) {
  const page = relative(dist, file)
  const html = readFileSync(file, 'utf8')
  const head = html.slice(0, html.indexOf('</head>'))
  const robots = metaContent(head, 'name', 'robots')

  if (NOINDEX.has(page)) {
    if (!robots?.includes('noindex')) fail(page, 'must have <meta name="robots" content="noindex">')
    continue
  }
  if (robots?.includes('noindex')) fail(page, 'is noindex')

  const title = decode(/<title>([^<]*)<\/title>/.exec(head)?.[1] ?? '')
  const description = metaContent(head, 'name', 'description') ?? ''
  if (!title) fail(page, 'no <title>')
  if (title.length > 60) fail(page, `<title> is ${title.length} characters (60 at most): ${title}`)
  if (title.length > 0 && title.length < 15) fail(page, `<title> is only ${title.length} characters: ${title}`)
  if (description.length < 70 || description.length > 160) fail(page, `description is ${description.length} characters (70 to 160)`)
  unique('title', title, page)
  unique('description', description, page)

  const url = page === 'index.html' ? `${SITE}/` : `${SITE}/${page.replace(/index\.html$/, '')}`
  if (!/<link rel="canonical" href="([^"]*)"/.test(head) || /<link rel="canonical" href="([^"]*)"/.exec(head)?.[1] !== url) fail(page, `canonical isn't ${url}`)

  const og = (p) => metaContent(head, 'property', p)
  if (og('og:title') !== title) fail(page, `og:title (${og('og:title')}) isn't the title`)
  if (og('og:description') !== description) fail(page, 'og:description differs from the description')
  if (og('og:type') !== (page === 'index.html' ? 'website' : 'article')) fail(page, `og:type is ${og('og:type')}`)
  if (!og('og:image:alt')) fail(page, 'no og:image:alt')
  if (metaContent(head, 'name', 'twitter:card') !== 'summary_large_image') fail(page, 'twitter:card is not summary_large_image')
  const image = og('og:image')
  if (!image?.startsWith(`${SITE}/og/`) || metaContent(head, 'name', 'twitter:image') !== image) fail(page, `og:image and twitter:image must be the same ${SITE}/og/ address`)
  else if (!existsSync(join(dist, image.slice(SITE.length)))) fail(page, `${image} wasn't built`)

  const blocks = [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
  if (blocks.length !== 1) {
    fail(page, `${blocks.length} JSON-LD blocks (1 expected)`)
    continue
  }
  let data
  try {
    data = JSON.parse(decode(blocks[0]))
  } catch (error) {
    fail(page, `JSON-LD isn't JSON: ${error.message}`)
    continue
  }
  if (data['@context'] !== 'https://schema.org') fail(page, 'JSON-LD @context must be https://schema.org')
  if (page === 'index.html') checkHome(page, data)
  else checkBreadcrumbs(page, data, url)
}

function checkHome(page, data) {
  const nodes = data['@graph'] ?? []
  const app = nodes.find((n) => n['@type'] === 'SoftwareApplication')
  const org = nodes.find((n) => n['@type'] === 'Organization')
  const site = nodes.find((n) => n['@type'] === 'WebSite')
  if (!app) return fail(page, 'no SoftwareApplication')
  if (!org) return fail(page, 'no Organization')
  if (!site) return fail(page, 'no WebSite (the site name search results show)')
  for (const [label, node] of [['WebSite', site], ['Organization', org]]) {
    if (node.name !== 'CirCI') fail(page, `${label} name must be CirCI`)
    if (!Array.isArray(node.alternateName) || !node.alternateName.includes('circi')) fail(page, `${label} alternateName must include "circi"`)
  }
  if (site.url !== `${SITE}/`) fail(page, `WebSite url must be ${SITE}/`)
  for (const key of ['name', 'description', 'url', 'applicationCategory', 'operatingSystem', 'license', 'offers', 'sameAs']) {
    if (!app[key]) fail(page, `SoftwareApplication has no ${key}`)
  }
  if (app.applicationCategory !== 'DeveloperApplication') fail(page, 'applicationCategory must be DeveloperApplication')
  if (app.offers?.['@type'] !== 'Offer' || app.offers.price !== 0 || !app.offers.priceCurrency) fail(page, 'offers must be an Offer with price 0 and a priceCurrency')
  if (app.publisher?.['@id'] !== org['@id']) fail(page, 'the application`s publisher must be the Organization')
  for (const key of ['name', 'url', 'logo']) if (!org[key]) fail(page, `Organization has no ${key}`)
  for (const u of [app.url, org.url, org.logo, ...(app.sameAs ?? []), ...(org.sameAs ?? [])]) if (!/^https:\/\//.test(u)) fail(page, `${u} isn't an absolute https URL`)
}

function checkBreadcrumbs(page, data, url) {
  if (data['@type'] !== 'BreadcrumbList') return fail(page, `JSON-LD is ${data['@type']}, not BreadcrumbList`)
  const items = data.itemListElement ?? []
  if (items.length < 2) fail(page, 'BreadcrumbList needs at least 2 items')
  items.forEach((item, i) => {
    if (item['@type'] !== 'ListItem' || item.position !== i + 1) fail(page, `item ${i + 1} isn't a ListItem at position ${i + 1}`)
    if (!item.name) fail(page, `item ${i + 1} has no name`)
    if (!item.item?.startsWith(`${SITE}/`)) fail(page, `item ${i + 1} has no absolute URL`)
  })
  if (items.at(-1)?.item !== url) fail(page, `the last item must be the page (${url})`)
  const urls = items.map((i) => i.item)
  if (new Set(urls).size !== urls.length) fail(page, 'BreadcrumbList repeats a URL')
}

const robotsTxt = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : ''
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) problems.push('robots.txt: no Sitemap line')
if (/^Disallow:\s*\/\s*$/m.test(robotsTxt)) problems.push('robots.txt: disallows everything')
if (!existsSync(join(dist, 'sitemap-index.xml'))) problems.push('sitemap-index.xml: missing')
if (readFileSync(join(dist, 'sitemap-0.xml'), 'utf8').includes('/design-kit/')) problems.push('sitemap: lists the design kit')

// The icon search results show: a raster `rel="icon"` whose size is a multiple of 48 px (Google shows a globe for an
// SVG-only shortcut icon), and /favicon.ico, the fallback crawlers ask for.
{
  const head = readFileSync(join(dist, 'index.html'), 'utf8')
  const icons = (head.match(/<link [^>]*>/g) ?? []).filter((tag) => attr(tag, 'rel') === 'icon')
  const raster = icons.filter((tag) => {
    const size = Number((attr(tag, 'sizes') ?? '').split('x')[0])
    const file = (attr(tag, 'href') ?? '').replace(/^\//, '')
    return size > 0 && size % 48 === 0 && !/\.svg$/.test(file) && existsSync(join(dist, file))
  })
  if (raster.length === 0) fail('index.html', 'no rel="icon" raster icon whose size is a multiple of 48 px (and exists)')
  if (!existsSync(join(dist, 'favicon.ico'))) fail('favicon.ico', 'missing')
}

if (problems.length > 0) {
  console.error(`SEO check failed (${problems.length}):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(`SEO check passed: ${seen.title.size} pages with unique titles and descriptions, social images and structured data.`)
