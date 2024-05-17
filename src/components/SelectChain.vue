<template>
  <Select.Root
    :model-value="getValue(modelValue)"
    @update:model-value="handleModelValueUpdate"
  >
    <Select.Trigger
      as-child
      :aria-label="placeholder"
    >
      <button class="trigger">
        <Select.Value
          as="div"
          class="value"
          :placeholder="placeholder"
        >
          <span v-if="selectedItem">{{ selectedItem.label }}</span>
        </Select.Value>
        <IconChevronDown class="icon" />
      </button>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content
        :side-offset="4"
        :position="'popper'"
      >
        <div class="panel">
          <Select.ScrollUpButton class="scroll-button">
            <IconChevronUp class="icon" />
          </Select.ScrollUpButton>

          <Select.Viewport>
            <Select.Group>
              <Select.Item
                v-for="(item, index) in options"
                :key="index"
                class="item"
                :value="getValue(item.value)"
              >
                {{ item.label }}
              </Select.Item>
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton class="scroll-button">
            <IconChevronDown class="icon" />
          </Select.ScrollDownButton>
        </div>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>

<script setup lang="ts">
import { Select } from 'radix-vue/namespaced';
import { computed } from 'vue';

import { Chain, parseChain } from '@/utils/chains';

import IconChevronDown from './IconChevronDown.vue';
import IconChevronUp from './IconChevronUp.vue';

const props = defineProps<{
  options: Item[];
  placeholder: string;
}>();

const model = defineModel<Item['value']>({
  required: true,
});

const selectedItem = computed(() => {
  return props.options.find((item) => item.value === model.value);
});

const ALL_CHAINS = 'all';

function handleModelValueUpdate(newValue: string): void {
  if (newValue === ALL_CHAINS) {
    model.value = null;
  }
  const chain = parseChain(newValue);
  if (chain) {
    model.value = chain;
  }
}

function getValue(itemValue: Item['value']): string {
  if (!itemValue) {
    return ALL_CHAINS;
  }
  return itemValue.toString();
}
</script>

<script lang="ts">
interface Item {
  value: Chain | null;
  label: string;
}

export type { Item };
</script>

<style scoped>
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 8px;
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  outline: none;
  background: transparent;
  box-shadow: 1px 1px 0 0 rgb(0 0 0 / 10%);
  color: var(--color-text-secondary);
  cursor: pointer;

  &:focus {
    border: 1px solid var(--color-border);
    box-shadow: 2px 2px 0 0 rgb(0 0 0 / 10%);
  }

  &:hover {
    border-color: var(--color-border);
    box-shadow: 2px 2px 0 0 rgb(0 0 0 / 10%);
    color: var(--color-text-primary);
  }

  & .value {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
  }
}

.icon {
  width: 15px;
  height: 15px;
}

.panel {
  width: var(--radix-select-trigger-width);
  max-height: var(--radix-select-content-available-height);
  padding: 4px;
  overflow-y: auto;
  transform-origin: var(--radix-select-content-transform-origin);
  animation: scale-in 0.125s ease-out;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: oklch(from var(--color-background-primary) l c h / 60%);
  box-shadow: 1px 1px 0 0 rgb(0 0 0 / 20%);
  backdrop-filter: blur(4px);
}

@keyframes scale-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  cursor: default;
}

.item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 4px;
  border-radius: 4px;
  outline: none;
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;

  &:hover,
  &:focus {
    background: var(--color-background-secondary);
    color: var(--color-text-secondary);
  }
}
</style>
