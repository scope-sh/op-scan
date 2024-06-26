<template>
  <a
    :href="href"
    target="_blank"
  >
    <div
      class="block"
      @click="copy"
    >
      {{ label }}
      <template v-if="type === 'regular'">
        <IconCopy
          v-if="ready"
          class="icon"
        />
        <IconCheck
          v-else
          class="icon"
        />
      </template>
      <IconArrowTopRight
        v-else
        class="icon"
      />
    </div>
  </a>
</template>

<script setup lang="ts">
import { useTimeout } from '@vueuse/core';
import { computed, onMounted } from 'vue';

import { Chain, getExplorerUrl } from '@/utils/chains';

import IconArrowTopRight from './IconArrowTopRight.vue';
import IconCheck from './IconCheck.vue';
import IconCopy from './IconCopy.vue';

const props = defineProps<{
  value: string;
  label: string;
  chain: Chain;
  type: 'regular' | 'block' | 'address' | 'chain' | 'transaction';
}>();

onMounted(() => {
  stop();
});

const { ready, start, stop } = useTimeout(2000, { controls: true });

function copy(): void {
  navigator.clipboard.writeText(props.value);
  start();
}

const href = computed(() => {
  const explorerUrl = getExplorerUrl(props.chain);
  if (!explorerUrl) return undefined;
  switch (props.type) {
    case 'block':
      return `${explorerUrl}/block/${props.value}`;
    case 'address':
      return `${explorerUrl}/address/${props.value}`;
    case 'chain':
      return `${explorerUrl}`;
    case 'transaction':
      return `${explorerUrl}/tx/${props.value}`;
    default:
      return undefined;
  }
});
</script>

<style scoped>
a {
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.block {
  display: flex;
  align-items: center;
  padding: 2px 3px;
  border: 1px dashed oklch(from var(--color-accent) 89.25% 0.079 h / 100%);
  border-radius: 2px;
  background: oklch(from var(--color-accent) l c h / 10%);
  color: var(--color-accent);
  cursor: pointer;
  gap: 4px;

  @media (width >= 768px) {
    padding: 4px 6px;
  }

  @media (prefers-color-scheme: dark) {
    & {
      border-color: oklch(from var(--color-accent) 59.25% 0.079 h / 100%);
      background: oklch(from var(--color-accent) l c h / 10%);
    }
  }

  .icon {
    width: 14px;
    height: 14px;
    opacity: 0.2;
  }

  &:hover {
    border-style: solid;

    .icon {
      opacity: 1;
    }
  }
}
</style>
