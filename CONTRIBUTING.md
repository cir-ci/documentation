# Contributing to the CirCI documentation

This repository is the source of https://circi.dev. The full contributing guide, for the product and for this site, is **https://circi.dev/contributing/how-to-contribute/**. This is the short version.

- **The critical rule: understand what you write.** Documentation must match what CirCI does. Check the code in the [main repository](https://github.com/cir-ci/repo) rather than trusting memory or an AI tool.
- **Disclose AI use.** Name the tool and how much it did, in the pull request. A human reads and edits everything sent to the project.
- **A mistake or gap:** search the issues (closed ones too), then file a Documentation problem. Typos and small corrections can go straight to a pull request. For a new page or a rewrite, open an issue first.
- **Bugs in CirCI itself, questions and feature ideas** belong to the main repository (issues for bugs, discussions for the rest).
- **Set up:** Node 26, pnpm 12. `pnpm install`, then `pnpm dev` (http://localhost:4321). Run `pnpm build` (astro check and astro build) before you push; it's also the `build` check in CI.
- **Conventions:** see `DESIGN.md` for the theme and components. Copy uses contractions with the straight apostrophe, US spelling, "screenshot" (never "snapshot"), "ID", sentence case, and "Delete" versus "Remove" as in the dashboard. A new page needs a sidebar entry in `astro.config.mjs`.
- **License:** contributions are licensed under the [GNU GPL v3](LICENSE), like the rest of the documentation.

Adapted from [Ghostty's contributing guide](https://github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md), © Mitchell Hashimoto and Ghostty contributors, MIT License (the notice is on the documentation page above).
