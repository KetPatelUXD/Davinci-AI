# Build DaVinci.AI — an agent-ready React design system for financial services

You are a senior design-system engineer. Build **DaVinci.AI**, a production-quality, accessible, themeable React component library for dense financial, analytics, commodities-pricing and trading applications, plus its Storybook and a private playground. Work autonomously through the whole build in one pass (see **Build order**). Keep a running `PROGRESS.md` so the work can be resumed if interrupted. Do not stop to ask questions — where something is unspecified, choose the option that best fits the principles below and record the decision in `DECISIONS.md`.

## 0. Visual reference — match it as closely as possible

The file **`reference/davinci-ai-reference.html`** (the "Graphite" preview, supplied alongside this prompt — copy it into `reference/` in the repo) is the **visual source of truth**. The library must reproduce its look and feel **as faithfully as possible**: surfaces, lighting, radii, type weights, spacing, pill navigation, white selection states, monochrome charts, motion and the two-row Ask LEO composer.

- Open it, study the CSS custom properties at the top, and lift values from it. Where this prompt and the reference disagree on a visual detail, **the reference wins**; where they disagree on accessibility, **accessibility wins** and the decision is logged in `DECISIONS.md`.
- Build a Storybook example page **"Markets dashboard"** that recreates the reference screen using only library components. Add a Playwright test that screenshots both at 1512×982 (dark and light) and reports a visual diff; iterate on tokens/components until they are visually indistinguishable at normal viewing distance.
- The style is called **Graphite**: near-black, neutral (no blue, violet or brown tint), lit from the top-left, borderless cards, white as the selection colour, colour reserved for meaning.

---

## 1. Principles (non-negotiable)

1. **Accessible by design — WCAG 2.2 AA minimum.** Keyboard operable, visible focus, screen-reader correct, contrast verified in both themes. Accessibility is never traded for aesthetics.
2. **Dark-first.** Dark is the default and primary experience; light is a full equal, tuned with its own colour equivalents (never a compromise of dark).
3. **Dense, calm, minimal.** Built for rich, data-dense screens. Elements stay quiet to avoid cognitive overload; colour is reserved for meaning (brand actions, long/short, status).
4. **Progressive disclosure.** Show the essential first; reveal detail on demand (disclosures, collapsible reasoning, popovers, drawers, "more" menus).
5. **Agent ready.** Predictable names, typed and documented props, a machine-readable component manifest and agent rules, so code assistants build with DaVinci.AI correctly first time.
6. **Portable.** One standalone package used across many React projects; no global side effects; themeable per project without forking.
7. **Contemporary and slick — Graphite.** Minimal monochrome: near-black canvas, soft light from the top-left and a faint diagonal beam, borderless cards with a lit-corner sheen, generous rounding, pill navigation, white "selected" states, thin large numerals, monochrome charts. Violet is a brand accent (focus, LEO, links), not a surface colour. Never at the expense of legibility or accessibility.

---

## 2. Repository and tooling

- **pnpm monorepo** (Node 22 LTS, pnpm workspaces), TypeScript strict throughout.
  - `packages/davinci-ai` → the published library, package name **`@davinci-ai/react`** (scope must be configurable in one place so it can move to a corporate org later).
  - `apps/storybook` → documentation (Storybook 9, React + Vite).
  - `apps/playground` → **private** Vite app for mockups (`"private": true`; never published, never deployed).
  - `packages/tokens` (or `packages/davinci-ai/tokens`) → token source and build.
- **Library build:** Vite library mode, ESM output, `sideEffects` configured so consumers tree-shake, `.d.ts` emitted, CSS emitted separately.
- **Peer dependencies:** `react` and `react-dom` (support 18 and 19), `@fortawesome/*` (see Icons). No Ant Design, no other UI framework.
- **Foundations:** **React Aria Components** (Adobe) for behaviour and accessibility; **Tailwind CSS v4** for styling; **Motion** (`motion`) for animation; `clsx` + `tailwind-variants` (or equivalent) for variant APIs.
- **Testing:** Vitest + Testing Library, `vitest-axe` / axe-core, Storybook test runner with `@storybook/addon-a11y`, Playwright screenshot tests (dark + light) of key stories.
- **Quality:** ESLint (incl. `jsx-a11y`), Prettier, `tsc --noEmit` in CI.
- **Versioning/publishing:** Changesets. GitHub Actions: on PR run typecheck, lint, unit + a11y tests, Storybook build, screenshot tests. Publishing workflow exists but is **disabled/manual** until the repo moves to the corporate org. Registry configurable (npm or GitHub Packages). Storybook deploy to GitHub Pages workflow (manual trigger).
- **Repo:** name `davinci-ai`, private, no open-source licence ("All rights reserved") for now. CI must read owner/scope from env or config — nothing hard-coded to a personal account.
- **Secrets:** Font Awesome Pro token and any registry tokens live only in git-ignored `.npmrc`/`.env` locally and in GitHub Actions secrets. Provide `.npmrc.example` and `.env.example`.
- **Browsers:** latest Chrome, Edge, Safari, Firefox.

---

## 3. Design tokens

**Source of truth:** a single W3C Design Tokens (DTCG) `tokens.json`. A build step (Style Dictionary or a small custom script) generates:
- Tailwind v4 `@theme` CSS variables + a Tailwind preset for consumers who use Tailwind,
- precompiled CSS for consumers who don't,
- typed TS exports,
- entries in the agent manifest.

**Three layers:**
1. **Primitive** — the full Tailwind default palette (every hue 50–950) with Tailwind names, plus `brand-50…950` (violet) and the custom DaVinci neutral ramp below; Tailwind spacing, type, radius, shadow, blur scales.
2. **Semantic (role)** — what components use: `bg-*`, `surface-*`, `text-*`, `border-*`, `brand*`, `positive*`, `negative*`, `warning*`, `info*`, `focus`, `glass-*`, `wash-*`. Defined per mode under `[data-theme="dark"]` / `[data-theme="light"]`. **Components never reference primitives directly.**
3. **Component** — a small set of per-component tokens (e.g. `button-radius-md`, `input-height-md`, `grid-header-bg`, `grid-row-hover`, `grid-border`) for fine-tuning.

Naming follows Tailwind conventions so utilities read naturally: `bg-surface`, `bg-raised`, `text-secondary`, `text-positive`, `border-subtle`, `rounded-control`, `shadow-raised`.

### 3.1 Dark mode (default) — Graphite
Neutrals are **pure neutral greys** (equal R/G/B ± 2) — no blue, violet or brown cast.

| Role | Value |
|---|---|
| `bg` (app canvas) | `#060607` |
| `bg-elevated` (alt canvas) | `#0B0B0D` |
| `surface` (solid fallback for cards) | `#131315` |
| `raised` (popovers, solid overlays) | `#1A1A1D` |
| `well` (sunken wells) | `#0E0E10` |
| `hover` | `#222226` |
| `card` (card fill — gradient) | `linear-gradient(158deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,.03) 34%, rgba(255,255,255,.014) 100%)` |
| `panel` (nested panels, pill bars, table header) | `linear-gradient(170deg, rgba(255,255,255,.05), rgba(255,255,255,.02))` |
| `field` (input / chip fill) | `rgba(255,255,255,.045)` |
| `line` (decorative dividers, inset edges) | `rgba(255,255,255,.06)` |
| `line-strong` (stronger decorative edge) | `rgba(255,255,255,.09)` |
| `border-strong` (control borders on focus/hover — must be ≥3:1) | `#6B6B73` |
| `shadow-card` | `0 40px 80px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.06)` |
| `on` / `on-text` (selected pill, primary neutral button) | `#F4F4F6` / `#0E0E10` |
| `focus` ring | `#A78BFA` (2px + 2px offset) |
| `text` / `text-secondary` / `text-muted` | `#F5F5F6` / `#ABABB3` / `#94949C` |
| `brand` / `brand-fill` | `#A78BFA` / `#7C3AED` |
| `positive` / `positive-fill` / `wash-positive` | `#34D399` / `#05875F` / `rgba(52,211,153,.12)` |
| `negative` / `negative-fill` / `wash-negative` | `#FB7185` / `#DB2777` / `rgba(251,113,133,.12)` |
| `data-1` / `data-2` / `data-3` (categorical data viz) | teal `#22A3B8` / orange `#F5873A` / grey `#3A3A40` (track) |
| `chart-line` / `chart-band` / `chart-grid` / `chart-dots` | `#FFFFFF` / `rgba(255,255,255,.07)` / `rgba(255,255,255,.05)` / `rgba(255,255,255,.07)` |
| `ambient-glow` / `ambient-beam` | `rgba(255,255,255,.07)` / `rgba(255,255,255,.055)` |
| `spotlight-edge` / `spotlight-fill` | `rgba(255,255,255,.42)` / `rgba(255,255,255,.03)` |

`text-muted` was lifted to `#94949C` so it stays ≥4.5:1 on the brightest lit corner of a card while the hover spotlight is on — keep it there.

### 3.2 Light mode
Soft grey canvas, white cards with a barely-there sheen. Selection inverts to **ink** (`on` = near-black, white text). Colours are tuned equivalents, not copies of dark.

| Role | Value |
|---|---|
| `bg` / `bg-elevated` | `#ECECEE` / `#F2F2F4` |
| `surface` / `raised` / `well` / `hover` | `#FAFAFB` / `#FFFFFF` / `#F1F1F3` / `#EBEBEE` |
| `card` | `linear-gradient(158deg, #FFFFFF 0%, #FBFBFC 50%, #F7F7F8 100%)` |
| `panel` / `field` | `linear-gradient(170deg, #F6F6F8, #F2F2F4)` / `#F0F0F2` |
| `line` / `line-strong` / `border-strong` | `rgba(24,24,27,.07)` / `rgba(24,24,27,.1)` / `#8A8A94` |
| `shadow-card` | `0 30px 60px -30px rgba(24,24,27,.25), inset 0 1px 0 #FFFFFF` |
| `on` / `on-text` | `#18181B` / `#FFFFFF` |
| `text` / `text-secondary` / `text-muted` | `#18181B` / `#52525B` / `#6B6B74` |
| `brand` / `brand-fill` | `#7C3AED` |
| `positive` (text) / `positive-fill` | `#047857` / `#05875F` |
| `negative` (text) / `negative-fill` | `#BE185D` / `#DB2777` |
| `data-1` / `data-2` / `data-3` | `#0E7C8E` / `#E06A16` / `#D4D4D8` |
| `chart-line` | `#18181B` |
| washes | ~9–10% alpha of the 600-level colours |

Also provide `warning` (amber) and `info` (sky) semantic sets in both modes following the same text/fill/wash pattern.

### 3.3 Opacity rules
- **Allowed** for: card/panel sheen gradients, glass fills, decorative edges (`line`), washes (hover/selected/price-flash), shadows, ambient light.
- **Not allowed** for: text, icons, control borders, focus rings, disabled states. These use **solid** tokens (provide dedicated `*-disabled` tokens instead of fading elements).
- **Input boundaries (WCAG 1.4.11):** the reference draws text inputs/selects with only a faint translucent edge. In the library, text inputs, selects and number fields must have a resting 1px border of `border-strong` (≥3:1 against the card) — keep it visually quiet (it is the only deviation from the reference). Buttons and pills identified by their label do not need a ≥3:1 outline.
- Every translucent value is still a **named token**. Add a lint/test that fails if text or control borders use translucent colours.

### 3.4 Contrast verification (automated)
Write a test that checks every text/icon token against every surface it can sit on (`bg`, `surface`, `raised`, `hover`, `well`, and the **composited** `card`/`panel` gradients over `bg` — test the brightest point, i.e. the lit top-left corner with the spotlight on) in both modes: body text ≥ 4.5:1, large text/icons ≥ 3:1, control borders and focus ≥ 3:1 against adjacent colours, white labels on every `*-fill` ≥ 4.5:1. Fail the build on regressions.

### 3.5 Typography
- **Inter** for UI (self-hosted via `@fontsource-variable/inter`, opt-in import so it doesn't leak into host apps). Numbers always use **tabular figures** (`font-variant-numeric: tabular-nums`); provide a `Mono` value style.
- Scale: 11 (overline), 12 (small), **13 (base, dense)**, 14 (comfortable / sparse forms), 16, 20, 24, 32, plus display numerals 42 / 48 / 64. Weights 300/400/500/600.
- **Display numerals** (KPI and hero prices, donut centre) use **weight 300**, letter-spacing −0.035em, line-height 1, with the unit as a small 400-weight muted suffix — this thin large figure is a signature of the style.
- **Card titles** are 16/400 in `text-secondary` (quiet), section headings 15/600, page title 20/600 with a 13/400 secondary subtitle.

### 3.6 Radius (generous; pills for navigation and buttons)
This supersedes the earlier "never pill buttons" rule — the reference uses pills.
- **Full (pill):** buttons, icon buttons (circles), tabs, segmented controls, chips/delta pills, switches, search fields, the order-ticket header row, avatars, user chip.
- Inputs and selects: **14px**. Composer: **26px**.
- Cards: **26px**. Nested panels: **20px**. Tiles: **16px**. Tooltips: **12px**. Inline code chips: **7px**. Menus/popovers: 16px; dialogs: 26px.

### 3.7 Sizes
Comfortable (default for Graphite, matches the reference):

| | sm | md (default) | lg | xl (primary CTA) |
|---|---|---|---|---|
| Height (buttons, selects, segmented, search) | 30 | 38 | 44 | 48 |
| Input height | 36 | 44 | 48 | — |
| Font | 12/500 | 12.5–13/500 | 14/500 | 14/600 |
| Padding X | 12 | 16 | 18 | 24 |
| Icon | 14 | 16 | 16 | 18 |
| Icon gap | 6 | 8 | 8 | 8 |
| Icon-only circle button | 30 | 38 | 42 | — |

Compact density (dense data screens) maps sm/md/lg to **24 / 32 / 40** heights with 8/12/16 padding. Table rows: 64px comfortable (two-line cells), 40px compact.
Nothing interactive is smaller than 24×24 (WCAG 2.5.8).

### 3.8 Density
A `DensityProvider` / `data-density="compact|comfortable"` on any container. Compact = table above; comfortable adds +4px height to each size and more padding. Dense forms use compact; occasional sparse forms use comfortable + lg.

### 3.9 Surfaces, light and glass (Graphite)
- **Card:** `card` gradient fill + `shadow-card`, **no border at rest**, radius 26. Content padding 22×24.
- **Spotlight (default hover treatment):** on pointer move the card gets a 1px edge that is lit only near the cursor — a `radial-gradient(380px circle at var(--mx) var(--my), spotlight-edge, transparent 45%)` masked to a 1px ring (`mask-composite: exclude`) — plus a very soft inner `spotlight-fill` glow. Fades in over 350ms on hover **and** `:focus-within`. Provide this as a reusable `useSpotlight` hook + CSS.
- **Panel:** nested surface inside a card (`panel` fill + 1px inset `line`, radius 20). Used for grouped form controls, pill bars, table header row.
- **Field:** inputs/chips use `field` fill + 1px inset `line`; on focus: inset 1px `border-strong` + 3px violet focus halo.
- **AppBackground (Graphite):** `bg` canvas + a large soft radial `ambient-glow` top-left + one blurred diagonal `ambient-beam` (rotated ≈ −28°) drifting very slowly (18s alternate; static under reduced motion). Optional `dot-grid` utility (`chart-dots`, 16px) for chart canvases.
- **Glass (floating only):** composer, suggestion chips, sticky bars, toasts: `rgba(18,18,20,.84)` dark / `rgba(255,255,255,.9)` light, `backdrop-filter: blur(24px) saturate(140%)`, inset 1px `line-strong`, deep shadow. Opaque enough that content scrolling underneath never shows through legibly.
- `prefers-reduced-transparency: reduce` → cards become solid `surface`, glass becomes solid `raised`.

### 3.10 Card borders
Theme setting `card-border: "spotlight" | "none" | "1px"`. **Default: `spotlight`** (borderless at rest, cursor-lit edge on hover/focus). `1px` = constant 1px `line` edge. All borders are exactly 1px.

### 3.11 Motion
Durations: 120 / 160 / 200ms; easing `cubic-bezier(.3,.7,.4,1)`; springs subtle. Use motion to clarify state (press scale .985, popover/menu fade+scale, drawer slide, toggle thumb, row hover, price flash). Signature motions from the reference: cards rise in (12px, 700ms, staggered 40ms); segmented/tab thumb slides between options (300ms); chart line draws in (1.6s); donut arcs sweep in; display numerals count up (1.2s ease-out); switch thumb slides. **All motion respects `prefers-reduced-motion`** (fall back to instant or opacity-only). The only looping animation allowed is the slow ambient beam drift, which stops under reduced motion.

---

## 4. Theming and portability

- `ThemeProvider` sets `data-theme` (`dark` default / `light` / custom) and `data-style` (`graphite` default; leave the hook so other styles can be added later) and density; supports nested themes.
- **Per-project theming without forking:** a CLI `npx davinci theme` (prompt-to-theme) interactively asks for primary colour (presets + custom hex), density (small/medium/large), radius feel, default mode, then writes a project theme file (tokens override + CSS). Must also accept a free-text brand description and generate a proposal.
- Ship: `@davinci-ai/react` (components), `@davinci-ai/react/styles.css` (precompiled), `@davinci-ai/react/tailwind` (preset / `@theme` import), `@davinci-ai/react/tokens` (JSON + TS).
- Tailwind classes inside the library use a **prefix (e.g. `dv:`)** so they never clash with host app utilities.
- No global resets or font injection unless the consumer opts in (`@davinci-ai/react/base.css`, `@davinci-ai/react/fonts.css`).
- SSR-safe (Next.js App Router compatible; add `"use client"` where required).
- Locale configurable; **default `en-US`** for numbers, currency and dates (use `Intl` / React Aria i18n). Positive/negative colour mapping is configurable (`direction: "standard" | "inverted"`) for markets where red means up; default standard. A colour-blind-safe theme (blue/orange long/short) is provided as an option.

---

## 5. Icons

- **Font Awesome Pro 7, Light** style by default, installed from the Font Awesome private registry using a token (never committed).
- Font Awesome is a **peer dependency**; components receive icons through a small `Icon` adapter (`<Icon name="chart-line" />` by kebab-case name — matching the Figma kit — or `<Icon icon={faChartLine} />`, with an `IconProvider` mapping) so a project can swap icon sets without touching components.
- Decorative icons are `aria-hidden`; icon-only buttons **require** an accessible label (enforced in TypeScript and tests).
- The ▲/▼ indicators are rendered as icons/SVG (not system glyphs).
- Include the DaVinci.AI logo mark as an SVG asset/component (`<DaVinciLogo />`, mark + wordmark): a rounded square and circle sharing a base (Vitruvian proportion) with a four-point AI spark at the centre, stroked with a cyan `#3CCBF4` → violet `#A78BFA` → amber `#FFA24C` gradient.

---

## 6. Component inventory

Use **Untitled UI's component inventory as a completeness checklist and quality bar** (do not copy its code or assets). Every component: React Aria based where applicable, typed props with JSDoc, `size` (sm/md/lg) where relevant, density-aware, dark/light, all states (**default, hover, active/pressed, focus-visible, selected, disabled, read-only, invalid/error, loading, empty**), responsive, Storybook stories for every variant and state, unit + axe tests.

### Foundations
Tokens, `ThemeProvider`, `DensityProvider`, `AppBackground`, `Icon`/`IconProvider`, `DaVinciLogo`, typography components (`Heading`, `Text`, `Label`, `NumberText`/`Mono`), `VisuallyHidden`, `FocusRing`.

### Primitives — actions and inputs
- `Button` — pill. Variants: **solid**, **subtle** (`panel` fill + inset `line`, e.g. "Filters"), **ghost**; intents: **primary = `on`** (white in dark / ink in light, e.g. "New alert"), brand (violet), positive (Buy/Long, `positive-fill` with soft coloured glow shadow), negative (Sell/Short), destructive; sizes sm/md/lg/xl; loading; icon start/end.
- `IconButton` (circle; subtle and ghost), `ButtonGroup`, `Link`, `ToggleButton`.
- `SegmentedControl` / `PillTabs` — pill track (`panel`), selected option is a **sliding `on` thumb** with `on-text` label. Used for time ranges, view switches and the order side toggle (`SideToggle`, with a small positive/negative dot before each label).
- `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch` (46×26 track, `on`-coloured thumb when checked), `SwitchRow` (pill row: label, hint, switch).
- `TextField`, `TextArea`, `SearchField`, `NumberField` (locale formatting, steppers, min/max/step, keyboard increment), `PriceField` (precision, tick size), `PasswordField`.
- `Select`, `ComboBox`/Autocomplete, `MultiSelect` (tags).
- `DatePicker`, `DateRangePicker`, `TimeField`, `Calendar`.
- `Slider`, `RangeSlider`.
- `FileUpload` (drop zone + list).
- `FormField` wrapper (label, description/hint, error, required, optional), `Fieldset`, `Form` with dense and sparse layouts.

### Display
`Badge`, `Tag`/`Chip` (removable), `DeltaPill` (pill: coloured signed value + muted context text + small circled arrow, e.g. "+1.42% vs yesterday ↑"), `CodeChip` (inline 7px-radius chip for symbols/codes and highlighted words in text), `Avatar`/`AvatarGroup`, `Kbd`, `Divider`, `Tooltip`, `Skeleton`, `Spinner`, `ProgressBar`, `ProgressCircle`, `Meter`, `EmptyState`, `Callout`.

### Navigation
`AppHeader` (logo tile + wordmark left, **centred `PillTabs` nav** with `on` active tab, circle icon buttons and `UserChip` right), `PageHeader` (title + subtitle left; Filters / date-range / primary / refresh actions right), `UserChip`, `SideNav` (optional, collapsible icon rail), `Tabs`, `Breadcrumbs`, `Pagination`, `Stepper`, `Menu`/`Dropdown`, `ContextMenu`, `CommandPalette` (⌘K / Ctrl+K).

### Overlays and feedback
`Dialog`, `ConfirmDialog`, `Drawer`/`Sheet`, `Popover`, `Toast` (queue, polite live region), `Alert`/`Banner`, `InlineMessage`. Floating surfaces use glass by default.

### Layout
`AppShell`, `Panel` (nested), `Card` (Graphite gradient, spotlight, border mode, `title` slot styled as quiet card title), `AccentTile` (tile with 3px coloured left accent bar), `Stack`, `Grid`, `Toolbar`, `SplitPane` (resizable, keyboard accessible), `ScrollArea`, `Accordion`, `Disclosure`, `CollapsibleSection`.

### Data
- `Table` — styled exactly like the reference: toolbar row (view `SegmentedControl` left, pill `SearchField` + filter circle right), header row on `panel` fill with 12px muted labels and sort glyphs, two-line primary cells (icon in a 38px circular well, name 13.5/500 + muted category), `CodeChip` column, right-aligned tabular numbers, `PriceChange` column, day-range marker, monochrome `Sparkline`, kebab `Actions` menu, 1px `line` row dividers, soft row hover. Also: sortable columns, sticky header, optional row selection, hover rows, optional zebra, compact/comfortable density, right-aligned tabular numbers, positive/negative cell formatting, empty/loading states, keyboard navigation (React Aria `Table`). **No AG Grid in v1**, but name grid tokens (`grid-header-bg`, `grid-row-hover`, `grid-border`, `grid-cell-padding-*`, `grid-font-size`) so an AG Grid theme can be generated from the same tokens later.
- `List`, `TreeView`, `DescriptionList` (key–value).

### Finance composites
- `PriceChange` — value + ▲/▼ + sign + `positive`/`negative` colour (**never colour alone**), optional percent; accessible label ("Up 1.42 percent").
- `PriceFlash` behaviour — brief wash highlight when a value ticks up/down (≈600ms), respects reduced motion, does not announce every tick to screen readers.
- `Stat` / KPI card — quiet title, `Sparkline` (with highlight band + ring markers), display numeral (weight 300) and `DeltaPill`; sizes; stacks two-high beside a hero.
- `Sparkline` — lightweight custom SVG. **Default monochrome** (`chart-line`) with a fade-in start, optional dashed baseline, optional **highlight band** (vertical `chart-band` gradient) and **ring markers**; optional positive/negative colouring. Accessible summary text.
- `PriceChart` (hero) — custom SVG line/area: monochrome line with soft glow, faint area fill, dashed grid with right-aligned axis labels, date labels, dot-grid canvas, static highlight band with ring markers, hover crosshair band + ring + `on`-coloured tooltip pill; line draws in. Keyboard: arrow keys move the crosshair; summary for screen readers.
- `DonutChart` — custom SVG ring (≤6 segments, rounded caps, small gaps, `data-*` colours), centre display numeral + label, `Legend` rows (dot, label, count, %). Accessible table fallback.
- **Markers must be perfectly round at any size:** never draw circles inside an SVG that uses `preserveAspectRatio="none"` — render markers as absolutely positioned HTML elements (or in a separate non-stretched SVG layer) positioned by percentage.
- **No chart library in v1** — these are small custom SVG components.
- `PriceList` / `Watchlist` + `WatchlistRow` — symbol, name, last, change, %, trend sparkline; selectable; dense.
- `NewsList` + `NewsItem` — time, headline, source/tags, unread state, progressive disclosure of summary.
- `OrderTicket` — `SwitchRow` header (title + GTC switch), nested `Panel` holding `SideToggle`, order-type `Select`, quantity and limit `NumberField`s side by side, then notional/fees summary rows and an xl pill CTA whose intent follows the side (positive/negative fill, label "Place buy order" / "Place sell order").
- `MarketPulse` — grid of `AccentTile`s (name + signed change, accent bar coloured by direction) with a `DeltaPill` summary.
- `QuoteCard`, `TimeRangeSelector` (1D/1W/1M/YTD/1Y/custom), `FilterBar` (chips + saved views), `ChartPanel` shell (header, range selector, legend slot, chart slot), `TickerTape` (pausable, reduced-motion safe).

### Chat / AI (mirror Claude's interaction patterns, styled entirely in DaVinci.AI tokens — no third-party branding)
- `ChatThread` — centred readable column, scroll-to-bottom button, polite live announcements (not the whole stream).
- `ChatMessage` — **user**: subtle rounded bubble, right-aligned, editable/re-send; **assistant**: no bubble, full-width rich text (headings, lists, tables, code blocks with copy).
- `StreamingText` — progressive rendering, cursor that respects reduced motion.
- `MessageActions` — copy, retry, thumbs up/down; visible on hover **and** focus.
- `Composer` — **two rows**, radius 26, floating glass (as in the reference): **row 1** = LEO mark + auto-growing multiline input; **row 2** = actions: `+` attach, tools/settings, removable **context chip** (e.g. "NSC1 · in context"), spacer, mode selector ("LEO · Markets ▾"), `⌘L` `Kbd` hint, round `on`-coloured send button (↔ stop while streaming). Enter sends, Shift+Enter newline; ⌘/Ctrl+L focuses it; focus returns after send; focus-within strengthens the edge to `border-strong`. `SuggestedPrompts` chips float above it and appear when the composer is focused.
- `SuggestedPrompts` (chips on empty state), `ReasoningBlock` / `ToolUseBlock` (collapsed one-line summary, expandable — progressive disclosure), `CitationChip` (inline numbered source), `ArtifactPanel` (side panel for larger outputs).

### Storybook example pages (playground and docs only, never published)
**Markets dashboard (pixel-match of the reference)**, watchlist page, dense order-style form, sparse settings form, news page, chat panel (Ask LEO), all in dark and light.

**Sample data:** realistic but clearly **fictional** commodity data (e.g. "North Sea Crude M1", "Gulf Coast Diesel", "Continental Gas M1", "Capesize 5TC", "Aluminium 3M"), labelled as fictional in the UI. No real assessment names, prices or brands.

---

## 7. Accessibility requirements (enforced)

- WCAG 2.2 AA across all components, both themes, both styles, both densities.
- Full keyboard support with visible `:focus-visible` rings (2px `focus` + offset) — never removed.
- Correct roles/names/states via React Aria; labels required for all inputs and icon-only controls.
- Contrast tests (section 3.4); axe in unit tests and Storybook; no violations allowed in CI.
- Long/short, status and validation always pair colour with icon/sign/text.
- Live data: price changes are not announced per tick; provide an opt-in "announce significant changes" API.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more` (strengthen borders/text), forced-colors mode.
- Target size ≥ 24×24.
- Document accessibility notes (keyboard map, ARIA) on each component's docs page.

---

## 8. Agent readiness

- Consistent, descriptive names (`PriceChange`, not `Delta`); props documented with JSDoc including when to use / when not to use.
- Generate **`components.json`** at build time: every component, its import path, props (types, defaults, allowed values), variants, sizes, states, accessibility notes, and related components.
- Ship **`AGENTS.md`** and **`CLAUDE.md`** in the package and repo root with rules for consuming projects: use library components only — no page-level custom styling; tokens only — never hard-coded values; create missing components in the library first; meet WCAG AA; use semantic colour roles; follow size/density conventions.
- `tokens.json` (DTCG) and its TS types are part of the public API.
- Storybook autodocs generated from the same types.

---

## 8a. Figma parity — make the library ready to generate a 1:1 Figma kit

Later, a Figma kit (variables, styles and components) will be generated **from this repo** into a blank Figma file via the Figma MCP. Bake in the following now so that generation is mechanical and lossless:

1. **Figma-ready tokens.** In `tokens.json`, every token carries `$extensions["com.figma"]` with:
   - `collection` — `Primitives` (no modes), `Semantic` (modes `Dark`, `Light`), `Component` (aliases to Semantic);
   - `scopes` — the Figma variable scopes it applies to (e.g. `FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR`, `GAP`, `CORNER_RADIUS`, `WIDTH_HEIGHT`, `FONT_SIZE`, `OPACITY`);
   - `codeSyntax.WEB` — the exact CSS variable (e.g. `var(--dv-text-muted)`) so Dev Mode shows the real token.
   Semantic tokens must be **aliases** of primitives, not raw values, so Figma keeps the alias chain. Names use `/` grouping that maps to Figma folders (`text/muted`, `surface/raised`, `radius/control-md`).
2. **Values Figma variables can't hold** (gradients, multi-layer shadows, blur, typography) are flagged `"figmaType": "paintStyle" | "effectStyle" | "textStyle"` and exported as styles: `card`, `panel` sheens → paint styles (one per mode); `shadow-card`, glass blur → effect styles; the full type scale (incl. 300-weight display numerals) → text styles bound to font-size/line-height variables.
3. **Build script `pnpm tokens:figma`** that writes `dist/figma/variables.json` and `dist/figma/styles.json` in a flat, documented shape (collection → mode → name → value/alias, scopes, codeSyntax, description).
4. **Component manifest written for Figma.** `components.json` must include, per component:
   - `figma.properties` — every visual prop as a Figma component property with **identical names and values** to the React props: `VARIANT` (size, variant, intent, state), `BOOLEAN` (e.g. `hasIconStart`), `TEXT` (label), `INSTANCE_SWAP` (icon). Behaviour-only props (`onPress`, `value`) are excluded.
   - `states` to render as variants: default, hover, pressed, focus-visible, selected, disabled, invalid, loading (as applicable).
   - `anatomy` — the layer tree with auto-layout direction, padding, gap, radius, fill, stroke and text style **expressed as token names** per size (so every Figma layer can be bound to variables, no raw numbers).
   - `composedOf` — which library components a composite uses (so the kit builds composites from instances of primitives, never detached copies).
5. **Icons by name, not SVG.** In Figma, icons are **live Font Awesome text, not vectors**, so designers swap an icon by typing its name. Define one `Icon` component in the kit: a single text layer set in **Font Awesome 7 Pro** (desktop font, which renders icon names as ligatures, e.g. typing `chart-line` shows the glyph), exposed as a `TEXT` component property **`name`**, plus a `VARIANT` **`style`** (`light` default, `regular`, `solid`) mapped to the font style and a **`size`** variant bound to the icon-size variables (12/14/16/18). Its colour is bound to text/icon colour variables. Every component with an icon nests this `Icon` instance and surfaces its name as a property (e.g. `iconStart`, `iconEnd`) so it can be changed from the parent. In code, the `Icon` adapter must accept the **same kebab-case name** (`<Icon name="chart-line" />`, resolved through a registered icon map, alongside the `icon={faChartLine}` object form) so names in Figma and React are identical. Write `assets/icons/manifest.json` listing every icon name the library uses (with its default style) for validation. Only the DaVinci.AI logo set ships as SVG.
6. **Visual ground truth.** Every story has a stable ID and a Playwright screenshot per variant/state/mode in `dist/screens/`, used to compare the Figma components against code renders.
7. **Code Connect scaffold.** Add `@figma/code-connect` with a `figma.connect()` file per component (props mapped from the manifest) and `FIGMA_NODE_URL` placeholders, so once the kit exists its node IDs can be filled in and published — Dev Mode then shows real `@davinci-ai/react` code.
8. **Kit structure doc** (`docs/figma-kit.md`): page order (Cover, Foundations — colour, type, spacing, radius, elevation; Components by category matching section 6; Patterns; Examples incl. the Markets dashboard), naming rules (`Category/Component`), and the sync rule: **code is the source of truth**; token or component changes are re-synced to Figma, never the reverse.

Prerequisite: every designer (and the machine running the kit generation) needs the Font Awesome 7 Pro desktop fonts installed, or uploaded as shared organisation fonts in Figma; otherwise icon layers fall back to plain text. Known limits to document (not to solve): the cursor spotlight, motion, count-ups and live data are code-only (Figma shows the static hover state); chart components are static vector examples in Figma.

## 9. Build order (single pass) and definition of done

Work in this order, updating `PROGRESS.md` after each step:
1. Monorepo, tooling, CI skeleton, `.npmrc.example`, env handling.
2. Tokens (`tokens.json`) + build pipeline + contrast tests.
3. `ThemeProvider`, `DensityProvider`, card/panel/spotlight/glass/motion utilities, `AppBackground` (Graphite glow + beam), `Icon` adapter, logo, typography.
4. Primitives (actions and inputs), then display.
5. Navigation, overlays/feedback, layout.
6. Data (`Table`, lists).
7. Finance composites and the custom SVG charts (`Sparkline`, `PriceChart`, `DonutChart`).
8. Chat/AI components.
9. Storybook docs (foundations pages: colour, type, spacing, radius, elevation/glass, motion, accessibility, theming, density), example pages, playground.
10. `components.json` (with Figma properties and anatomy), `pnpm tokens:figma`, icon-name manifest, Code Connect scaffold, `docs/figma-kit.md`, `AGENTS.md`, `CLAUDE.md`, README (install, theming, Tailwind and non-Tailwind usage, Font Awesome setup, moving the scope/org), CHANGELOG via Changesets.
11. `npx davinci theme` CLI.

**Definition of done** — before finishing, run and fix until all pass:
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (unit + axe + contrast), `pnpm build` (library), `pnpm build-storybook`, Storybook test runner, Playwright screenshot tests (dark + light on key stories).
- The Markets dashboard visual-diff against `reference/davinci-ai-reference.html` is reviewed and as close as possible (dark and light).
- Then write `SUMMARY.md`: what was built, decisions taken, known gaps, and recommended next steps (e.g. AG Grid theme from the grid tokens, a fuller chart library, more composites).
