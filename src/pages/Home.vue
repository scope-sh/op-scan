<template>
  <div class="page">
    <div class="content">
      <form @submit.prevent="handleSubmit">
        <input
          v-model="query"
          placeholder="Enter UserOp hash"
        />
      </form>
      <TableOpFeed
        :ops="opRows"
        :per-page="20"
        :page="1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import TableOpFeed, { UserOp as UserOpRow } from '@/components/TableOpFeed.vue';
import useEnv from '@/composables/useEnv';
import IndexerService, { FeedUserOp } from '@/services/indexer';
import { isUserOpHash } from '@/utils/validation/pattern';

const router = useRouter();
const { indexerEndpoint } = useEnv();

onMounted(() => {
  fetch();
});

const ops = ref<FeedUserOp[]>([]);
async function fetch(): Promise<void> {
  const LIMIT = 20;
  const indexerService = new IndexerService(indexerEndpoint);
  ops.value = await indexerService.getLatestUserOps(LIMIT);
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
  font-family: var(--font-mono);
  font-size: 16px;

  &:focus {
    background: var(--color-background-quaternary);
  }
}
</style>
