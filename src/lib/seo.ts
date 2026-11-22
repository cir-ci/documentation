// What search engines and link previews read, kept in one place: the sidebar's section of a page, its
// <title>, its description and the address of its social image. Used by the route middleware
// (`src/route-data.ts`) and the social image route (`src/pages/og/`).
import config from 'virtual:starlight/user-config'

export const SITE = 'https://circi.dev'
export const SITE_NAME = 'CirCI'
/** The home page's title and the card's headline: what CirCI is. */
export const HOME_TITLE = 'CirCI: self-hosted visual regression testing'
export const HOME_DESCRIPTION =
  'CirCI is open source visual regression testing you host yourself: CI uploads screenshots, your team reviews the changes, and the result gates the merge.'

type SidebarItem = { slug: string } | { label: string; items?: SidebarItem[] }

/** One group on the way to a page in the sidebar: its label, and the first page inside it. */
export interface Crumb {
  label: string
  slug: string
}

/** The sidebar groups that contain `slug` (outermost first), each with its first page's slug. */
export function groupsOf(slug: string, items: SidebarItem[] = config.sidebar as SidebarItem[]): Crumb[] | undefined {
  for (const item of items) {
    if ('slug' in item) {
      if (item.slug === slug) return []
    } else if (item.items) {
      const inside = groupsOf(slug, item.items)
      if (inside) return [{ label: item.label, slug: firstSlug(item.items) }, ...inside]
    }
  }
  return undefined
}

function firstSlug(items: SidebarItem[]): string {
  for (const item of items) {
    if ('slug' in item) return item.slug
    if (item.items) return firstSlug(item.items)
  }
  throw new Error('A sidebar group without pages')
}

/** The path of a docs entry, with the trailing slash (`self-hosting/terraform` is `/self-hosting/terraform/`). */
export const pathOf = (id: string) => (id === 'index' ? '/' : `/${id}/`)

/** The social image of an entry. */
export const ogImagePath = (id: string) => `/og/${id}.png`

/** The text under the card's headline: where the page sits, e.g. "Self-hosting › Install". */
export function sectionOf(id: string): string {
  const groups = groupsOf(id)
  return groups && groups.length > 0 ? groups.map((g) => g.label).join(' › ') : 'Documentation'
}

/** The text of the `<title>` before " | CirCI": the page's `seoTitle` when it has one, else its title. */
export function titleOf(data: { title: string; seoTitle?: string | undefined }, id: string): string {
  return id === 'index' ? HOME_TITLE : (data.seoTitle ?? data.title)
}
