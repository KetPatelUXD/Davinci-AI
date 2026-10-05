# PROGRESS

All build steps from `docs/build-prompt.md` are complete; see `SUMMARY.md`.

| # | Step | Status |
|---|------|--------|
| 1 | Monorepo, tooling, CI, `.npmrc.example`, env | ✅ |
| 2 | Tokens + build + contrast/opacity tests | ✅ (180 contrast tests) |
| 3 | Theme/Density providers, card/panel/spotlight/glass/motion, AppBackground, Icon, logo, typography | ✅ |
| 4 | Primitives + display | ✅ |
| 5 | Navigation, overlays, layout | ✅ |
| 6 | Data | ✅ |
| 7 | Finance composites + SVG charts | ✅ |
| 8 | Chat / AI | ✅ |
| 9 | Storybook docs, example pages, playground | ✅ (149 stories) |
| 10 | components.json (+Figma), tokens:figma, icon manifest, Code Connect, figma-kit, AGENTS/CLAUDE/README, Changesets | ✅ |
| 11 | `npx davinci theme` CLI | ✅ |

Gates (all green at last run): `pnpm typecheck` · `pnpm lint` · `pnpm test` (423) · `pnpm build` · `pnpm build-storybook` · `pnpm test:storybook` + light (149 each) · `pnpm exec playwright test` (19; Markets diff 1.3 % dark / 2.6 % light).

## Where we left off (update at the end of every session)
- **Figma kit is complete (2026-10-05)** – https://www.figma.com/design/9aDylAVblgXqs1SbuugPEf/Davinci-AI : variables/styles, Colour, Typography, Spacing & sizes, Radius & elevation, Motion, Icons (+ gallery), Foundations primitives, every component category (129 component sets, ~1,080 variants, all generated from rendered components via `scripts/figma-*.mjs`), Patterns, Examples (4 screens from instances), Getting started, Sync & changelog. Pipeline: see `docs/figma-kit.md`; builder source `scripts/figma-lib/` (also stored in the file as plugin data `dvlib`).
- Library fixes made along the way (uncommitted until the commit that accompanies this note): `Divider` data-orientation, `.dv-range-calendar` scoping, naming convention renames, Storybook `Internal/Extract*` hosts, `check-naming`/`check-anatomy` gates. Gates run this session: typecheck, lint (incl. naming + anatomy), `pnpm test` (423). **Not re-run:** build, build-storybook, test:storybook (light/dark), test:screens – run `pnpm test:all` before publishing.
- **Open follow-ups:** (1) add `dv-{block}__{part}` classes + anatomy entries for parts named only in the extractor config (PageHeader eyebrow/title, UserChip name/subtitle, Banner title/body, QuoteCard heading, Composer attach/tools); (2) disabled `solid` Button specificity bug in `actions.css`; (3) fold hand patches into the pipeline (root widths of date/time fields, Calendar nav icons, SideNav item fill, WatchlistRow row layout, DayRange `bar` variant in QuoteCard); (4) add `sheen/*` helper variables to the token pipeline; (5) re-extract Calendar/Divider after the next Storybook build; (6) Figma names audit against the live file after any library rename.
- Nothing published or pushed. Next candidates: registry + publish, `davinci init`, MCP server, DateRangePicker presets / DateTimePicker, hosted Storybook, Code Connect URLs.
