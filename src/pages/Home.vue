<template>
  <div class="page">
    <div class="content">
      <div class="card">
        <form @submit.prevent="handleSubmit">
          <input v-model="userOpHash" />
        </form>
        <div v-if="userOp">
          <div>chain id: {{ userOp.chainId }}</div>
          <div>success: {{ userOp.success }}</div>
          <div>entry point: {{ userOp.entryPoint }}</div>
          <div>block number: {{ userOp.blockNumber }}</div>
          <div>transaction hash: {{ userOp.transactionHash }}</div>
          <div>sender: {{ userOp.sender }}</div>
          <div>paymaster: {{ userOp.paymaster }}</div>
          <div>bundler: {{ userOp.bundler }}</div>
          <div>nonce: {{ userOp.nonce }}</div>
        </div>
        <div v-if="transaction">
          <div>
            calldata
            <div class="hex">{{ transaction.input }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import useEnv from '@/composables/useEnv';
import EvmService, { Transaction } from '@/services/evm';
import IndexerService, { TransactionUserOp } from '@/services/indexer';
import { getChainClient } from '@/utils/chains';
import { isUserOpHash } from '@/utils/validation/pattern';

const { alchemyApiKey } = useEnv();

const indexerService = new IndexerService();

const userOpHash = ref('');
const userOp = ref<TransactionUserOp | null>(null);
const transaction = ref<Transaction | null>(null);

async function handleSubmit(): Promise<void> {
  userOp.value = null;
  transaction.value = null;
  const hash = userOpHash.value.trim().toLowerCase();
  if (!isUserOpHash(hash)) {
    return;
  }
  const transactionUserOp =
    await indexerService.getTransactionByUserOpHash(hash);
  if (!transactionUserOp) {
    return;
  }
  userOp.value = transactionUserOp;
  const chain = transactionUserOp.chainId;
  const client = getChainClient(chain, alchemyApiKey);
  const evmService = new EvmService(chain, client);
  transaction.value = await evmService.getTransaction(
    transactionUserOp.transactionHash,
  );
}
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.content {
  width: 100%;
  max-width: 800px;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 4px;
  background: #f5f5f5;
  gap: 16px;
}

input {
  width: 100%;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 2px;
  outline: none;
  background: transparent;

  &:focus {
    border-color: #888;
  }
}

.hex {
  --font-size: 13px;
  --row-count: 4;
  --line-height: 1.2;
  --padding: 8px;

  width: 100%;
  height: calc(
    var(--row-count) * var(--font-size) + (var(--row-count) - 1) *
      (var(--line-height) - 1) * var(--font-size) + var(--padding) * 2
  );
  padding: var(--padding);
  overflow: auto;
  font-family: var(--font-mono);
  font-size: var(--font-size);
  line-height: 1.2;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
