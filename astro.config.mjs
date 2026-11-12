// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// The documentation of CirCI. The sidebar is explicit so the order is ours; every slug below is
// a file under src/content/docs (see DESIGN.md for the page conventions).
// `site` is a placeholder until the docs have their address: it makes Starlight generate sitemap-index.xml.
export default defineConfig({
  site: 'https://docs.circi.dev',
  server: { port: 4321 },
  integrations: [
    starlight({
      title: 'CirCI',
      description: 'Documentation for CirCI, self-hosted visual regression testing.',
      logo: { src: './src/assets/logo.svg', alt: 'CirCI' },
      favicon: '/favicon.svg',
      head: [
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/icons/180.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#0c0a09', media: '(prefers-color-scheme: dark)' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#e9e2de', media: '(prefers-color-scheme: light)' } },
      ],
      customCss: ['./src/styles/circi-theme.css', './src/styles/docs.css', './src/styles/landing.css'],
      components: {
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
          items: [
            'introduction/what-is-circi',
            'introduction/how-a-build-flows',
            'introduction/key-concepts',
          ],
        },
        {
          label: 'Getting started',
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
          items: [
            'self-hosting/requirements',
            'self-hosting/docker-compose',
            'self-hosting/tls-and-reverse-proxy',
            'self-hosting/site-domains',
            'self-hosting/storage',
            'self-hosting/database',
            'self-hosting/configuration',
            'self-hosting/instance-settings',
            'self-hosting/upgrades-and-migrations',
            'self-hosting/backups',
            'self-hosting/retention-and-gc',
            'self-hosting/scaling-the-worker',
            'self-hosting/performance',
          ],
        },
        {
          label: 'Using CirCI',
          items: [
            'using/reviewing-a-build',
            'using/comments-and-regions',
            'using/review-requests-and-rules',
            'using/inbox-and-reviews',
            'using/triage-and-flaky-screenshots',
            'using/baselines-and-ignore-regions',
            'using/insights',
            'using/saved-views',
            'using/hosted-sites',
            'using/project-settings',
            'using/workspace-settings',
            'using/members-and-roles',
            'using/account-settings',
            'using/instance-administration',
          ],
        },
        {
          label: 'CI integration',
          items: ['ci/cli', 'ci/vitest', 'ci/ci-examples', 'ci/argos-compatible-api'],
        },
        {
          label: 'Integrations',
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
          label: 'Reference',
          items: [
            'reference/http-api',
            'reference/admin-cli',
            'reference/environment-variables',
            'reference/glossary',
          ],
        },
        {
          label: 'Contributing',
          items: [
            'contributing/repo-layout',
            'contributing/local-development',
            'contributing/tests',
          ],
        },
      ],
    }),
    react(),
    mdx(),
  ],
})
