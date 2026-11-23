// The date each docs page last changed, from git, for the sitemap's <lastmod> (astro.config.mjs). Crawlers use it
// to see which pages changed since their last visit. It needs the full history: the deploy workflow checks out with
// `fetch-depth: 0`, since a shallow clone would date every page to the last commit. Without git, there is no lastmod.
import { execFileSync } from 'node:child_process'

const DOCS = 'src/content/docs/'

/** Each file under src/content/docs (e.g. `src/content/docs/ci/cli.mdx`) and the ISO date of the last commit that changed it. */
function lastCommitDates() {
  const dates = new Map()
  let log = ''
  try {
    log = execFileSync('git', ['log', '--format=@%cI', '--name-only', '--', DOCS], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return dates
  }
  let date = ''
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) date = line.slice(1)
    else if (line && !dates.has(line)) dates.set(line, date) // newest first, so the first date seen is the last change
  }
  return dates
}

/** A function from a page's URL (`https://circi.dev/ci/cli/`) to the date its source file last changed, if known. */
export function lastmodOf() {
  const dates = lastCommitDates()
  return (/** @type {string} */ url) => {
    const path = new URL(url).pathname.replace(/^\/|\/$/g, '') || 'index'
    for (const ext of ['.mdx', '.md']) {
      const date = dates.get(`${DOCS}${path}${ext}`) ?? dates.get(`${DOCS}${path}/index${ext}`)
      if (date) return date
    }
    return undefined
  }
}
