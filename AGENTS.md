# AGENTS.md – building with DaVinci.AI (`@davinci-ai/react`)

Rules for AI code assistants and developers **consuming** the design system. Follow them exactly; they exist so the first generation is correct and accessible.

## Source of truth

- `node_modules/@davinci-ai/react/components.json` – every component: import, props (types, defaults, allowed values), variants, sizes, states, keyboard/ARIA notes, related components.
- `node_modules/@davinci-ai/react/tokens.json` (DTCG) and `@davinci-ai/react/tokens` (typed) – every colour, size, radius, shadow and text style.
- Storybook – live examples for every variant and state.
- **Read `components.json` before writing UI. Do not guess prop names or values.**

## Non-negotiable rules

1. **Use library components only.** Build pages by composing `@davinci-ai/react` components. **No page-level custom styling** (no ad-hoc CSS for colours, radii, shadows, spacing of library parts).
2. **Tokens only – never hard-coded values.** No hex/rgb colours, no px radii/shadows copied from a design. Use semantic roles (`--dv-text-secondary`, `bg-surface`, `text-muted`, `rounded-card`). Never reference primitives (`--dv-p-*`, `slate-500`).
3. **If a component is missing, create it in the library first** (`packages/davinci-ai/src/components/…`, with stories, tests and a manifest entry), then use it. Do not inline one-off lookalikes in an app.
4. **Meet WCAG 2.2 AA.** Every input has a label (visible, or `aria-label`). Icon-only controls use `IconButton` with `label`. Colour is never the only signal – long/short, status and validation always have an icon, sign or text. Don't remove focus rings. Don't announce live price ticks (use `PriceFlash announceThresholdPercent` for significant moves only).
5. **Use semantic colour roles.** `positive` = long/up/success, `negative` = short/down/error, `brand` = focus/LEO/links, `on` = selected/primary neutral. Never use `data-*` colours for status. Do not flip red/green yourself – set `ThemeProvider direction="inverted"` (red-up markets) or `colorBlindSafe`.
6. **Follow size and density conventions.** Dense data screens: `size="md"` (or `sm`), `density="compact"`, `Form layout="dense"`. Sparse/occasional forms: comfortable density, `Form layout="sparse"`, `size="lg"`. Exactly **one** `solid primary` button per view; `subtle` for secondary tools (e.g. Filters); `ghost` for tertiary. Primary CTA = `size="xl"`; Buy/Sell CTAs use `intent="positive" | "negative"`.
7. **Dark is the default experience.** Wrap the app in `<ThemeProvider canvas attachToRoot>` once. Every screen must work in both `dark` and `light`; never assume a theme in your own CSS.
8. **Progressive disclosure.** Show the essential first; put detail in `Disclosure`, `Popover`, `Drawer`, `Menu`, `ReasoningBlock`.
9. **Numbers:** right-align, tabular figures (`NumberText`, table `numeric` columns), locale `en-US` unless told otherwise (`ThemeProvider locale`). Use `PriceChange`/`DeltaPill` for signed changes (never colour a bare number).
10. **Fictional data only in examples and docs.** Never use real assessment names, prices or brands.
11. **Use the naming convention** (`docs/naming-convention.md`, Storybook → Guides → Naming). Props: `variant`, `intent` (never `tone`), `size`, `orientation`, `isX` booleans. Name your own widgets and page regions the same way (`Widget/Header`, `Page/Sidebar`). Never target `dv-*` classes or `data-*` attributes from project CSS; `components.json` lists each component's `css.block` / `css.parts`.

## Setup

```tsx
import '@davinci-ai/react/styles.css';     // required
import '@davinci-ai/react/fonts.css';      // optional: self-hosted Inter
import { ThemeProvider } from '@davinci-ai/react';

<ThemeProvider canvas attachToRoot>{/* app */}</ThemeProvider>
```

Tailwind users: `@import '@davinci-ai/react/tailwind';` after the tokens to get `bg-surface`, `text-secondary`, `rounded-card`, `shadow-card`… (library internals use the `dv:` prefix and never clash). Icons: kebab-case Font Awesome names (`iconStart="plus"`, `<Icon name="chart-line" />`); register Font Awesome Pro definitions with `IconProvider`.

## Quick map (see components.json for the full list)

| Need | Use |
|---|---|
| Page frame | `AppShell`, `AppHeader`, `PageHeader`, `SideNav` |
| Surfaces | `Card` (`title`, `actions`), `Panel`, `AccentTile` |
| Actions | `Button`, `IconButton`, `SegmentedControl`/`PillTabs`, `Menu`, `ToggleButton` |
| Forms | `Form`, `TextField`, `NumberField`/`PriceField`, `Select`, `ComboBox`, `DatePicker`, `Switch`/`SwitchRow`, `Checkbox`, `RadioGroup` |
| Feedback | `Toast` (`useToast`), `Alert`, `Banner`, `Callout`, `Dialog`/`ConfirmDialog`, `Tooltip` |
| Data | `Table` (+ `AssetCell`, `RowActions`), `List`, `TreeView`, `DescriptionList` |
| Markets | `Stat`, `QuoteCard`, `PriceChart`, `Sparkline`, `DonutChart`, `PriceChange`, `PriceFlash`, `DeltaPill`, `Watchlist`, `OrderTicket`, `MarketPulse`, `TickerTape`, `NewsList` |
| AI | `ChatThread`, `ChatMessage`, `Composer`, `SuggestedPrompts`, `ReasoningBlock`, `ToolUseBlock`, `CitationChip`, `ArtifactPanel` |

## Do / Don't

```tsx
// ✅
<Button iconStart="plus">New alert</Button>
<PriceChange percent={-0.86} />
<IconButton label="Refresh" icon="rotate-right" />

// ❌ hard-coded colour, unlabeled icon button, colour-only signal
<button style={{ background: '#7c3aed' }}><Icon name="plus" /></button>
<span style={{ color: 'green' }}>1.42</span>
```

## Verify

Run the app's axe checks; the library's own CI fails on contrast regressions (tokens), axe violations (unit + Storybook) and visual diffs of the Markets dashboard.


---

# Working in this repository (contributors)

- Monorepo (pnpm): `packages/tokens` (DTCG source + build), `packages/davinci-ai` (`@davinci-ai/react`), `packages/examples` (private example pages + fictional data), `apps/storybook`, `apps/playground` (**private – never published or deployed**).
- Tokens: edit the tables in `packages/tokens/scripts/seed.mjs`, run `pnpm --filter @davinci-ai/tokens seed && pnpm tokens`, commit `tokens.json`. Components never reference primitives; translucent values are named `alpha` primitives.
- A new component needs: the component (React Aria based, typed props with JSDoc incl. `@when` / `@whenNot`), CSS in `src/styles/*.css` using tokens only, a story file, an axe test in `src/test/components.test.tsx`, an entry (category, keyboard/ARIA notes, states, anatomy with token names) in `scripts/components.config.mjs`, and an export in `src/index.ts`.
- Naming: follow `docs/naming-convention.md`. A new component's CSS block is `dv-{kebab-name}`, parts are `dv-{block}__{part}` (flat, hyphenated), modifiers are data attributes that mirror props, and the manifest anatomy part names must equal the real parts (`pnpm check:naming` and `pnpm check:anatomy` run in `pnpm lint`; DOM-only helper parts go in `domParts`, shared blocks in `shares`). Figma is regenerated from `components.json` using the same names.
- Gates: `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm build-storybook && pnpm test:storybook && pnpm test:screens`.
- Decisions go in `DECISIONS.md`, progress in `PROGRESS.md`. Code is the source of truth for Figma – never the reverse (see `docs/figma-kit.md`).

---

# How we work (standing decisions – read first in every new session)

**Start of session:** read `CLAUDE.md` (this file), `PROGRESS.md` (where we left off), `DECISIONS.md` (why), `SUMMARY.md` (what exists and known gaps). **End of session:** update `PROGRESS.md` and add any new decision to `DECISIONS.md`.

## Where things live
- **Library repo = the only place components are created.** A consuming project never gets its own copy of a primitive. Missing component → add it here (component, CSS with tokens only, story, axe test, `scripts/components.config.mjs` entry, export, changeset), then install/link it into the project and pin the version.
- **Primitives and base composites** (`Stat`, `PriceChange`, `Table`, `OrderTicket`, `Composer`…) live in the library. **Project-specific widgets** are built in the project from library components only. If a second project wants a widget, promote it to the library.
- **Page templates** live in `packages/examples` (private, never published). They are documentation/reference, not part of `@davinci-ai/react`. They will be split into a separate templates package later – until then keep them importing only from `@davinci-ai/react`, with data separated in `data.ts`.
- **Source of truth for a page** = its component in `packages/examples/src` (e.g. `MarketsDashboard.tsx`). Storybook, the playground and the visual test only import it.
- **Visual source of truth** = `reference/davinci-ai-reference.html` (Graphite). Accessibility beats the reference when they conflict (log it in `DECISIONS.md`).
- **Tokens:** edit `packages/tokens/scripts/seed.mjs` → `pnpm --filter @davinci-ai/tokens seed && pnpm tokens`. Never hand-edit `tokens.json` or `src/generated`.

## Custom styling rules (for project widgets)
Safe: compose library components with documented props; style only your own wrapper (layout/spacing); use `var(--dv-…)` tokens. Not safe: targeting `.dv-*` classes or `data-*` attributes, per-widget token overrides, copying primitive markup/CSS, hard-coded hex, inline colours. Whole-brand changes go through `npx davinci theme` or global token overrides. Full guide: Storybook → **Guides → Extending the library**.

## Roadmap / open decisions (not done yet)
- **Distribution:** nothing is published. Plan: private registry (GitHub Packages), set `davinci.config.json` scope → `pnpm set-scope`, enable the manual Publish workflow. Until then install via `pnpm pack` tarball or `link:`.
- **Agent access:** idea list in priority order – (1) registry + put `AGENTS.md` rules in each consuming project's `CLAUDE.md`; (2) `davinci init` command that writes those rules and the CSS import; (3) `packages/mcp` (`@davinci-ai/mcp`, read-only MCP server over `components.json`/tokens/icons/rules); (4) hosted `components.json` + `llms.txt`.
- **Hosted Storybook** (manual GitHub Pages workflow) and a "page templates and examples" pointer in README/AGENTS.
- **Gaps vs Untitled UI date pickers:** range presets for `DateRangePicker`, a combined `DateTimePicker`, card-wrapped calendars.
- **Split out** `packages/examples` templates (and possibly the most project-specific composites: `MarketPulse`, `TickerTape`, `OrderTicket`) into separate packages if the library should stay lean.
- **Figma kit** not generated yet (inputs ready; Code Connect URLs are placeholders). Font Awesome Pro not installed (needs a token).
- Storybook cover (`apps/storybook/public/cover.html`, still loads Inter from Google Fonts) and DaVinci.AI branding of the Storybook chrome (`.storybook/manager.ts`) are done.

## New-machine setup
`corepack enable && pnpm install && pnpm build` (Node 22+). Recreate git-ignored secrets from `.npmrc.example` / `.env.example`. Run Storybook in a terminal: `pnpm storybook` (or `cd apps/storybook && npx storybook dev -p 6010`). Gates: `pnpm test:all`.
