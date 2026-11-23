// The release notes on /changelog/: the CHANGELOG.md files of the main repository, read when the site is built.
// They are fetched from GitHub, and when that fails (offline, a rate limit, GitHub down) the copy in
// `src/data/changelog/` is used instead, so a build never breaks because of the network. The copies are only a
// fallback: the deploy workflow runs after each release (cir-ci/repo sends a circi-release event), so the live page follows
// the repository without anyone editing it.
import { readFile } from 'node:fs/promises'
import type { Loader } from 'astro/loaders'

// CHANGELOG_RAW_URL points the build somewhere else (an unreachable address shows the fallback working).
const RAW = process.env.CHANGELOG_RAW_URL ??'https://raw.githubusercontent.com/cir-ci/repo/main'

/** One changelog: where it lives in the repository, the copy kept here and how the page names it. */
export const CHANGELOGS = [
  { id: 'server', path: 'apps/server/CHANGELOG.md', title: 'The app', packageName: '@circi/server', order: 1 },
  { id: 'cli', path: 'packages/cli/CHANGELOG.md', title: 'The CLI', packageName: '@circi/cli', order: 2 },
  { id: 'vitest', path: 'packages/vitest/CHANGELOG.md', title: 'The Vitest plugin', packageName: '@circi/vitest', order: 3 },
] as const

/**
 * Changesets writes `- [#3](pr) [`sha`](commit) Thanks [@user](profile)! - text`. Readers of the page want the text, and
 * the pull request (or the commit when there is none), so the rest is dropped: `- [#3](pr): text`.
 */
export function tidyEntries(markdown: string): string {
  return markdown.replace(
    /^- (\[#\d+\]\([^)]*\) )?(?:\[`([0-9a-f]+)`\]\(([^)]*)\) )?(?:Thanks \[@[^\]]+\]\([^)]*\)! )?- /gm,
    (_match, pr: string | undefined, sha: string | undefined, commit: string | undefined) =>
      pr ? `- ${pr.trim()}: ` : sha && commit ? `- [${sha}](${commit}): ` : '- ',
  )
}

/** The heading of each version one level below the page's package heading, and the title line dropped. */
export function demoteHeadings(markdown: string): string {
  return markdown
    .replace(/^# .*\n+/, '')
    .replace(/^(#{2,5}) /gm, '$1# ')
}

/** The versions in a changelog, newest first as the file has them. */
export function versionsOf(markdown: string): string[] {
  return [...markdown.matchAll(/^## (\S+)/gm)].map((m) => m[1] as string)
}

async function read(entry: (typeof CHANGELOGS)[number], logger: { warn(message: string): void }) {
  try {
    const response = await fetch(`${RAW}/${entry.path}`, { signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    if (!text.startsWith('# ')) throw new Error('not a changelog')
    return text
  } catch (error) {
    logger.warn(`Couldn't fetch ${entry.path} (${error instanceof Error ? error.message : String(error)}); using the copy in src/data/changelog/`)
    return readFile(new URL(`../data/changelog/${entry.id}.md`, import.meta.url), 'utf8')
  }
}

export function changelogLoader(): Loader {
  return {
    name: 'circi-changelogs',
    async load({ store, logger, renderMarkdown, generateDigest }) {
      store.clear()
      const texts = await Promise.all(CHANGELOGS.map((entry) => read(entry, logger)))
      for (const [index, entry] of CHANGELOGS.entries()) {
        const text = texts[index] as string
        const body = demoteHeadings(tidyEntries(text))
        store.set({
          id: entry.id,
          data: { title: entry.title, packageName: entry.packageName, order: entry.order, versions: versionsOf(text) },
          body,
          digest: generateDigest(body),
          rendered: await renderMarkdown(body),
        })
      }
    },
  }
}
