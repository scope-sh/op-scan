<template>
  <AccordionRoot
    type="single"
    class="actions"
    :collapsible="true"
  >
    <template v-if="calls.length > 0">
      <template
        v-for="(call, callIndex) in calls"
        :key="callIndex"
      >
        <AccordionItem
          class="action"
          :value="callIndex.toString()"
        >
          <AccordionTrigger class="action-trigger">
            <div class="side">
              <div class="action-index">{{ callIndex + 1 }}</div>
              <div class="action-description">
                <span
                  v-for="(part, partIndex) in toAction(call)"
                  :key="partIndex"
                  class="action-part"
                >
                  {{ part.label }}
                </span>
              </div>
            </div>
            <div class="side">
              <IconChevronDown class="icon" />
            </div>
          </AccordionTrigger>
          <AccordionContent class="action-content">
            <div class="action-details">
              <div class="action-detail">
                <div class="action-detail-label">Address</div>
                <div class="action-detail-value">{{ call.to }}</div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Value</div>
                <div class="action-detail-value">
                  {{ call.value }}
                </div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Data</div>
                <div class="action-detail-value">{{ call.data }}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </template>
    </template>
    <template v-else>
      <div class="call-data">
        {{ value }}
      </div>
    </template>
  </AccordionRoot>
</template>

<script setup lang="ts">
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from 'radix-vue';
import { Hex } from 'viem';
import { computed } from 'vue';

import IconChevronDown from '@/components/IconChevronDown.vue';
import { decodeCallData, toAction, Call } from '@/utils/entryPoint';

const props = defineProps<{
  value: Hex;
}>();

const calls = computed<Call[]>(() => {
  return decodeCallData(props.value);
});
</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-secondary);
}

.action-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;

  .side {
    display: flex;
    align-items: center;
    gap: 15px;

    .icon {
      width: 16px;
      height: 16px;
      transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
    }
  }

  &[data-state='open'] {
    .icon {
      transform: rotate(180deg);
    }
  }
}

.action-content {
  overflow: hidden;

  &[data-state='open'] {
    animation: slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }

  &[data-state='closed'] {
    animation: slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
}

.action-details {
  display: flex;
  flex-direction: column;
  margin: 16px 0 4px;
  gap: 4px;
}

.action-detail {
  display: flex;
  align-items: baseline;
}

.action-detail-label {
  width: 120px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.action-detail-value {
  width: calc(100% - 120px);
  overflow-wrap: break-word;
}

@keyframes slide-down {
  from {
    height: 0;
  }

  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes slide-up {
  from {
    height: var(--radix-accordion-content-height);
  }

  to {
    height: 0;
  }
}

.action-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.action-description {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.call-data {
  --font-size: 14px;
  --line-height: 1.2;
  --padding: 8px;

  width: 100%;
  height: calc(
    var(--row-count) * var(--font-size) + (var(--row-count) - 1) *
      (var(--line-height) - 1) * var(--font-size) + var(--padding) * 2
  );
  padding: var(--padding);
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size);
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
