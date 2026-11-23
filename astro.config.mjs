// @ts-check
import mdx from '@astrojs/mdx'
import { satteri } from '@astrojs/markdown-satteri'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'
import { lastmodOf } from './src/lib/lastmod.mjs'

const lastmod = lastmodOf()

// Wraps every Markdown table in `div.table-wrap` at build time (the wrapper has the border, radius and sideways
// scroll, so the table inside can fill it; see docs.css). Tables from Astro components, like EnvTable, make their own.
const wrapTables = {
  name: 'wrap-tables',
  element: {
    filter: ['table'],
    /** @param {any} node @param {any} ctx */
    visit(node, ctx) {
      ctx.wrapNode(node, { type: 'element', tagName: 'div', properties: { className: ['table-wrap'] }, children: [] })
    },
  },
}

// The documentation of CirCI. The sidebar is explicit so the order is ours; every slug below is
// a file under src/content/docs (see DESIGN.md for the page conventions).
// `site` is the public address (GitHub Pages, custom domain circi.dev at the root, so no `base`); it makes Starlight generate sitemap-index.xml.
export default defineConfig({
  // Smart punctuation would turn `--wait` into an en dash and break copied commands, so it is off (the same
  // output as the former `markdown.smartypants: false`, which is deprecated in favor of the processor's option).
  markdown: { processor: satteri({ features: { smartPunctuation: false }, hastPlugins: [/** @type {any} */ (wrapTables)] }) },
  site: 'https://circi.dev',
  server: { port: 4321 },
  integrations: [
    starlight({
      title: 'CirCI',
      description: 'CirCI is open source visual regression testing you host yourself: CI uploads screenshots, your team reviews the changes, and the result gates the merge.',
      logo: { src: './src/assets/logo.svg', alt: 'CirCI' },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/cir-ci' }],
      head: [
        // Search results need a raster icon whose size is a multiple of 48 px, declared as rel="icon" (Starlight's
        // `favicon` above is an SVG `shortcut icon`, which Google shows as a globe, and the only SVG tag, since browsers
        // read `shortcut icon` as `icon`); /favicon.ico (16, 32 and 48 px) is the usual fallback.
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/icons/96.png' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/icons/180.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#0c0a09', media: '(prefers-color-scheme: dark)' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#e9e2de', media: '(prefers-color-scheme: light)' } },
      ],
      // Per-page title, social image and JSON-LD (src/route-data.ts), and a build that fails on a broken internal link.
      routeMiddleware: './src/route-data.ts',
      plugins: [starlightLinksValidator({ errorOnLocalLinks: false })],
      customCss: ['./src/styles/circi-theme.css', './src/styles/docs.css', './src/styles/landing.css'],
      components: {
        Head: './src/components/overrides/Head.astro',
        Header: './src/components/overrides/Header.astro',
        Sidebar: './src/components/overrides/Sidebar.astro',
        SiteTitle: './src/components/overrides/SiteTitle.astro',
        ThemeSelect: './src/components/overrides/ThemeSelect.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
        Footer: './src/components/overrides/Footer.astro',
      },
      expressiveCode: {
        themes: ['vitesse-dark', 'vitesse-light'],
        styleOverrides: {
          borderRadius: 'var(--circi-radius-popup)',
          borderColor: 'var(--circi-line-strong)',
          codeBackground: 'var(--circi-surface-raised)',
          codeFontFamily: 'var(--circi-font-mono)',
          codeFontSize: '0.8125rem',
          codeLineHeight: '1.6',
          frames: {
            editorTabBarBackground: 'var(--circi-surface-overlay)',
            editorActiveTabBackground: 'var(--circi-surface-raised)',
            terminalTitlebarBackground: 'var(--circi-surface-overlay)',
            terminalBackground: 'var(--circi-surface-raised)',
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      lastUpdated: false,
      pagination: true,
      sidebar: [
        {
          label: 'Introduction',
          collapsed: true,
          items: [
            'introduction/what-is-circi',
            'introduction/how-a-build-flows',
            'introduction/key-concepts',
            'introduction/how-screenshots-are-compared',
            'introduction/compared-with-chromatic-percy-argos',
            'introduction/visual-regression-testing-without-saas',
            'introduction/faq',
          ],
        },
        {
          label: 'Getting started',
          collapsed: true,
          items: [
            'getting-started/run-it-locally',
            'getting-started/sign-in-and-set-up',
            'getting-started/create-a-project',
            'getting-started/first-upload',
            'getting-started/first-review',
          ],
        },
        {
          label: 'Self-hosting',
          collapsed: true,
          items: [
            {
              label: 'Install',
              collapsed: true,
              items: [
                'self-hosting/requirements',
                'self-hosting/docker-compose',
                'self-hosting/terraform',
                'self-hosting/kubernetes',
                'self-hosting/tls-and-reverse-proxy',
                'self-hosting/site-domains',
              ],
            },
            {
              label: 'Configure',
              collapsed: true,
              items: [
                'self-hosting/configuration',
                'self-hosting/instance-settings',
                'self-hosting/authentication',
                'self-hosting/security',
                'self-hosting/storage',
                'self-hosting/database',
              ],
            },
            {
              label: 'Operate',
              collapsed: true,
              items: [
                'self-hosting/troubleshooting',
                'self-hosting/monitoring',
                'self-hosting/upgrades-and-migrations',
                'self-hosting/backups',
                'self-hosting/retention-and-gc',
                'self-hosting/scaling-the-worker',
                'self-hosting/performance',
              ],
            },
          ],
        },
        {
          label: 'Using CirCI',
          collapsed: true,
          items: [
            {
              label: 'Reviewing',
              collapsed: true,
              items: [
                'using/reviewing-a-build',
                'using/comments-and-regions',
                'using/review-requests-and-rules',
                'using/inbox-and-reviews',
                'using/undo',
                'using/live-updates',
              ],
            },
            {
              label: 'Screenshots over time',
              collapsed: true,
              items: [
                'using/triage-and-flaky-screenshots',
                'using/baselines-and-ignore-regions',
              ],
            },
            {
              label: 'Insights and views',
              collapsed: true,
              items: [
                'using/insights',
                'using/saved-views',
                'using/command-menu-and-search',
              ],
            },
            'using/hosted-sites',
            'using/mobile-and-installed-app',
            {
              label: 'Settings',
              collapsed: true,
              items: [
                'using/project-settings',
                'using/workspace-settings',
                'using/account-settings',
                'using/members-and-roles',
                'using/instance-administration',
              ],
            },
          ],
        },
        {
          label: 'Upload from CI',
          collapsed: true,
          items: [
            'ci/cli',
            'ci/vitest',
            'ci/playwright',
            'ci/storybook',
            'ci/cypress',
            'ci/ci-examples',
            'ci/github-actions',
            'ci/argos-compatible-api',
          ],
        },
        {
          label: 'Connect other tools',
          collapsed: true,
          items: [
            {
              label: 'Integrations',
              collapsed: true,
              items: [
                'integrations/overview',
                {
                  label: 'Git',
                  collapsed: true,
                  items: [
                    'integrations/github',
                    'integrations/gitlab',
                    'integrations/bitbucket',
                  ],
                },
                {
                  label: 'Messaging',
                  collapsed: true,
                  items: [
                    'integrations/slack',
                  ],
                },
                {
                  label: 'Issue tracking',
                  collapsed: true,
                  items: [
                    'integrations/linear',
                    'integrations/jira',
                  ],
                },
                {
                  label: 'Design',
                  collapsed: true,
                  items: [
                    'integrations/figma',
                  ],
                },
              ],
            },
            'integrations/webhooks',
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          items: [
            'reference/http-api',
            'reference/ci-api',
            'reference/errors-and-exit-codes',
            'reference/limits',
            'reference/build-statuses',
            'reference/notifications',
            'reference/background-jobs',
            'reference/keyboard-shortcuts',
            'reference/admin-cli',
            'reference/environment-variables',
            'reference/glossary',
          ],
        },
        {
          label: 'Contributing',
          collapsed: true,
          items: [
            'contributing/how-to-contribute',
            'contributing/repo-layout',
            'contributing/local-development',
            'contributing/tests',
            'contributing/writing-an-integration',
          ],
        },
        'roadmap',
        'changelog',
      ],
    }),
    // Starlight adds this itself unless it's listed; listed here so the design kit (noindex, kept out of the
    // sidebar) isn't in the sitemap, and so each page has a <lastmod> from git (src/lib/lastmod.mjs).
    sitemap({
      filter: (page) => !page.includes('/design-kit/'),
      serialize: (item) => {
        const date = lastmod(item.url)
        return date ? { ...item, lastmod: date } : item
      },
    }),
    react(),
    mdx(),
  ],
})
