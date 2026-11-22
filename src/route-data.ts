// Per-page head tags that Starlight's defaults get wrong or leave out (see src/lib/seo.ts): the title and
// og:title say what the page is, og:type is `website` on the home page, every page has a social image and
// JSON-LD, and the 404 page and the design kit stay out of search.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import { HOME_DESCRIPTION, ogImagePath, SITE, SITE_NAME, titleOf } from '#lib/seo.ts'
import { breadcrumbData, homeData } from '#lib/structured-data.ts'

type Tag = StarlightRouteData['head'][number]

const NOINDEX = new Set(['404', 'design-kit'])

function meta(key: 'name' | 'property', name: string, content: string): Tag {
  return { tag: 'meta', attrs: { [key]: name, content } }
}

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  const { data } = route.entry
  const id = route.entry.id || 'index' // the home page's entry has an empty ID
  const isHome = id === 'index'
  const title = titleOf(data, id)
  const description = isHome ? HOME_DESCRIPTION : (data.description ?? '')

  // Starlight's title, og:title, og:type and og:description are replaced, not duplicated.
  const replaced = (t: Tag) =>
    t.tag === 'title' ||
    (t.tag === 'meta' && ['og:title', 'og:type', 'og:description'].includes(String(t.attrs?.property))) ||
    (t.tag === 'meta' && t.attrs?.name === 'description')
  route.head = route.head.filter((t) => !replaced(t))

  const full = isHome || title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  route.head.push(
    { tag: 'title', content: full },
    meta('name', 'description', description),
    meta('property', 'og:title', full),
    meta('property', 'og:description', description),
    meta('property', 'og:type', isHome ? 'website' : 'article'),
  )

  if (NOINDEX.has(id)) {
    route.head.push(meta('name', 'robots', 'noindex'))
    return
  }

  const image = `${SITE}${ogImagePath(id)}`
  const alt = isHome ? `${title} (documentation)` : `${title} (CirCI documentation)`
  route.head.push(
    meta('property', 'og:image', image),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', alt),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', alt),
  )

  const json = isHome ? homeData() : breadcrumbData(id, data.title)
  if (json) route.head.push({ tag: 'script', attrs: { type: 'application/ld+json' }, content: JSON.stringify(json) })
})
