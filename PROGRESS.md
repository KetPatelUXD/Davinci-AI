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

## Storybook coverage (2026-10-05)

Theme file (2026-10-06): `davinci.theme.json` (DTCG style) compiled by one contrast-checking compiler (`bin/lib/theme-core.mjs`); CLI `davinci theme --init | --file | --validate | --from-figma`, `ThemeProvider themeConfig`, `compileTheme`/`validateTheme`, generated `theme.schema.json`, samples in `assets/themes`, Storybook story *Foundations → Theme file*, guide `docs/theming-guide.md` (Guides → Theming → Change the theme step by step), `docs/build-prompt.md` updated, DECISIONS #38. Radii (`radius/*`) and component sizes/paddings (Component collection) are imported too (`radius.<role>`, `size.<density>.<token>`); blur, motion and `space/*` primitives are not themeable. The Figma Sync & changelog page has the 2026-10-06 entry.

News list change (user request): headlines no longer expand inline (no chevron); `NewsList`/`NewsItem` take `onOpen` and the new `ArticleView` component (Back button, tags, title, source/time, standfirst, body) is the full-article page. Time column is sized to the longest timestamp so headlines align. `Prose` paragraph spacing fixed (zero-specificity resets). Figma: NewsItem (boolean `unread`), NewsList and new ArticleView rebuilt; Badge gained `dot`/`hasIcon` booleans (off by default) and `label` text prop; builder text-override bug for components whose text prop is `children` fixed (it had overwritten Badge icon glyphs, 17 instances repaired).

Core page example: `packages/examples/src/CoreGlobalPrices.tsx` (+ `corePricesData.ts`, story `Examples/Core – Global prices`, dark and light) rebuilds the Core Global prices screen from library components only, with fictional data. Gaps vs the original: no news thumbnails, no grouped table rows, no advanced chart toolbar (drawing tools, indicators), no right-hand utility rail.

Figma re-sync after the fixes: PillTabs tab labels corrected (were 1D/1W/1M). Root cause was the old extraction of the then-broken component (empty tab list, so no text overrides), not the builder – the builder applies instance text overrides correctly (OrderTicket verified). Stat sparkline already matched. Slider/RangeSlider `orientation="vertical"` is code-only in Figma (no variant yet).

Visual review fixes (same day): PillTabs thumb moved outside the TabList (tabs were empty); Stat sparkline no longer collapses; Slider/RangeSlider support `orientation="vertical"`; MessageActions story renders inside a ChatMessage; Slot fixture visible; Variants rows top-aligned; Dialog/ConfirmDialog triggers neutral. Gates run: lint, 423 unit tests, 447 Storybook tests (dev server). Not yet run: build-storybook, test:screens (baselines for renamed story ids need regenerating), light-theme run.


- **Every component has its own generated story file** (133, next to its source: `src/**/<Name>.stories.tsx`). Do not edit them by hand: run `pnpm gen:stories` after `pnpm build` (reads `dist/components.json`). Usage lives in `scripts/stories.spec.mjs`, sample data in `src/stories/fixtures.tsx`.
- Each file has Default (Controls), **Variants** (every value of every enum prop), **Matrix** (two main axes), **States** (disabled/invalid/selected/…), spec extras, and the interaction stories (hover / focus / open) from `PLAY` in the spec.
- Adding a component without a spec entry makes `gen:stories` fail, so new components cannot ship without a story.
- Second cover: `Cover → Leonardo` (`apps/storybook/public/cover-machina.html`); decide which is the default.
- Not yet run after this change: `build-storybook`, `test:storybook` (axe, dark + light), `test:screens` (visual baselines of old story ids will need regenerating).

## Where we left off (update at the end of every session)
- **Figma kit is complete (2026-10-05)** – https://www.figma.com/design/9aDylAVblgXqs1SbuugPEf/Davinci-AI : variables/styles, Colour, Typography, Spacing & sizes, Radius & elevation, Motion, Icons (+ gallery), Foundations primitives, every component category (129 component sets, ~1,080 variants, all generated from rendered components via `scripts/figma-*.mjs`), Patterns, Examples (4 screens from instances), Getting started, Sync & changelog. Pipeline: see `docs/figma-kit.md`; builder source `scripts/figma-lib/` (also stored in the file as plugin data `dvlib`).
- Library fixes made along the way (uncommitted until the commit that accompanies this note): `Divider` data-orientation, `.dv-range-calendar` scoping, naming convention renames, Storybook `Internal/Extract*` hosts, `check-naming`/`check-anatomy` gates. Gates run this session: typecheck, lint (incl. naming + anatomy), `pnpm test` (423). **Not re-run:** build, build-storybook, test:storybook (light/dark), test:screens – run `pnpm test:all` before publishing.
- **Open follow-ups:** (1) add `dv-{block}__{part}` classes + anatomy entries for parts named only in the extractor config (PageHeader eyebrow/title, UserChip name/subtitle, Banner title/body, QuoteCard heading, Composer attach/tools); (2) disabled `solid` Button specificity bug in `actions.css`; (3) fold hand patches into the pipeline (root widths of date/time fields, Calendar nav icons, SideNav item fill, WatchlistRow row layout, DayRange `bar` variant in QuoteCard); (4) add `sheen/*` helper variables to the token pipeline; (5) re-extract Calendar/Divider after the next Storybook build; (6) Figma names audit against the live file after any library rename.
- Nothing published or pushed. Next candidates: registry + publish, `davinci init`, MCP server, DateRangePicker presets / DateTimePicker, hosted Storybook, Code Connect URLs.
