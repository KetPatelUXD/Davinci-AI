# Change the theme, step by step

Give a project its own brand colour, corner shape, density and fonts with **one theme file**, without forking the library. The file is plain JSON in the [W3C Design Tokens](https://www.designtokens.org/) style (`$type` / `$value`), so designers can produce it from Figma variables and developers can review it in a pull request.

## How it works

```
Figma variables export ─┐
                        ├─►  davinci.theme.json  ──►  compile (CLI)  ──►  davinci.theme.css  ─┐
hand-written or --init ─┘            │                                                         ├─►  your app
                                     └──────────►  <ThemeProvider themeConfig={…}>  (runtime) ┘
```

One compiler does both jobs, so the CSS is identical either way. The compiler **checks contrast** (WCAG 2.2 AA) and refuses colours that would make text unreadable.

**Recommended:** compile to a CSS file (no runtime cost, no flash, works with strict CSP and server rendering). Use the runtime route only when the theme must change while the app runs (white-label, per-customer brands).

## What a theme file can change

| Key | What it does | Values |
|---|---|---|
| `brand` | The brand colour. Dark and light text, button fill, wash and focus ring are **derived** from it and contrast-checked. | a preset (`violet`, `indigo`, `blue`, `sky`, `teal`, `emerald`, `amber`, `orange`, `rose`, `pink`, `slate`) or a hex like `#0f766e` |
| `radius` | Corner feel for cards, panels, controls, menus. A preset in `$value`, plus optional single radii: `card`, `composer`, `panel`, `tile`, `control`, `menu`, `tooltip`, `code`, `pill` | preset `sharp`, `balanced` (default), `soft`; radii as a number of px, `"24px"` or `"1.5rem"` |
| `density` | Control heights | `small`, `medium` (default), `large` |
| `size.comfortable.<token>`, `size.compact.<token>` | **Spacing and sizing** of components per density: button, icon-button and input heights, horizontal padding, icon sizes, card and panel padding, table row height… (names are the CSS variables without `--dv-`, e.g. `button-height-md`, `card-px`) | a length. Controls cannot be smaller than the 24px minimum target size |
| `mode` | Default mode for the project (`defaultTheme` in the generated `.ts`) | `dark` (default), `light`, `system` |
| `font.sans`, `font.mono` | Font stacks | a CSS font-family list |
| `color.dark.<role>`, `color.light.<role>` | Override any semantic colour for one mode, e.g. `bg`, `surface`, `text-secondary`, `positive` | hex or `rgb()/rgba()` |

About spacing: the library does not use one global spacing scale; each component takes its sizes and paddings from its own tokens. Those are exactly what `size.*` overrides, and what the Figma **Component** collection (Comfortable / Compact modes) contains. The raw `space/*` primitives in Figma are not used by components and are not importable.

Not themeable here: the Graphite *style* itself (there is only one), and the positive/negative status colours' direction (use `ThemeProvider direction="inverted"` or `colorBlindSafe`).

## Step 1 · Decide what you are changing

Most projects only need **`brand`**. Add `radius` and `density` if the product should feel sharper, softer, tighter or roomier. Only add `color.*` overrides when a designer has a specific canvas or surface colour. Every override is another thing to keep accessible.

## Step 2 · Create the theme file

```bash
npx davinci theme --init --primary teal
```

This writes `davinci.theme.json`:

```json
{
  "$schema": "https://unpkg.com/@davinci-ai/react/dist/theme.schema.json",
  "brand":   { "$type": "color", "$value": "#0f766e" },
  "radius":  { "$value": "balanced" },
  "density": { "$value": "medium" },
  "mode":    { "$value": "dark" },
  "font":    { "sans": { "$value": "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif" } },
  "color":   { "dark": {}, "light": {} }
}
```

The `$schema` line gives you autocomplete and inline errors in VS Code. Ready-made samples ship with the package: `@davinci-ai/react/themes/teal.theme.json`, `sky.theme.json`, `amber.theme.json`.

## Step 3 · Edit it, or import it from Figma

### 3a · Edit by hand

Change values in the file. Plain strings work as well as `{ "$value": … }`: `"brand": "teal"` is the same as `"brand": { "$value": "teal" }`.

To override a colour for one mode:

```json
"color": {
  "dark":  { "bg": { "$type": "color", "$value": "#05080c" } },
  "light": { "surface": { "$type": "color", "$value": "#ffffff" } }
}
```

Single radii and sizes:

```json
"radius": { "$value": "soft", "card": { "$type": "dimension", "$value": "24px" } },
"size": {
  "comfortable": { "button-height-md": { "$value": 44 }, "card-px": { "$value": "28px" } },
  "compact":     { "button-height-md": { "$value": 30 } }
}
```

The preset sets all radii; a single radius after it wins for that role. `size.comfortable` stacks on top of the `density` preset. The role names are the CSS variable names without `--dv-`. The schema lists all of them. Colours with gradients (`card`, `panel`) and non-colour tokens are not overridable.

### 3b · Start from a Figma export

Use this when a designer is choosing the palette in Figma.

1. In Figma, duplicate the DaVinci.AI library file (or work on a branch). Edit the values you want to change: colours in the **Semantic** collection (Dark and Light modes), corner radii (`radius/*`, also in **Semantic**), and component sizes and paddings in the **Component** collection (Comfortable and Compact modes, e.g. `button/height-md`, `card/padding-x`). **Keep the variable names**; the importer matches on them (and on the `--dv-*` code syntax).
2. Export the variables as JSON. Any of these work:
   - the Figma REST "local variables" response (`GET /v1/files/:file_key/variables/local`, needs a plan that includes the Variables API),
   - a DTCG export from a variables plugin such as Tokens Studio, with one file or tree per mode (`Dark` / `Light`),
   - the library's own `variables.json` shape (`@davinci-ai/react/figma/variables.json`, useful as a template).
3. Import it:

   ```bash
   npx davinci theme --from-figma figma-variables.json
   ```

   The importer:
   - keeps **only values that differ** from the library defaults, so the theme file stays small,
   - turns a changed `brand/fill` into the `brand` seed and **derives** brand text, wash and focus itself (so contrast is guaranteed) instead of importing them,
   - imports changed **radii** (to `radius.<role>`) and changed **component sizes and paddings** (to `size.comfortable` / `size.compact`), again only when they differ from the defaults,
   - lists every variable it could not match (blur, motion durations and grid colours are not themeable and are skipped; so are the raw `space/*` primitives),
   - validates the result before writing `davinci.theme.json`.

4. Open the generated file, set `radius`, `density` and `font` if you want them, then continue with step 4.

> The Figma library itself stays generated from the code. The theme file is the *project's* choice on top of it; importing from Figma never changes the library.

## Step 4 · Validate

```bash
npx davinci theme --validate davinci.theme.json
```

You get one of:

- `✓ davinci.theme.json is valid. Contrast: {…}`: done.
- `✗ color.dark.bg: unknown role…`, `not a hex or rgb(a) colour`, `radius.x: unknown radius` or `not a length`: fix the key or value.
- `✗ comfortable: "button-height-sm" is 16px (controls need at least 24px…)`: the control is below the minimum target size.
- `✗ dark: "text" on "surface" is 3.10:1 (needs 4.5:1)`: the colour is too faint. Change it, or accept the risk by adding `"$extensions": { "davinci": { "unsafe": true } }`. Unsafe turns errors into warnings; use it only with a designer's sign-off.

Add this command to CI so a bad theme never ships.

## Step 5 · Apply it (pick one route)

### Route A · compile to CSS (recommended)

```bash
npx davinci theme --file davinci.theme.json --out src/theme
```

Then import the CSS **after** the library CSS:

```tsx
import '@davinci-ai/react/styles.css';
import './theme/davinci.theme.css';
import { ThemeProvider } from '@davinci-ai/react';
import { theme } from './theme/davinci.theme';   // { defaultTheme, density }

<ThemeProvider defaultTheme={theme.defaultTheme} density={theme.density} canvas attachToRoot>
  {/* app */}
</ThemeProvider>
```

Re-run the command whenever the file changes (add it to a `prebuild` script).

### Route B · at runtime

```tsx
import { ThemeProvider } from '@davinci-ai/react';
import theme from './davinci.theme.json';        // needs "resolveJsonModule": true

<ThemeProvider themeConfig={theme} canvas attachToRoot>
  {/* app */}
</ThemeProvider>
```

Notes:
- The provider compiles the file once (again only if its contents change), adds a scoped `<style>` and a `data-dv-theme` attribute, and is safe for server rendering.
- Use `attachToRoot` so menus, dialogs and toasts (which render outside the provider) also get the theme.
- An invalid theme is **ignored** (the default theme stays) and the reasons are logged in development.
- A nested `ThemeProvider` starts from the library defaults. Pass `themeConfig` to it too if it should be themed.
- To check a theme in code: `import { validateTheme, compileTheme } from '@davinci-ai/react'`.

## Step 6 · Check the result

1. Look at your app in **dark and light** (`<ThemeProvider theme="light">`).
2. Check `colorBlindSafe` and `direction="inverted"` if your product uses them.
3. Run your app's axe checks.
4. In this repo's Storybook, open **Foundations → Theme file** to see sample themes applied to real components in both modes.

## Step 7 · Commit it

Commit `davinci.theme.json` (and the generated CSS if you use Route A). It is the project's single source of truth for its theme: changes go through code review like any other change. Designers who change the Figma variables re-run step 3b and open a pull request with the diff.

## Step 8 · After a library upgrade

Role names are stable. After upgrading `@davinci-ai/react`: run `--validate` again (new surfaces can change contrast results), re-run the compile command for Route A, and look at both modes.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| My brand colour looks different from the hex I entered | It is tuned: dark and light text must reach 4.5:1 and the button fill must carry a white label at 4.5:1. The fill keeps your hue; text colours shift lighter or darker. This is intentional. |
| `unknown role` | The key is not a semantic colour. Check the schema (autocomplete) or the Figma Semantic collection names. |
| `needs 4.5:1` errors after a surface override | Changing `bg`/`surface` also changes what text sits on. Adjust the text roles too, or revisit the surface. |
| Menus or dialogs are not themed (runtime route) | Add `attachToRoot` to the `ThemeProvider`. |
| Nothing changes (CSS route) | The theme CSS must be imported **after** `styles.css`, and the file must have been regenerated. |
| Nothing changes (runtime route) | Check the browser console: an invalid theme is ignored and logged. |
| Figma import says many variables did not match | Variable names were changed in Figma. Restore the library names, or the importer cannot map them. Blur, motion and `space/*` primitives are skipped by design. |
| A radius or size from Figma had no effect | Radii are the same in both modes (Dark was used if they differ); sizes only apply under the matching `data-density` (comfortable is the default; set `density="compact"` on the provider to see compact values). |
| Colours are right in dark but wrong in light | The two modes are separate. Set both `color.dark` and `color.light`, or just `brand`, which derives both. |

## Reference

```text
davinci theme --init [--primary teal] [--out dir]      write a starter davinci.theme.json
davinci theme --file davinci.theme.json [--out dir]    compile to davinci.theme.css and davinci.theme.ts
davinci theme --validate davinci.theme.json            check only
davinci theme --from-figma variables.json [--out dir]  Figma variables export → davinci.theme.json
davinci theme [--primary … --radius … --density … --mode … --describe "…"]   quick start without a file
```

Package exports: `@davinci-ai/react/dist/theme.schema.json` (editor schema, also `@davinci-ai/react/theme.schema.json`), `@davinci-ai/react/themes/*` (samples), `ThemeProvider themeConfig`, `compileTheme`, `validateTheme`.
