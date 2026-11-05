import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };
import { virtualModules } from './virtual.vite.ts';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), virtualModules()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __CONTENT_STRICT__: JSON.stringify(process.env.CONTENT_STRICT === '1'),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{mjs,ts}', '*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**', 'scripts/**', '*.vite.ts'],
      exclude: ['**/*.test.*', 'src/test/**', '**/*.css', 'src/vite-env.d.ts'],
      reporter: ['text', 'html'],
    },
  },
});
