# DaVinci.AI – designer guide

For designers working in the DaVinci.AI Figma file and shaping what ships.

**Figma file:** https://www.figma.com/design/9aDylAVblgXqs1SbuugPEf/Davinci-AI

## 1. The one rule

The Figma file mirrors the code library 1:1. **Code is the source of truth.** Figma is regenerated from the code when something changes, so edits made directly to library components in Figma will be overwritten and will not flow back. To change a component, ask for a code change, then the Figma file is re-synced.

## 2. What is in the file

- **Variables and styles:** colour (Primitives, Semantic with dark and light modes), type, spacing and sizes, radius, elevation (effect styles), motion notes.
- **Foundation pages:** Colour, Typography, Spacing and sizes, Radius and elevation, Motion, Icons (with a gallery).
- **Component pages** by category: Actions, Inputs, Display, Navigation, Overlays, Layout, Data, Finance, Chat. 129 component sets.
- **Patterns and Examples** (including the Markets dashboard), **Getting started**, and **Sync and changelog**.

## 3. How components are built

- Every property is **bound to a variable**. There are no raw colours, radii or spacing values, so switching the mode to dark or light re-themes everything.
- **Names match the code.** A layer called `Thumb` inside `SegmentedControl` is `.dv-segmented-control__thumb` in the DOM. Layer names are PascalCase part names; do not rename them.
- **Properties match the code props:**
  - `variant`, `intent`, `size`, `orientation` become variant properties with the same values.
  - Interaction state is a variant property `state`: `default`, `hovered`, `pressed`, `focus-visible`, `disabled`, `selected`, `invalid`, `loading`, `read-only`.
  - Optional icons are an instance-swap `iconStart` plus a boolean `hasIconStart`.
  - Text props (`label`, `title`, `hint`) are text properties.
- **Variant name format:** `variant=…, intent=…, size=…, state=…`.
- Use **instances** from the file. Never detach to restyle.

## 4. Design rules to follow

- **Colour by meaning, not by hue.** `positive` is up, long or success. `negative` is down, short or error. `brand` is focus, links and the LEO accent. `on` is selected or primary neutral. Never use chart or data colours for status.
- **Never rely on colour alone.** Long/short, status and validation always carry an icon, a sign or text.
- **Dark is the default.** Design dark first, then check light. Every screen must work in both. Also check the colour-blind-safe mode and the inverted-direction (red-up) option for market screens.
- **One solid primary button per view.** `subtle` for secondary tools (for example Filters), `ghost` for tertiary. Primary call to action is `xl`. Buy and Sell use positive and negative intent.
- **Density:** dense data screens use size `md` or `sm` with compact density and dense form layout. Occasional, sparse forms use comfortable density, sparse layout and `lg`.
- **Numbers:** right-aligned, tabular figures, signed changes shown with a price change or delta pill, never a bare coloured number. (Figma cannot set tabular figures; the code does.)
- **Progressive disclosure:** show the essentials; put detail in disclosures, popovers, drawers, menus or reasoning blocks.
- **Accessibility minimums:** text 4.5:1, icons and borders 3:1, visible focus ring, labels on every input, target size at least 24px. These are enforced in code by automated tests, so a design that needs a lower contrast will not ship.
- **Fictional data only** in mocks (no real assessment names, prices or brands).

## 5. What Figma cannot show

Motion, the cursor-lit card edge (spotlight), live data, and tabular figures are code-only. The Motion page documents motion. Check these in Storybook, which is the live reference for every component, variant and state.

## 6. Requesting a change or a new component

1. Check the Figma components and Storybook first. Most needs are already covered by an existing component or variant.
2. If it is a layout of existing components, it is a pattern or page, not a new component.
3. If a component is missing, describe: purpose, states, variants, content, and where it is used. It will be built in code first (with accessibility and dark/light checks), then appear in Figma.
4. Brand colour changes: edit the Semantic variables in a copy of the Figma file (keep the variable names), export them as JSON (colours, radii and the Component sizes/paddings are all picked up) and hand the file to a developer: `npx davinci theme --from-figma variables.json` turns it into the project's theme file and checks contrast (guide: *Change the theme step by step*). Or ask for a theme change. A generator picks accessible shades for dark and light and checks contrast. Status colours are separate and do not change with brand.

## 7. Known differences and gaps

- **Vertical sliders** exist in code but not yet as a Figma variant.
- Hover, motion and spotlight states are not all represented in Figma.
- The Figma file reflects the library as of 2026-10-05. If something looks different in Storybook, Storybook is right; report it.
- Where the original visual reference and accessibility conflicted, accessibility won. Some token values differ slightly from the reference for that reason (see `DECISIONS.md` #18).

## 8. Where to look

- Storybook: live components, every variant and state, light and dark.
- `docs/naming-convention.md`: naming across React, Storybook and Figma.
- `docs/figma-kit.md`: how the Figma file is generated.
- The Figma page "Sync and changelog": what changed and when.
