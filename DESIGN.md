# Design notes for the CirCI documentation

For the agents refining pages. The site is Starlight (Astro). It should feel like part of the product:
warm near-black in dark (the reference), warm greys and a near-white panel in light, one terracotta accent,
Inter and JetBrains Mono, small radii.

## Where things live

| What | Where |
|---|---|
| Tokens and the Starlight mapping (the only place colours, fonts, radii are defined) | `src/styles/circi-theme.css` |
| Component-level CSS on Starlight's markup | `src/styles/docs.css` |
| Shared components | `src/components/` (`EnvTable.astro`, `InstanceSettingNote.astro`, `CopyCommand.tsx` React island) |
| Data behind generated tables | `src/data/env.ts` (the environment variable reference) |
| Sidebar and Starlight config | `astro.config.mjs` (explicit sidebar: add a page = add the file and its slug) |
| Logo, favicon | `src/assets/logo.svg` (header), `public/favicon.svg`, `public/icons/` (copied from `apps/web`) |
| Component overrides | `astro.config.mjs` `components: { Header: './src/components/overrides/Header.astro' }` |

## Token mapping

Source of truth: `repo/packages/ui/src/theme.ts` (palettes) and `repo/packages/ui/tokens-css.ts` (radii, fonts).
The `--circi-*` variables are copied with their values; `--sl-*` are derived from them in the same file. Dark is
`:root`, light is `:root[data-theme='light']` (Starlight sets it from the reader's choice: Auto follows the system).

| Starlight | CirCI token | Dark | Light |
|---|---|---|---|
| `--sl-color-black` / `--sl-color-bg` (page) | `surface-panel` | `#131110` | `#fefdfc` |
| `--sl-color-bg-nav`, `-bg-sidebar` | `surface-chrome` | `#0c0a09` | `#e9e2de` |
| `--sl-color-gray-7` (raised: code, cards) | `surface-raised` | `#1a1716` | mix of chrome and panel |
| `--sl-color-gray-6` (overlay) | `surface-overlay` | `#221e1d` | `#e9e2de` |
| `--sl-color-gray-5` (borders, fills) | `surface-highest` | `#2b2625` | `#dcd3ce` |
| `--sl-color-gray-4` | mix of tertiary text and panel | | |
| `--sl-color-gray-3` | `text-tertiary` | `#998e89` | `#63574f` |
| `--sl-color-gray-2` | `text-secondary` | `#a89d98` | `#51463f` |
| `--sl-color-white`, `--sl-color-text` | `text-primary` | `#ede6e3` | `#1c1614` |
| `--sl-color-accent` | `accent-main` | `#d9806d` | `#a63f27` |
| `--sl-color-accent-high`, `text-accent` | `accent-text` | `#eaa493` | `#8e3420` |
| `--sl-color-accent-low` | 12 to 16% accent over panel | | |
| `--sl-color-text-invert` (on accent) | `accent-on-accent` | `#1c0f0c` | `#ffffff` |
| `--sl-color-hairline*` | `line-subtle` | white 7% | ink 10% |
| aside note / tip / caution / danger | `state-processing` / `approved` / `review` / `failed` | periwinkle, teal, amber, crimson | darker variants |
| `--sl-font`, `--sl-font-mono` | `font-sans`, `font-mono` | Inter Variable, JetBrains Mono Variable | same |

Radii: inline 4px, control 6px, popup 8px, panel 10px, command 12px (`--circi-radius-*`). Use them in
`docs.css`, never raw numbers. Never write hex values outside `circi-theme.css`. The state colours
(`--circi-state-*`: approved, review, processing, failed, rejected, added, removed, flaky) are available for
status chips in prose; light-scheme values are darkened for 4.5:1 contrast.

Body text is 15px (`--sl-text-body`) where the app uses 13px: documentation is read, not scanned.

## Components

- `EnvTable.astro`: `<EnvTable />` (all groups) or `<EnvTable group="mail" />`. Reads `src/data/env.ts`.
- `InstanceSettingNote.astro`: the dashed callout marking passages about settings that are moving into
  Instance settings. Searching for `instance-setting` and `InstanceSettingNote` finds every spot to update.
- `CopyCommand.tsx`: a React island (`client:visible`), the template for later islands.
- Starlight's own `Steps`, `Tabs`, `Aside`, `Card`, `FileTree`, `Badge` are used on pages.

## Page conventions

- MDX, no H1 in the body. Frontmatter `title` and `description`.
- First line after frontmatter: `{/* Source: repo files this page came from */}` (invisible).
- Vocabulary and copy (from the repo's `CLAUDE.md`): Project and Workspace, "screenshot" never "snapshot",
  "ID", straight apostrophes, sentence case, "Delete" vs "Remove", no emojis.
- In prose, put `{`, `}` and `<` in backticks (MDX).

## Reusing `@circi/ui` later

`@circi/ui` (React, Base UI, CSS modules) is in `repo/packages/ui`, with `src/global.css` and the token generator
`tokens-css.ts`. To embed real components in React islands: build the package (`pnpm --filter @circi/ui build`),
add it as a `file:` or `link:` dependency here, import `@circi/ui`'s stylesheet in the island's page, and render
with `client:visible`. Its tokens use the same `--circi-*` names as `circi-theme.css`, and its scheme attribute is
`data-circi-color-scheme`, so an island needs the attribute set from Starlight's `data-theme` (a small script in
`head`). Not wired yet.

## Open items for design

- Splash page (`index.mdx`): Starlight's hero is default; a product-like hero (build screen) is next.
- Header and sidebar overrides to match the app's chrome; a theme control styled like `ColorSchemeControl`.
- Screenshots of the dashboard on `using/` pages (take them from `pnpm dev`).
- Status chips and diff illustrations as components.
