import { Address } from 'viem';

import LabelService, { Label } from '@/services/labels';
import useStore from '@/stores/labels.js';
import { Chain } from '@/utils/chains';

interface UseLabels {
  requestLabels: (chain: Chain, addresses: Address[]) => Promise<void>;
  getLabel: (chain: Chain, address: Address) => Label | null;
  getLabelText: (chain: Chain, address: Address) => string | null;
}

function useLabels(): UseLabels {
  const store = useStore();

  async function requestLabels(
    chain: Chain,
    addresses: Address[],
  ): Promise<void> {
    // Fetch a label for every address only once
    const addressSet = new Set<Address>();
    for (const address of addresses) {
      const hasLabel = store.hasLabel(chain, address);
      if (!hasLabel) {
        addressSet.add(address);
      }
    }
    const uniqueAddresses = Array.from(addressSet);
    if (uniqueAddresses.length === 0) {
      return;
    }
    const labelService = new LabelService(chain);
    const labels: Record<Address, Label | null> =
      await labelService.getLabels(uniqueAddresses);
    // Add addresses that are missing labels
    for (const address of uniqueAddresses) {
      if (!labels[address]) {
        labels[address] = null;
      }
    }
    store.addLabels(chain, labels);
  }

  function getLabel(chain: Chain, address: Address): Label | null {
    return store.getLabel(chain, address);
  }

  function getLabelText(chain: Chain, address: Address): string | null {
    const label = getLabel(chain, address);
    return label
      ? label.namespace
        ? `${label.namespace.value} ${label.value}`
        : label.value
      : null;
  }

  return {
    requestLabels,
    getLabel,
    getLabelText,
  };
}

export default useLabels;
