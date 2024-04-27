<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
</script>

<style>
:root {
  --color-background-primary: #fefefe;
  --color-background-secondary: #efefef;
  --color-background-tertiary: #e3e3e3;
  --color-background-quaternary: #dcdcdc;
  --color-text-primary: #393939;
  --color-text-secondary: #6a6a6a;
  --color-border: #dadada;
  --font-sans: 'Inter Variable', -apple-system, 'BlinkMacSystemFont',
    avenir next, avenir, segoe ui, helvetica neue, helvetica, 'Ubuntu', roboto,
    noto, arial, sans-serif;
  --font-serif: 'Iowan Old Style', 'Apple Garamond', 'Baskerville',
    'Times New Roman', 'Droid Serif', 'Times', 'Source Serif Pro', serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --font-mono: 'JetBrains Mono Variable', 'Menlo', 'Consolas', 'Monaco',
    'Liberation Mono', 'Lucida Console', monospace;
}

body {
  font-family: var(--font-sans);
}

/* Reset */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
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
