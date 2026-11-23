import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'
import { changelogLoader } from '#lib/changelog.ts'

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      // The words a search result and a link preview show, when the page's own title is short for them
      // ("Storage" is the sidebar entry and the h1; "Storage for CirCI: local disk or S3" is the `<title>`).
      // Aim for 60 characters or fewer with the ` | CirCI` suffix, which a result usually shows in full; longer only warns.
      extend: z.object({ seoTitle: z.string().optional() }),
    }),
  }),
  // The release notes of the app, the CLI and the Vitest plugin, read from the main repository's CHANGELOG.md files
  // at build time (src/lib/changelog.ts) and drawn by `src/components/Changelog.astro` on /changelog/.
  changelog: defineCollection({
    loader: changelogLoader(),
    schema: z.object({ title: z.string(), packageName: z.string(), order: z.number(), versions: z.array(z.string()) }),
  }),
}
