# @davinci-ai/react

Accessible, themeable React components for dense financial, analytics, commodities-pricing and trading applications (Graphite style). Dark-first, WCAG 2.2 AA, built on React Aria Components.

**Step-by-step guide for designers and developers:** see `INSTALL.md` in the repository, or Storybook → Guides → Getting started.

```bash
pnpm add @davinci-ai/react react react-dom   # once published; until then install the .tgz: npm install ./davinci-ai-react-0.1.0.tgz
```

```tsx
import '@davinci-ai/react/styles.css';
import { ThemeProvider, Button } from '@davinci-ai/react';

<ThemeProvider canvas attachToRoot>
  <Button iconStart="plus">New alert</Button>
</ThemeProvider>
```

| Import | What |
|---|---|
| `@davinci-ai/react` | Components, hooks, `ThemeProvider` |
| `@davinci-ai/react/styles.css` | Precompiled CSS (tokens + components) |
| `@davinci-ai/react/base.css` · `fonts.css` | Opt-in page base · opt-in self-hosted Inter |
| `@davinci-ai/react/tailwind` | Tailwind v4 `@theme` for host apps (`bg-surface`, `text-secondary`, …) |
| `@davinci-ai/react/tokens` · `tokens.json` · `tokens.css` | Typed tokens · DTCG source · CSS variables |
| `@davinci-ai/react/components.json` | Machine-readable component manifest (props, variants, a11y, Figma mapping) |
| `npx davinci theme` | Per-project theme file: `--init`, `--file`, `--validate`, `--from-figma` (contrast-checked); also `<ThemeProvider themeConfig>` and `@davinci-ai/react/theme.schema.json` |

See `AGENTS.md` for the rules code assistants must follow, and the repository README for theming, Tailwind/non-Tailwind usage, Font Awesome Pro setup and moving the npm scope.

Peer dependencies: `react` / `react-dom` 18 or 19. Optional: `@fortawesome/fontawesome-svg-core`, `@fortawesome/pro-light-svg-icons` (icons), `@fontsource-variable/inter` (fonts.css).

© All rights reserved.
