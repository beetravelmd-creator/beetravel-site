import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://beetravel.md',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: false,
});
