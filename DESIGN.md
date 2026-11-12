# Design notes for the CirCI documentation

For the agents refining pages. The site is Starlight (Astro). It should feel like part of the product:
warm near-black in dark (the reference), warm greys and a near-white panel in light, one terracotta accent,
Inter and JetBrains Mono, small radii.

## Where things live

| What | Where |
|---|---|
| Tokens and the Starlight mapping (the only place colors, fonts, radii are defined) | `src/styles/circi-theme.css` |
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
`docs.css`, never raw numbers. Never write hex values outside `circi-theme.css`. The state colors
(`--circi-state-*`: approved, review, processing, failed, rejected, added, removed, flaky) are available for
status chips in prose; light-scheme values are darkened for 4.5:1 contrast.

Body text is 15px (`--sl-text-body`) where the app uses 13px: documentation is read, not scanned.

## Overrides (Starlight `components:` in `astro.config.mjs`)

All in `src/components/overrides/`: `SiteTitle` (rounded logo mark, "CirCI", "Docs"), `ThemeSelect` (a System / Light / Dark
segmented control like the app's, same storage key as Starlight), `PageTitle` (the sidebar group as a quiet breadcrumb line, the
title, the page `description` as a lead; on a splash page the h1 is visually hidden), `Footer` (Starlight's pagination, then links to
the glossary, environment variables, HTTP API and CLI). The sidebar, table of contents and pagination are CSS in `docs.css`. There is
no repository to link to, so the header has no social icons. Code blocks use Expressive Code with the vitesse themes and the app's
surfaces (`expressiveCode.styleOverrides`).

Line length: paragraphs and lists are capped at `60ch` (about 70 characters at 15px); tables, code and figures use the full column.
Type scale: body 15px (`--sl-text-base`), h1 30px, h2 22px, h3 18px.

## Components

Every component is shown on `/design-kit/` (hidden from the sidebar and search). Import with
`import X from '../../../components/X.astro'` (depth depends on the page folder; MDX does not take the `#` aliases in content).
In MDX, markdown does not work inside a JSX element's text: use `<code>` and `<a>` there.

- `StatusChip.astro`: the app's status glyphs (geometry copied from `StatusIcon.tsx`). Statuses: `approved`, `auto-approved`,
  `needs-review`, `processing`, `failed`, `rejected`, `unchanged`, `added`, `removed`, `flaky`.
  `<StatusChip status="needs-review" />`, `<StatusChip status="approved">3 approved</StatusChip>` (own words),
  `<StatusChip status="flaky" glyph />` (glyph only, named for assistive tech). Use it when the page talks about a state, once per
  state in a paragraph, not on every mention.
- `BuildFlow.astro`: upload, compare, review, merge gate, inline SVG (a row on wide screens, a column on narrow), with a title and
  description. `<BuildFlow />`, `<BuildFlow current={3} />` highlights a stage (1 to 4).
- `<Steps>` (Starlight's, restyled in `docs.css`): a numbered list for setup guides. One action per step, the first line is the action.
  Put a `CopyCommand` or a fenced block inside a step.
- Callouts: Starlight's `<Aside type="note|tip|caution|danger">`, mapped to processing, approved, needs review and failed.
  Note is information, tip is good news, caution needs a decision, danger breaks something.
- `ScreenFrame.astro`: `<ScreenFrame name="build-review" alt="..." caption="..." width={760} />`. `aspect="16 / 10"` crops to a fixed ratio
  (keeps the top of the capture) so a run of captures lines up; images are lazy and reserve their box (`loading="eager"` for the first one on a page). Reads
  `src/assets/screens/<name>-dark.jpg` and `<name>-light.jpg` and shows the one for the reader's theme. Capture both from the running
  dashboard (`pnpm dev` in the repo) at 1440px wide. Alt text says what the screenshot shows, not "screenshot of".
- `Kbd.astro`: `<Kbd keys="Shift+A" />`, `<Kbd keys="Mod+K" />` (Mod is Command; Shift, Alt, Ctrl, Enter, Esc also map to symbols).
  A sequence is `<Kbd keys="g then i" />` (key, release, key), never two `Kbd`s with "then" between them.
- `Diagram.astro`: a themed, accessible inline SVG (`viewBox`, `title`, `desc`, optional `caption`, `width`). Draw its children with the
  `d-box`, `d-box--accent`, `d-line`, `d-title`, `d-mono`, `d-text`, `d-fill` classes so both themes work; no inline colors. The title and
  description are the accessible name, so say what the picture shows, not "diagram of". `BuildFlow` stays its own component (two layouts).
  Example: the layers in `contributing/repo-layout`.
- Steps and Asides: an Aside indented under a step stays in the step (one short warning about that action). Anything longer ends the list:
  close `</Steps>`, write the text, open a new `<Steps>` and carry on with the `start` attribute of the list.
- `SettingCard.astro`: one variable or setting. `<SettingCard name="PUBLIC_URL" defaultValue="http://localhost:3000" type="URL">`
  description `</SettingCard>`; `required` for required ones. For the full reference keep using `EnvTable`.
- `CopyCommand.tsx`: one command with a Copy button, `<CopyCommand client:visible command="npx circi upload ./screenshots --wait" />`.
  For several lines use a fenced `sh` block (Expressive Code adds its own copy button).
- `ReviewCompare.astro` / `.tsx`: the landing page's before / after / diff slider (React island). Landing page only.
- `EnvTable.astro`: `<EnvTable />` or `<EnvTable group="mail" />`. Reads `src/data/env.ts`.
- `InstanceSettingNote.astro`: the dashed callout for a passage about a setting that is edited in Instance settings (sentence-case title).
  Searching for `InstanceSettingNote` finds every spot. The truth to state everywhere: an environment variable, when set, wins and locks the
  setting ("Set by <VAR>", and a save is refused); otherwise the saved value; otherwise the default. Changes apply within about 30 seconds
  on every server process, with no restart. Secrets are write-only and sealed at rest.

Screenshots on disk (`src/assets/screens/`): `host-instance-settings`, `host-instance-limits` and `host-health` (Instance settings and Health; Health is scrolled past Services, whose rows show the server's local file path: keep personal paths out of captures), `build-review-{dark,light}.jpg` (build #22 of the seeded dev Workspace, side by side),
`hero-before.jpg`, `hero-after.jpg`, `hero-diff.jpg` (the same screenshot's baseline, new version and diff, for the landing page).
The `.jpg` files are Chrome captures of the dashboard, so they are 1x; add more by the same naming.

## Site address

`astro.config.mjs` sets `site: 'https://docs.circi.dev'` as a **placeholder, to be set** to the real address when the docs are published.
It exists so Starlight generates `sitemap-index.xml`; the canonical links and the sitemap use it.

## Landing page

`src/content/docs/index.mdx` (template `splash`) with `src/styles/landing.css` (classes `.landing`, `.l-*`, used only there):
the headline and a live before / after / diff of a real changed screenshot, four paths (run it locally, self-host, set up CI, review
builds), the build flow, and a screenshot of the build page.

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

- Reusing real `@circi/ui` components in islands (see above).
- More dashboard screenshots (Baselines, Triage, Insights, settings) for the `using/` pages, both themes.
- A single Self-hosting topology diagram (the TLS, scaling and storage pages each draw their own part with `Diagram`).
- Section index pages: none exist; the sidebar groups open on their first page.
