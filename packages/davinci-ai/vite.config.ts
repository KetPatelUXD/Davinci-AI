import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'], exclude: ['src/**/*.test.*', 'src/test/**', 'src/**/*.stories.*', 'src/stories/**'], tsconfigPath: './tsconfig.json', rollupTypes: false })],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    lib: {
      entry: { index: resolve(__dirname, 'src/index.ts'), tokens: resolve(__dirname, 'src/tokens.ts') },
      formats: ['es'],
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^react\/jsx-runtime$/, /^react-aria-components($|\/)/, /^motion($|\/)/, /^@internationalized\//, /^@fortawesome\//, 'clsx'],
      onwarn(w, warn) { if (w.code === 'MODULE_LEVEL_DIRECTIVE' || w.code === 'SOURCEMAP_ERROR') return; warn(w); },
      output: { preserveModules: false, banner: (chunk) => (chunk.name === 'index' ? "'use client';" : ''), assetFileNames: (a) => (a.names?.[0]?.endsWith('.css') ? 'style.css' : 'assets/[name][extname]') },
    },
  },
});
