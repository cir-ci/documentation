// JSON-LD (schema.org), typed with `schema-dts` so `astro check` rejects a property or a value type that
// schema.org doesn't have. The home page describes the software and its publisher; every other page says
// where it sits (a BreadcrumbList from the sidebar's groups).
import type { BreadcrumbList, Graph, WithContext } from 'schema-dts'
import { groupsOf, HOME_DESCRIPTION, pathOf, SITE, SITE_NAME } from '#lib/seo.ts'

const REPOSITORY = 'https://github.com/cir-ci/repo'
const ORGANIZATION_ID = `${SITE}/#organization`
/** Other names people search for: lowercase (Google may otherwise correct "circi" to "circleci") and what it is. */
const ALTERNATE_NAMES = ['circi', 'CirCI visual regression testing']

/** The home page: the application, the website and its organization (`@circi/cli` and `@circi/vitest` are the packages on npm). */
export function homeData(): Graph {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE}/#software`,
        name: SITE_NAME,
        description: HOME_DESCRIPTION,
        url: `${SITE}/`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any operating system that runs Docker',
        license: 'https://www.gnu.org/licenses/gpl-3.0.html',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
        publisher: { '@id': ORGANIZATION_ID },
        sameAs: [REPOSITORY, 'https://www.npmjs.com/package/@circi/cli', 'https://www.npmjs.com/package/@circi/vitest'],
      },
      {
        // Tells search engines that "CirCI" is the name of this site (and not a misspelling of another word).
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: SITE_NAME,
        alternateName: ALTERNATE_NAMES,
        url: `${SITE}/`,
        description: HOME_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: ALTERNATE_NAMES,
        url: `${SITE}/`,
        logo: `${SITE}/icons/512.png`,
        sameAs: ['https://github.com/cir-ci', REPOSITORY],
      },
    ],
  }
}

/** A docs page: Home, then the sidebar groups it sits in (each linked to its first page), then the page. */
export function breadcrumbData(id: string, title: string): WithContext<BreadcrumbList> | undefined {
  const groups = groupsOf(id)
  if (!groups || id === 'index') return undefined
  // A group is linked to its first page, so a group whose first page is also its parent's, or the page itself, is left out.
  const steps = groups.map((g) => ({ name: g.label, path: pathOf(g.slug) }))
  const trail = [
    { name: SITE_NAME, path: '/' },
    ...steps.filter((step, i) => step.path !== pathOf(id) && steps.findIndex((s) => s.path === step.path) === i),
    { name: title, path: pathOf(id) },
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: `${SITE}${step.path}`,
    })),
  }
}
