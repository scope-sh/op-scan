<template>
  <div class="page">
    <div class="content">
      <form @submit.prevent="handleSubmit">
        <input
          v-model="query"
          placeholder="Enter UserOp hash"
        />
      </form>

      <div class="recent">
        <div class="select">
          <SelectChain
            v-model="chain"
            :options="chains"
            placeholder="Select chain"
          />
        </div>
        <TableOpFeed
          :ops="opRows"
          :per-page="20"
          :page="1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { Address } from 'viem';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import SelectChain from '@/components/SelectChain.vue';
import TableOpFeed, { UserOp as UserOpRow } from '@/components/TableOpFeed.vue';
import useEnv from '@/composables/useEnv';
import useLabels from '@/composables/useLabels';
import IndexerService, { FeedUserOp } from '@/services/indexer';
import { CHAINS, Chain, getChainName } from '@/utils/chains';
import { isUserOpHash } from '@/utils/validation/pattern';

const router = useRouter();
const { requestLabels } = useLabels();
const { indexerEndpoint } = useEnv();

onMounted(() => {
  fetch();
});

useIntervalFn(() => {
  fetch();
}, 5000);

const ops = ref<FeedUserOp[]>([]);
async function fetch(): Promise<void> {
  const LIMIT = 20;
  const indexerService = new IndexerService(indexerEndpoint);
  const startTimestamp =
    ops.value[0]?.blockTimestamp || Math.floor(Date.now() / 1000) - 60 * 60;
  const newOps = await indexerService.getLatestUserOps(
    LIMIT,
    startTimestamp,
    chain.value || undefined,
  );
  const opList = [...newOps, ...ops.value];
  opList.sort((a, b) => b.blockTimestamp - a.blockTimestamp);
  ops.value = opList.slice(0, LIMIT);
}
const opRows = computed(() =>
  ops.value.map((op) => {
    return {
      chain: op.chainId,
      timestamp: op.blockTimestamp,
      blockNumber: op.blockNumber,
      transactionHash: op.transactionHash,
      sender: op.sender,
      bundler: op.bundler,
      paymaster: op.paymaster,
      entryPoint: op.entryPoint,
      hash: op.hash,
    } as UserOpRow;
  }),
);

const query = ref('');
function handleSubmit(): void {
  if (!isUserOpHash(query.value)) {
    return;
  }
  router.push({ name: 'op', params: { hash: query.value } });
}

const chain = ref<Chain | null>(null);
const chains = computed(() =>
  (
    [
      {
        value: null,
        label: 'All chains',
      },
    ] as {
      value: Chain | null;
      label: string;
    }[]
  ).concat(
    ...CHAINS.map((chain) => {
      return {
        value: chain,
        label: getChainName(chain),
      };
    }),
  ),
);
watch(chain, () => {
  ops.value = [];
  fetch();
});

const addresses = computed<Record<Chain, Address[]>>(() => {
  return Object.fromEntries(
    CHAINS.map((chain) => {
      return [
        chain,
        ops.value
          .filter((op) => op.chainId === chain)
          .map((op) => [op.sender, op.bundler, op.paymaster])
          .flat(),
      ];
    }),
  ) as Record<Chain, Address[]>;
});

watch(addresses, () => {
  for (const chain of CHAINS) {
    const chainAddresses = addresses.value[chain];
    requestLabels(chain, chainAddresses);
  }
});
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  display: flex;
  gap: 48px;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin-top: 16px;
  padding: 8px;

  @media (width >= 768px) {
    gap: 88px;
    margin-top: 96px;
  }
}

input {
  width: 100%;
  padding: 7px;
  border: none;
  border-radius: 4px;
  outline: none;
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 16px;

  &:focus {
    background: var(--color-background-quaternary);
  }
}

.recent {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.select {
  width: 160px;
}
</style>
