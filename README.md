# CirCI documentation

Starlight site for CirCI, published at https://circi.dev. See `DESIGN.md` for the theme and components.

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # astro check + astro build to dist/
pnpm preview
```

## Publishing

Every push to `main` builds the site and deploys it to GitHub Pages (`.github/workflows/pages.yml`; the repository's Pages source is "GitHub Actions"). The custom domain `circi.dev` is the apex, so the site is served from the root and has no base path; `public/CNAME` carries the domain into each deploy. CircleCI (`.circleci/config.yml`) runs `pnpm build` as the `build` check on every push and pull request.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and https://circi.dev/contributing/how-to-contribute/.

## License

Licensed under the [GNU General Public License v3.0](LICENSE) (GPL-3.0-only).
