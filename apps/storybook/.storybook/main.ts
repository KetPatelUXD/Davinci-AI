import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

const lib = resolve(__dirname, '../../../packages/davinci-ai/src');
const examples = resolve(__dirname, '../../../packages/examples/src');

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
    '../../../packages/davinci-ai/src/**/*.stories.@(ts|tsx)',
    '../../../packages/examples/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  staticDirs: ['../public'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript', reactDocgenTypescriptOptions: { shouldExtractLiteralValuesFromEnum: true, propFilter: (p) => (p.parent ? !/node_modules/.test(p.parent.fileName) : true) } },
  viteFinal: async (cfg) =>
    mergeConfig(cfg, {
      plugins: [tailwindcss()],
      build: { chunkSizeWarningLimit: 2000, rollupOptions: { onwarn(w: { code?: string }, warn: (w: unknown) => void) { if (w.code === 'MODULE_LEVEL_DIRECTIVE' || w.code === 'SOURCEMAP_ERROR') return; warn(w); } } },
      resolve: { alias: { '@davinci-ai/react/tokens': `${lib}/tokens.ts`, '@davinci-ai/react/base.css': `${lib}/styles/base.css`, '@davinci-ai/react': `${lib}/index.ts`, '@davinci-ai/examples': `${examples}/index.ts` } },
    }),
};
export default config;
