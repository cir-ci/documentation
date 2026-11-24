// @ts-check
import mdx from '@astrojs/mdx'
import { satteri } from '@astrojs/markdown-satteri'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'
import { codeChildren } from './src/lib/code-words.mjs'
import { lastmodOf } from './src/lib/lastmod.mjs'

const lastmod = lastmodOf()

// Wraps every Markdown table in `div.table-wrap` at build time (the wrapper has the border, radius and sideways
// scroll, so the table inside can fill it; see docs.css).
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

// Inline code wraps only at its spaces (and, on a phone, inside a long word at `_` `/` `.` `:`); the rules and the
// markup are in src/lib/code-words.mjs, shared with EnvTable. Code blocks (`pre > code`) are left alone.
const wrapInlineCode = {
  name: 'wrap-inline-code',
  element: {
    filter: ['code'],
    /** @param {any} node @param {any} ctx */
    visit(node, ctx) {
      if (ctx.parent(node)?.tagName === 'pre') return
      if (!node.children.every((/** @type {any} */ c) => c.type === 'text')) return
      ctx.setField(node, 'children', codeChildren(ctx.textContent(node)))
    },
  },
}

// A link to another site opens in a new tab (`rel="noopener noreferrer"`, so that site can't reach this page).
// Links within circi.dev, relative or absolute, stay in the tab and keep the client router. The footer and the
// header's GitHub icon do the same by hand (Footer.astro, Header.astro).
const SITE = 'https://circi.dev'
const externalLinks = {
  name: 'external-links',
  element: {
    filter: ['a'],
    /** @param {any} node @param {any} ctx */
    visit(node, ctx) {
      const href = String(node.properties?.href ?? '')
      if (!/^https?:\/\//.test(href) || new URL(href).origin === SITE) return
      ctx.setField(node, 'properties', { ...node.properties, target: '_blank', rel: ['noopener', 'noreferrer'] })
    },
  },
}

// The documentation of CirCI. The sidebar is explicit so the order is ours; every slug below is
// a file under src/content/docs (see DESIGN.md for the page conventions and the sidebar's groups).
// `site` is the public address (GitHub Pages, custom domain circi.dev at the root, so no `base`); it makes Starlight generate sitemap-index.xml.
export default defineConfig({
  // Smart punctuation would turn `--wait` into an en dash and break copied commands, so it is off (the same
  // output as the former `markdown.smartypants: false`, which is deprecated in favor of the processor's option).
  markdown: { processor: satteri({ features: { smartPunctuation: false }, hastPlugins: [/** @type {any} */ (wrapTables), /** @type {any} */ (wrapInlineCode), /** @type {any} */ (externalLinks)] }) },
  site: SITE,
  // The client router fetches a page when its link is hovered (or focused), so most clicks swap at once instead of
  // waiting for the request. Only HTML of pages on this site is fetched.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Pages that were removed or moved: the old address sends readers and search engines to the closest page now
  // (GitHub Pages can't send a 301, so Astro writes a page that redirects at once with a canonical link to the target).
  redirects: {
    '/ci/argos-compatible-api/': '/ci/cli/',
    // Moved so the URL follows the sidebar's groups (Compare, Review, Dashboard, Settings):
    '/introduction/visual-regression-testing-without-saas/': '/compare/visual-regression-testing-without-saas/',
    '/introduction/compared-with-chromatic-percy-argos/': '/compare/compared-with-chromatic-percy-argos/',
    '/introduction/chromatic-alternative/': '/compare/chromatic-alternative/',
    '/introduction/percy-alternative/': '/compare/percy-alternative/',
    '/introduction/compared-with-self-hosted-tools/': '/compare/compared-with-self-hosted-tools/',
    '/ci/playwright-tohavescreenshot/': '/compare/playwright-tohavescreenshot/',
    '/using/reviewing-a-build/': '/review/reviewing-a-build/',
    '/using/comments-and-regions/': '/review/comments-and-regions/',
    '/using/review-requests-and-rules/': '/review/review-requests-and-rules/',
    '/using/inbox-and-reviews/': '/review/inbox-and-reviews/',
    '/using/baselines-and-ignore-regions/': '/review/baselines-and-ignore-regions/',
    '/using/triage-and-flaky-screenshots/': '/review/triage-and-flaky-screenshots/',
    '/using/undo/': '/review/undo/',
    '/using/insights/': '/dashboard/insights/',
    '/using/saved-views/': '/dashboard/saved-views/',
    '/using/command-menu-and-search/': '/dashboard/command-menu-and-search/',
    '/using/live-updates/': '/dashboard/live-updates/',
    '/using/hosted-sites/': '/dashboard/hosted-sites/',
    '/using/mobile-and-installed-app/': '/dashboard/mobile-and-installed-app/',
    '/using/project-settings/': '/settings/project-settings/',
    '/using/workspace-settings/': '/settings/workspace-settings/',
    '/using/account-settings/': '/settings/account-settings/',
    '/using/members-and-roles/': '/settings/members-and-roles/',
    '/using/instance-administration/': '/settings/instance-administration/',
  },
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
      // The date each page last changed, from git (the deploy checks out the full history), shown under the page.
      lastUpdated: true,
      pagination: true,
      // Groups in the order a reader meets them: what CirCI is and how it compares, a first run, getting screenshots
      // in from CI, reviewing them, the dashboard and its settings, integrations, running a server, then lookups.
      // Labels are short (`sidebar.label` in a page's frontmatter when the title is longer); see DESIGN.md.
      sidebar: [
        {
          label: 'Introduction',
          collapsed: true,
          items: [
            'introduction/what-is-circi',
            'introduction/what-is-visual-regression-testing',
            'introduction/how-a-build-flows',
            'introduction/key-concepts',
            'introduction/how-screenshots-are-compared',
            'introduction/faq',
          ],
        },
        {
          label: 'Compare',
          collapsed: true,
          items: [
            'compare/visual-regression-testing-without-saas',
            'compare/compared-with-chromatic-percy-argos',
            'compare/chromatic-alternative',
            'compare/percy-alternative',
            'compare/compared-with-self-hosted-tools',
            'compare/playwright-tohavescreenshot',
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
          label: 'Upload from CI',
          collapsed: true,
          items: [
            'ci/cli',
            'ci/vitest',
            'ci/playwright',
            'ci/storybook',
            'ci/cypress',
            'ci/github-actions',
            'ci/ci-examples',
          ],
        },
        {
          label: 'Review',
          collapsed: true,
          items: [
            'review/reviewing-a-build',
            'review/comments-and-regions',
            'review/review-requests-and-rules',
            'review/inbox-and-reviews',
            'review/baselines-and-ignore-regions',
            'review/triage-and-flaky-screenshots',
            'review/undo',
          ],
        },
        {
          label: 'Dashboard',
          collapsed: true,
          items: [
            'dashboard/insights',
            'dashboard/saved-views',
            'dashboard/command-menu-and-search',
            'dashboard/live-updates',
            'dashboard/hosted-sites',
            'dashboard/mobile-and-installed-app',
          ],
        },
        {
          label: 'Settings',
          collapsed: true,
          items: [
            'settings/project-settings',
            'settings/workspace-settings',
            'settings/account-settings',
            'settings/members-and-roles',
            'settings/instance-administration',
          ],
        },
        {
          label: 'Integrations',
          collapsed: true,
          items: [
            'integrations/overview',
            'integrations/github',
            'integrations/gitlab',
            'integrations/bitbucket',
            'integrations/slack',
            'integrations/linear',
            'integrations/jira',
            'integrations/figma',
            'integrations/webhooks',
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
                'self-hosting/database',
                'self-hosting/storage',
                'self-hosting/authentication',
                'self-hosting/security',
              ],
            },
            {
              label: 'Operate',
              collapsed: true,
              items: [
                'self-hosting/upgrades-and-migrations',
                'self-hosting/backups',
                'self-hosting/monitoring',
                'self-hosting/retention-and-gc',
                'self-hosting/scaling-the-worker',
                'self-hosting/performance',
                'self-hosting/troubleshooting',
              ],
            },
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          items: [
            'reference/http-api',
            'reference/ci-api',
            'reference/errors-and-exit-codes',
            'reference/admin-cli',
            'reference/environment-variables',
            'reference/limits',
            'reference/background-jobs',
            'reference/build-statuses',
            'reference/notifications',
            'reference/keyboard-shortcuts',
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
