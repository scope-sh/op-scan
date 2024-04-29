<template>
  <header>
    <router-link
      ref="homeLinkEl"
      :to="{ name: 'home' }"
      class="link"
    >
      <IconBrand class="icon" />
    </router-link>
    <Transition name="slide">
      <div
        v-if="isLinkHovered"
        class="label"
      >
        OpScan
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { ref } from 'vue';

import IconBrand from './IconBrand.vue';

const homeLinkEl = ref<HTMLElement | null>(null);
const isLinkHovered = useElementHover(homeLinkEl);
</script>

<style scoped>
header {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 48px;
  padding: 0 8px;

  @media (width >= 768px) {
    padding: 0 16px;
  }
}

.link {
  z-index: 1;
}

.icon {
  width: 28px;
  height: 28px;
  transition: opacity 0.2s ease-in-out;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}

.label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-16px);
  opacity: 0;
}
</style>
