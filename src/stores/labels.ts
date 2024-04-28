import { defineStore } from 'pinia';
import { Address } from 'viem';
import { ref } from 'vue';

import { Label } from '@/services/labels.js';
import { Chain } from '@/utils/chains';

const store = defineStore('labels', () => {
  const labels = ref<Partial<Record<Chain, Record<Address, Label>>>>({});

  function addLabels(chain: Chain, value: Record<Address, Label>): void {
    const chainLabels = labels.value[chain] || {};
    labels.value[chain] = { ...chainLabels, ...value };
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
    getLabel,
  };
});

export default store;
