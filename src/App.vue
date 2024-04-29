<template>
  <div
    id="app"
    :class="{ 'background-gray': isOpPage }"
  >
    <AppHeader />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';

const route = useRoute();
const isOpPage = computed(() => route.name === 'op');
</script>

<style>
:root {
  --color-background-primary: #fefefe;
  --color-background-secondary: #f9f9f9;
  --color-background-tertiary: #e9e9e9;
  --color-background-quaternary: #dcdcdc;
  --color-text-primary: #352e39;
  --color-text-secondary: #645a6a;
  --color-border: #d6cfda;
  --color-accent: oklch(56.32% 0.282 311.68deg);
  --color-success: #5da600;
  --color-error: #c74242;
  --font-sans: 'Inter Variable', -apple-system, 'BlinkMacSystemFont',
    avenir next, avenir, segoe ui, helvetica neue, helvetica, 'Ubuntu', roboto,
    noto, arial, sans-serif;
  --font-serif: 'Iowan Old Style', 'Apple Garamond', 'Baskerville',
    'Times New Roman', 'Droid Serif', 'Times', 'Source Serif Pro', serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --font-mono: 'JetBrains Mono Variable', 'Menlo', 'Consolas', 'Monaco',
    'Liberation Mono', 'Lucida Console', monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #141414;
    --color-background-secondary: #191919;
    --color-background-tertiary: #202020;
    --color-background-quaternary: #242424;
    --color-text-primary: #d5d2d6;
    --color-text-secondary: #aea9b0;
    --color-border: #4a4a4a;
    --color-accent: oklch(76.32% 0.16 311.68deg);
  }
}

body {
  height: 100%;
  min-height: 100vh;
  margin: 0;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);

  &:has(.background-gray) {
    background: var(--color-background-secondary);
  }
}

/* Reset */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  height: 100%;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

#app {
  isolation: isolate;
}
</style>
