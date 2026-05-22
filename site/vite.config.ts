import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const version = readFileSync(resolve(__dirname, 'public/VERSION'), 'utf-8').trim();

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    minify: 'esbuild',
  },
  server: {
    port: 3000,
  },
});
