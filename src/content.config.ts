import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      // The words a search result and a link preview show, when the page's own title is short for them
      // ("Storage" is the sidebar entry and the h1; "Storage for CirCI: local disk or S3" is the `<title>`).
      extend: z.object({ seoTitle: z.string().max(52).optional() }),
    }),
  }),
}
