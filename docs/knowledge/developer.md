# DaVinci.AI – developer guide

For developers building product screens with `@davinci-ai/react`, and for those adding to the library. Rules here come from `CLAUDE.md`; where they differ, `CLAUDE.md` wins.

## 1. Set up

```tsx
import '@davinci-ai/react/styles.css';   // required
import '@davinci-ai/react/base.css';     // page reset (optional, used in INSTALL.md)
import '@davinci-ai/react/fonts.css';    // optional: self-hosted Inter
import { ThemeProvider } from '@davinci-ai/react';

<ThemeProvider canvas attachToRoot>{/* app */}</ThemeProvider>
```

- Wrap the app **once**. `attachToRoot` makes portalled overlays (menus, dialogs, toasts) follow the theme.
- Peers: React 18.2 or 19. Node 22+ for the repo.
- Tailwind users: `@import '@davinci-ai/react/tailwind';` after the tokens for `bg-surface`, `text-secondary`, `rounded-card`, `shadow-card`. Library internals use the `dv:` prefix.
- Icons are kebab-case Font Awesome names: `iconStart="plus"`, `<Icon name="chart-line" />`. A built-in 24px set (~75 names) works without Font Awesome Pro. Register Pro with `IconProvider`.
- Not yet on a registry: install a tarball (`npm install ./davinci-ai-react-0.1.0.tgz`) or `link:`. Pin the exact version.

## 2. Find things, don't guess

- **`node_modules/@davinci-ai/react/components.json`** lists every component: import, props with types, defaults and allowed values, variants, sizes, states, keyboard/ARIA notes, related components, CSS block and parts. Read it before writing UI.
- **Storybook** (`pnpm storybook`, port 6007 in this repo's dev setup) has a page per component with every variant, a matrix, states and interactions.
- **Tokens:** `tokens.json` (DTCG) or the typed `@davinci-ai/react/tokens`.

## 3. Rules (non-negotiable)

1. Compose library components. No page-level custom styling of library parts.
2. **Tokens only.** No hex, rgb, or px copied from a design. Use roles: `var(--dv-text-secondary)`, `bg-surface`, `rounded-card`. Never primitives (`--dv-p-*`).
3. Missing component? Add it to the library first, then use it. No lookalikes in the app.
4. WCAG 2.2 AA: every input has a label (visible or `aria-label`); icon-only controls use `IconButton` with `label`; colour is never the only signal (use icon, sign or text); never remove focus rings; never announce live price ticks (`PriceFlash announceThresholdPercent` only).
5. Semantic colour: `positive` up/long/success, `negative` down/short/error, `brand` focus/links/LEO. Don't flip red/green yourself: use `ThemeProvider direction="inverted"` or `colorBlindSafe`.
6. Density: dense data screens use `size="md"` (or `sm`), `density="compact"`, `Form layout="dense"`. Sparse forms use comfortable density, `Form layout="sparse"`, `size="lg"`. **One** `solid primary` button per view; `subtle` for secondary, `ghost` for tertiary. Primary CTA `size="xl"`. Buy/Sell use `intent="positive" | "negative"`.
7. Every screen must work in dark and light.
8. Progressive disclosure: put detail in `Disclosure`, `Popover`, `Drawer`, `Menu`, `ReasoningBlock`.
9. Numbers: right-aligned, tabular (`NumberText`, `numeric` table columns), locale `en-US` unless set via `ThemeProvider locale`. Signed changes use `PriceChange` or `DeltaPill`.
10. Fictional data only in examples and docs.
11. Naming: props are `variant`, `intent` (never `tone`), `size`, `orientation`, `isX` booleans. Name your own widgets `Widget/Header`, `Page/Sidebar`. Never target `dv-*` classes or `data-*` attributes from project CSS.

```tsx
// good
<Button iconStart="plus">New alert</Button>
<PriceChange percent={-0.86} />
<IconButton label="Refresh" icon="rotate-right" />

// bad: hard-coded colour, unlabeled icon button, colour-only signal
<button style={{ background: '#7c3aed' }}><Icon name="plus" /></button>
<span style={{ color: 'green' }}>1.42</span>
```

## 4. Component map

| Need | Use |
|---|---|
| Page frame | `AppShell`, `AppHeader`, `PageHeader`, `SideNav` |
| Surfaces | `Card`, `Panel`, `AccentTile` |
| Actions | `Button`, `IconButton`, `SegmentedControl`, `PillTabs`, `Menu`, `ToggleButton` |
| Forms | `Form`, `TextField`, `NumberField`, `PriceField`, `Select`, `ComboBox`, `DatePicker`, `Switch`, `Checkbox`, `RadioGroup` |
| Feedback | `useToast`, `Alert`, `Banner`, `Callout`, `Dialog`, `ConfirmDialog`, `Tooltip` |
| Data | `Table` (+ `AssetCell`, `RowActions`), `List`, `TreeView`, `DescriptionList` |
| Markets | `Stat`, `QuoteCard`, `PriceChart`, `Sparkline`, `DonutChart`, `Watchlist`, `OrderTicket`, `MarketPulse`, `TickerTape`, `NewsList` |
| AI | `ChatThread`, `ChatMessage`, `Composer`, `SuggestedPrompts`, `ReasoningBlock`, `ToolUseBlock`, `CitationChip`, `ArtifactPanel` |

## 5. Theming and customisation

- Modes and variants are attributes (`data-theme`, `data-density`, `data-direction`, `data-cvd`) set by `ThemeProvider`; CSS reads them. No JS styling.
- **Theme file (recommended):** `npx davinci theme --init` creates `davinci.theme.json` (brand, radius, density, fonts, optional per-mode colour overrides); `--validate` checks it; `--file` compiles it to CSS, or pass it as `<ThemeProvider themeConfig={theme}>`. `--from-figma` imports a Figma variables export. Full walkthrough: Storybook → Guides → Theming → *Change the theme step by step* (`docs/theming-guide.md`).
- **Brand colour:** `npx davinci theme --primary "#0f766e"` writes an override CSS file (import it after `styles.css`) that keeps contrast rules. Or override only `--dv-brand`, `--dv-brand-fill`, `--dv-wash-brand`, `--dv-focus`, `--dv-focus-halo`.
- **Safe:** compose with documented props; style your own wrapper (layout and spacing only); use `var(--dv-*)` tokens.
- **Unsafe (breaks on update):** targeting `.dv-*` or `data-*`, per-widget token overrides, copied markup or CSS, hard-coded colours.
- Whole-brand changes go through the theme command or global token overrides. Storybook: Guides → Extending the library.

## 6. Working in the library repo

```
corepack enable && pnpm install && pnpm build   # Node 22+
pnpm storybook                                    # or: cd apps/storybook && npx storybook dev -p 6010
pnpm lint && pnpm test                            # fast gates
pnpm test:all                                     # everything (typecheck, lint, tests, builds, Storybook dark+light, visual)
```

Layout: `packages/tokens`, `packages/davinci-ai/src/{components,styles,foundations}`, `packages/examples` (page templates), `apps/storybook`, `apps/playground` (private).

**Tokens:** edit tables in `packages/tokens/scripts/seed.mjs`, then `pnpm --filter @davinci-ai/tokens seed && pnpm tokens`. Never hand-edit `tokens.json` or `src/generated`.

### Adding a component (checklist)
1. Component in `src/components/<category>/` on React Aria, typed props with JSDoc (`@when`, `@whenNot`).
2. CSS in `src/styles/*.css`, tokens only. Block `dv-{kebab-name}`, parts `dv-{block}__{part}` (flat, hyphenated), modifiers as data attributes mirroring props.
3. Manifest entry in `packages/davinci-ai/scripts/components.config.mjs`: category, keyboard/ARIA notes, states, anatomy with token names. Part names must equal the real CSS parts (DOM-only helpers go in `domParts`).
4. Story: add usage to `scripts/stories.spec.mjs`, then `pnpm gen:stories` (never edit generated `*.stories.tsx`).
5. axe test in `src/test/components.test.tsx`.
6. Export in `src/index.ts`.
7. `pnpm changeset`.
8. Run `pnpm lint && pnpm test`. Check the story in dark and light.

Gotchas:
- React Aria collections (`TabList`, etc.) accept only their item children. Put other elements (like a sliding thumb) outside them.
- A flex child with percentage height and no definite parent height collapses to 0. Use an absolutely positioned child with `inset: 0`.
- Always render the component in Storybook before relying on it. Figma and docs are generated from what renders.

## 7. Verify

- Run your app's axe checks in dark and light.
- The library's CI fails on contrast regressions (tokens), axe violations and visual diffs of the Markets dashboard.

## 8. Naming quick reference

Components PascalCase and singular. Part layer in Figma = PascalCase part, class = kebab-case (`SegmentedControl/Thumb` → `.dv-segmented-control__thumb`). Interaction state attributes use React Aria names (`data-selected`, `data-focus-visible`…). Full rules: `docs/naming-convention.md`, enforced by `pnpm check:naming`.
