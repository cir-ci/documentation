// One Open Graph image per docs page (1200x630), drawn at build time from the page's title and its place in
// the sidebar, on the CirCI dark surface with the logo. The colors are read from the theme file, the one place
// the palette is defined (DESIGN.md).
import { readFileSync } from 'node:fs'
import { getCollection } from 'astro:content'
import { OGImageRoute } from 'astro-og-canvas'
import { HOME_TITLE, sectionOf } from '#lib/seo.ts'

type Rgb = [number, number, number]

const theme = readFileSync('./src/styles/circi-theme.css', 'utf8')

/** A `--circi-*` color of the dark scheme (the first `:root` block), as [r, g, b]. */
function color(name: string): Rgb {
  const hex = new RegExp(`${name}:\\s*#([0-9a-f]{6})`, 'i').exec(theme)?.[1]
  if (!hex) throw new Error(`${name} isn't a hex color in circi-theme.css`)
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
}

const entries = (await getCollection('docs')).filter((e) => e.id !== 'design-kit')
const pages = Object.fromEntries(entries.map((e) => [e.id, e]))

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_id, entry) => ({
    title: entry.id === 'index' ? HOME_TITLE : entry.data.title,
    description: entry.id === 'index' ? 'Documentation · circi.dev' : `${sectionOf(entry.id)} · circi.dev`,
    logo: { path: './public/icons/192.png', size: [96] },
    bgGradient: [color('--circi-surface-chrome'), color('--circi-surface-panel')],
    border: { color: color('--circi-accent-main'), width: 12, side: 'inline-start' },
    padding: 72,
    font: {
      title: { color: color('--circi-text-primary'), size: 72, weight: 'SemiBold', lineHeight: 1.1, families: ['Inter Variable'] },
      description: { color: color('--circi-text-secondary'), size: 34, families: ['Inter Variable'] },
    },
    fonts: ['./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'],
  }),
})
