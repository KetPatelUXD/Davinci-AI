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
