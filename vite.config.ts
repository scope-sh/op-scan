import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  css: {
    transformer: 'lightningcss',
  },
  plugins: [
    tsconfigPaths({
      loose: true,
    }),
    vue(),
    VueDevTools(),
  ],
});
