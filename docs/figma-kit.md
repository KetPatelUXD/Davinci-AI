# Figma kit – structure, naming and sync rules

The Figma kit is **generated from this repo** into a blank Figma file via the Figma MCP. **Code is the source of truth**: token or component changes are re-synced to Figma, never the reverse.

## Inputs (all generated, all committed or reproducible)

| Artifact | Command | What it contains |
|---|---|---|
| `dist/figma/variables.json` | `pnpm tokens:figma` | Collections → modes → variables (`name`, `type`, `scopes`, `codeSyntax.WEB`, `description`, `values{mode: literal \| {alias}}`) |
| `dist/figma/styles.json` | `pnpm tokens:figma` | Paint styles (card/panel sheens, avatar – one per mode), effect styles (shadows, glass blur), text styles (type scale incl. 300-weight display numerals, bound to font-size variables) |
| `packages/davinci-ai/dist/components.json` | `pnpm build` | Per component: `figma.properties`, `figma.states`, `figma.anatomy`, `figma.composedOf` |
| `packages/davinci-ai/assets/icons/manifest.json` | `pnpm build` | Every icon name the library uses (default style `light`) |
| `dist/screens/*.png` | `pnpm test:screens` | Visual ground truth: one PNG per story per mode (`<story-id>.dark.png` / `.light.png`) |
| `packages/davinci-ai/figma/code-connect/*.figma.tsx` | `pnpm build` | Code Connect scaffold, `FIGMA_NODE_URL` placeholders |

### Variable collections

| Collection | Modes | Contents |
|---|---|---|
| **Primitives** | – (`Default`) | Full Tailwind palette (every hue 50–950), `brand/*` (violet), `graphite/*` (custom neutral ramp), `alpha/*` (named translucent values), spacing, radius, font size/weight, durations, blur |
| **Semantic** | `Dark`, `Light` | Roles (`bg/default`, `surface/raised`, `text/muted`, `border/strong`, `positive/fill`, `chart/line`, …). **Aliases of primitives** so the alias chain survives |
| **Component** | `Comfortable`, `Compact` | `button/height-md`, `input/height-md`, `table/row-height`, `grid/*`, `card/padding-*`… aliasing Semantic/Primitives |

Names use `/` grouping (Figma folders): `text/muted`, `surface/raised`, `radius/control`. Each variable carries the exact CSS variable in `codeSyntax.WEB` (e.g. `var(--dv-text-muted)`) so Dev Mode shows the real token.

Values Figma variables cannot hold are **styles**: `sheen/card/Dark|Light`, `sheen/panel/…` (paint), `shadow/card/…`, `blur/glass` (effect), `type/*` (text).

## File structure (page order)

1. **Cover**
2. **Foundations** – Colour · Type · Spacing · Radius · Elevation (card, glass, shadows)
3. **Components** – one section per category, in the order of the prompt/§6: Actions · Inputs · Display · Navigation · Overlays · Layout · Data · Finance · Chat
4. **Patterns** – order ticket, filter + table toolbar, KPI stack, composer states
5. **Examples** – **Markets dashboard** (dark + light) built from component instances; other example pages

## Naming rules

- Components: `Category/Component`, e.g. `Actions/Button`, `Finance/OrderTicket` (the manifest's `figma.name`).
- Variant property names and values are **identical to the React props**: `variant=solid|subtle|ghost`, `intent=primary|brand|…`, `size=sm|md|lg|xl`, plus a synthetic `state` variant (`default, hover, pressed, focus-visible, selected, disabled, invalid, loading` as applicable).
- Booleans keep React names (`isDisabled`, `fullWidth`, `dot`) and add `hasIconStart` / `hasIconEnd`; `children` → TEXT `label`; icons → INSTANCE_SWAP `iconStart` / `iconEnd`. Behaviour-only props (`onPress`, `value`, …) are excluded.
- Layers are bound to **variables only** – the anatomy lists variable names per size (e.g. `button/height-md`, `radius/pill`, `fill/field`, `type/base-medium`), never raw numbers.
- Composites are built from **instances** of primitives (`composedOf`), never detached copies.

## The `Icon` component (live Font Awesome text, not vectors)

One component, one text layer set in **Font Awesome 7 Pro** (desktop font – typing `chart-line` shows the glyph via ligatures).

| Property | Type | Notes |
|---|---|---|
| `name` | TEXT | kebab-case name, identical to `<Icon name="…" />` in code |
| `style` | VARIANT `light` (default) · `regular` · `solid` | maps to the FA font style |
| `size` | VARIANT `12` · `14` · `16` · `18` | bound to `icon/size-*` variables |

Colour is bound to text/icon variables. Every component with an icon nests an `Icon` instance and surfaces its name as `iconStart` / `iconEnd`. Only the DaVinci.AI logo set ships as SVG (`assets/brand`).

**Prerequisite:** every designer and the machine running kit generation needs the Font Awesome 7 Pro desktop fonts installed, or uploaded as shared organisation fonts in Figma; otherwise icon layers fall back to plain text.

## Generating the kit (high level)

1. `pnpm build && pnpm tokens:figma && pnpm build-storybook && pnpm test:screens`
2. Create the variable collections/modes from `variables.json`, then the styles from `styles.json`.
3. Build components in category order from `components.json` (properties → variants → anatomy bound to variables). Compare each against `dist/screens/<story-id>.<mode>.png`.
4. Assemble Patterns and the Markets dashboard from instances.
5. Fill `FIGMA_NODE_URL` in the Code Connect files and `pnpm figma:connect` – Dev Mode then shows real `@davinci-ai/react` code.

## Known limits (documented, not solved)

- The cursor **spotlight**, motion, count-ups and live data are code-only; Figma shows the static hover state.
- Chart components (`Sparkline`, `PriceChart`, `DonutChart`) are static vector examples in Figma.
- `backdrop-filter: saturate(140%)` has no Figma equivalent (blur only).
- Gradient-with-alpha fills use Figma paint styles per mode; `prefers-*` media adaptations are code-only.

## Sync rule

Change tokens in `packages/tokens/scripts/seed.mjs` → `pnpm tokens:figma` → re-sync variables/styles in Figma. Change a component in code → `pnpm build` regenerates `components.json` → re-sync that component. **Never** hand-edit Figma tokens or properties and expect code to follow.
