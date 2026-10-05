import type { Decorator, Preview } from '@storybook/react-vite';
import { ThemeProvider, ToastProvider, type Density } from '@davinci-ai/react';
import '@davinci-ai/react/base.css';
import '@fontsource-variable/inter/index.css';
import { DocsPage } from './DocsPage';

const withTheme: Decorator = (Story, ctx) => {
  const theme = (ctx.globals.theme as 'dark' | 'light') ?? 'dark';
  const density = (ctx.globals.density as Density) ?? 'comfortable';
  const layout = ctx.parameters.layout;
  return (
    <ThemeProvider theme={theme} density={density} direction={ctx.globals.direction} colorBlindSafe={ctx.globals.cvd === 'on'} canvas attachToRoot>
      <ToastProvider>
        <div style={{ padding: layout === 'fullscreen' ? 0 : 24 }}>
          <Story />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: { description: 'Theme', toolbar: { title: 'Theme', icon: 'mirror', items: [{ value: 'dark', title: 'Dark (default)' }, { value: 'light', title: 'Light' }], dynamicTitle: true } },
    density: { description: 'Density', toolbar: { title: 'Density', icon: 'component', items: [{ value: 'comfortable', title: 'Comfortable' }, { value: 'compact', title: 'Compact' }], dynamicTitle: true } },
    direction: { description: 'Market direction', toolbar: { title: 'Direction', icon: 'transfer', items: [{ value: 'standard', title: 'Green up / red down' }, { value: 'inverted', title: 'Red up / green down' }], dynamicTitle: true } },
    cvd: { description: 'Colour-blind-safe long/short', toolbar: { title: 'CVD-safe', icon: 'eye', items: [{ value: 'off', title: 'Off' }, { value: 'on', title: 'Blue / orange' }], dynamicTitle: true } },
  },
  initialGlobals: { theme: 'dark', density: 'comfortable', direction: 'standard', cvd: 'off' },
  parameters: {
    layout: 'centered',
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Fail the Storybook test runner on any axe violation.
    a11y: { test: 'error', options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } } },
    backgrounds: { disable: true },
    options: { storySort: { order: ['Cover', 'Introduction', 'Guides', 'Foundations', 'Components', 'Examples', 'Internal'] } },
    docs: { toc: true, page: DocsPage },
  },
  tags: ['autodocs'],
};
export default preview;
