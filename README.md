# DaVinci.AI

An accessible, themeable **React design system for dense financial, analytics, commodities-pricing and trading applications** – the *Graphite* style: near-black canvas lit from the top-left, borderless cards, white as the selection colour, colour reserved for meaning. Dark-first, WCAG 2.2 AA, agent-ready, Figma-ready.

> Private repository · "All rights reserved" · all sample data is **fictional**.

| | |
|---|---|
| **Library** | [`packages/davinci-ai`](packages/davinci-ai) → `@davinci-ai/react` (React Aria Components + Tailwind v4 + Motion) |
| **Tokens** | [`packages/tokens`](packages/tokens) – DTCG `tokens.json` → CSS, Tailwind theme, TS types, Figma variables/styles |
| **Docs** | [`apps/storybook`](apps/storybook) – Storybook 9: foundations, every component variant/state, example pages |
| **Playground** | [`apps/playground`](apps/playground) – **private** Vite app for mockups (never published or deployed) |
| **Examples** | [`packages/examples`](packages/examples) – Markets dashboard + other pages, fictional data (private) |
| **Visual reference** | [`reference/davinci-ai-reference.html`](reference/davinci-ai-reference.html) – the Graphite preview the library matches |

## Quick start

```bash
corepack enable && pnpm install          # Node 22+, pnpm
pnpm build                               # tokens → library → components.json
pnpm storybook                           # http://localhost:6006
pnpm playground                          # http://localhost:5173 (private)
```

Gates: `pnpm typecheck` · `pnpm lint` (eslint incl. jsx-a11y + token/opacity lint) · `pnpm test` (unit, axe, contrast) · `pnpm build-storybook` · `pnpm test:storybook` (axe in the Storybook test runner) · `pnpm test:screens` (Playwright, dark + light, Markets dashboard visual diff vs. the reference) · `pnpm test:all` runs everything.

**New here? Start with [`INSTALL.md`](INSTALL.md)** – a plain step-by-step guide (manual or with an AI assistant), written for non-developers.

## Using it in a project

```bash
pnpm add @davinci-ai/react react react-dom
```

```tsx
import '@davinci-ai/react/styles.css';   // precompiled CSS – no Tailwind required
import '@davinci-ai/react/fonts.css';    // optional: self-hosted Inter (needs @fontsource-variable/inter)
import { ThemeProvider, Button } from '@davinci-ai/react';

export default function App() {
  return (
    <ThemeProvider canvas attachToRoot>  {/* dark by default; theme="light" | "system" */}
      <Button iconStart="plus">New alert</Button>
    </ThemeProvider>
  );
}
```

- **No global side effects.** No resets or font injection unless you import `base.css` / `fonts.css`. Library Tailwind classes use the `dv:` prefix.
- **SSR safe** (Next.js App Router: the bundle starts with `"use client"`).
- **Without Tailwind:** `styles.css` is all you need. **With Tailwind v4:** add `@import '@davinci-ai/react/tokens.css'; @import '@davinci-ai/react/tailwind';` to your CSS and use `bg-surface`, `text-secondary`, `rounded-card`, `shadow-card`, …
- **Tokens:** `@davinci-ai/react/tokens.json` (DTCG) and `@davinci-ai/react/tokens` (typed).
- **Locale:** `ThemeProvider locale="en-US"` (default) drives numbers, currency and dates. `direction="inverted"` (red-up markets) and `colorBlindSafe` (blue/orange) are built in.

### Per-project theme without forking

```bash
npx davinci theme                                   # interactive
npx davinci theme --primary teal --density large --radius soft --mode light --yes
npx davinci theme --describe "calm teal fintech, soft rounded, spacious, light by default"
```

Writes `davinci.theme.css` (+ `.json`, `.ts`) with brand/focus/radius/density overrides whose contrast is verified against the design system's rules (white on fill ≥ 4.5:1, text ≥ 4.5:1, focus ≥ 3:1 in both themes).

## Font Awesome Pro (icons)

Icons are addressed by Font Awesome's kebab-case names (`<Icon name="chart-line" />`, identical to the Figma `Icon` component). FA Pro 7 (Light) is an **optional peer dependency**; a built-in stroke set covers everything the library itself uses.

1. `cp .npmrc.example .npmrc` and put your token in `.env` (`FONTAWESOME_NPM_AUTH_TOKEN`) – both are git-ignored. In CI use the `FONTAWESOME_NPM_AUTH_TOKEN` secret.
2. `pnpm add @fortawesome/fontawesome-svg-core @fortawesome/pro-light-svg-icons`
3. Register the icons you use: `<IconProvider icons={createIconMap([faChartLine, …])}>` or pass `icon={faChartLine}`.

## Moving to the corporate org

The npm scope lives in one place:

1. edit `davinci.config.json` (`"scope": "@acme"`, `"registry": "https://npm.pkg.github.com"` if using GitHub Packages)
2. `node scripts/set-scope.mjs` (add `--dry` to preview) – rewrites package names, imports, aliases and docs
3. `pnpm install`
4. Set the repo variable `PUBLISH_ENABLED=true`, add `NPM_TOKEN` (or use `GITHUB_TOKEN` for GitHub Packages) and run **Publish** manually. CI reads owner/scope from config and `github.repository_owner` – nothing is hard-coded to a personal account.

Storybook deploy: run the **Storybook → GitHub Pages** workflow manually.

## Agents

`packages/davinci-ai/AGENTS.md` / `CLAUDE.md` (also at the repo root) tell coding assistants how to build with the library: library components only, tokens only, create missing components in the library first, WCAG AA, semantic colour roles, size/density conventions. `components.json` is the machine-readable manifest.

## Figma

See [`docs/figma-kit.md`](docs/figma-kit.md): variables/styles come from `pnpm tokens:figma` (`dist/figma/*.json`), component properties and anatomy from `components.json`, ground-truth screenshots from `pnpm test:screens`, Code Connect scaffold in `packages/davinci-ai/figma/code-connect`.

## Releasing

Changesets: `pnpm changeset` per change → `pnpm changeset version` → publish workflow.

## More

[`PROGRESS.md`](PROGRESS.md) · [`DECISIONS.md`](DECISIONS.md) · [`SUMMARY.md`](SUMMARY.md) · [`docs/build-prompt.md`](docs/build-prompt.md)
