import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { configDefaults } from 'vitest/config';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  test: {
    coverage: {
      include: ['src/components/*', 'src/store/*'],
      exclude: [
        ...configDefaults.coverage.exclude,
        // This is likely to contain bootstrapping code, which is harder and less-valuable to test
        'src/main.ts',

        'src/App.vue',
        'src/styles/*',
        // Icons are basic SVGs and don't need testing
        'src/icons/*',
        // BodyLocationSelect is tested thoroughly by VueSelect's tests
        // https://github.com/sagalbot/vue-select/tree/master/tests/unit
        'src/components/BodyLocationSelect.vue',
        // Screens are made up of tested base components
        'src/screens/*',
      ],
      provider: 'v8',
      // FIXME: The text appears twice in the console output, but zero times if I remove "text"
      reporter: ['cobertura', 'lcov', 'text'],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: 'vitest.setup.ts',
  },
}));
