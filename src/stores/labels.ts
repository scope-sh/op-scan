import { defineStore } from 'pinia';
import { Address } from 'viem';
import { ref } from 'vue';

import { Label } from '@/services/labels.js';
import { Chain } from '@/utils/chains';

const store = defineStore('labels', () => {
  const labels = ref<Partial<Record<Chain, Record<Address, Label | null>>>>({});

  function addLabels(chain: Chain, value: Record<Address, Label | null>): void {
    const chainLabels = labels.value[chain] || {};
    labels.value[chain] = { ...chainLabels, ...value };
  }

  function hasLabel(chain: Chain, address: Address): boolean {
    const chainLabels = labels.value[chain];
    if (!chainLabels) {
      return false;
    }
    return chainLabels[address] !== undefined;
  }

  function getLabel(chain: Chain, address: Address): Label | null {
    const chainLabels = labels.value[chain];
    if (!chainLabels) {
      return null;
    }
    return chainLabels[address] || null;
  }

  return {
    addLabels,
    hasLabel,
    getLabel,
  };
});

export default store;
