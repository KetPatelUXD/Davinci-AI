import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// The playground is private: it is never published or deployed. It consumes the library source directly (HMR, no build step).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@davinci-ai/react/base.css': resolve(__dirname, '../../packages/davinci-ai/src/styles/base.css'), '@davinci-ai/react': resolve(__dirname, '../../packages/davinci-ai/src/index.ts'), '@davinci-ai/examples': resolve(__dirname, '../../packages/examples/src/index.ts') } },
  server: { port: 5173 },
});
