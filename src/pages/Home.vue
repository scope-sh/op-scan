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
        <div v-if="actualGasCost && actualGasUsed && actualGasFee">
          <div>gas used: {{ actualGasUsed }}</div>
          <div>gas fee: {{ formatGasPrice(actualGasFee) }}</div>
          <div>cost: {{ formatEther(actualGasCost) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Hex, decodeEventLog, formatUnits } from 'viem';
import { computed, ref } from 'vue';

import useEnv from '@/composables/useEnv';
import EvmService, { Transaction, TransactionReceipt } from '@/services/evm';
import IndexerService, { TransactionUserOp } from '@/services/indexer';
import { Chain, getChainClient } from '@/utils/chains';
import { isUserOpHash } from '@/utils/validation/pattern';

const { alchemyApiKey } = useEnv();

const indexerService = new IndexerService();

const userOpHash = ref('');
const userOp = ref<TransactionUserOp | null>(null);
const transaction = ref<Transaction | null>(null);
const transactionReceipt = ref<TransactionReceipt | null>(null);

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
  await Promise.all([
    fetchTransaction(
      transactionUserOp.chainId,
      transactionUserOp.transactionHash,
    ),
    fetchTransactionReceipt(
      transactionUserOp.chainId,
      transactionUserOp.transactionHash,
    ),
  ]);
}

async function fetchTransaction(chain: Chain, hash: Hex): Promise<void> {
  const client = getChainClient(chain, alchemyApiKey);
  const evmService = new EvmService(chain, client);
  transaction.value = await evmService.getTransaction(hash);
}

async function fetchTransactionReceipt(chain: Chain, hash: Hex): Promise<void> {
  const client = getChainClient(chain, alchemyApiKey);
  const evmService = new EvmService(chain, client);
  transactionReceipt.value = await evmService.getTransactionReceipt(hash);
}

const userOpEvent = computed(() => {
  if (!transactionReceipt.value) {
    return null;
  }
  const log = transactionReceipt.value.logs.find(
    (log) =>
      log.topics[0] ===
        '0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f' &&
      log.topics[1] === userOpHash.value,
  );
  if (!log) {
    return null;
  }
  const event = decodeEventLog({
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'userOpHash',
            type: 'bytes32',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'paymaster',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            indexed: false,
            internalType: 'bool',
            name: 'success',
            type: 'bool',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'actualGasCost',
            type: 'uint256',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'actualGasUsed',
            type: 'uint256',
          },
        ],
        name: 'UserOperationEvent',
        type: 'event',
      },
    ],
    data: log.data,
    topics: log.topics,
  });
  return event;
});

const actualGasUsed = computed<bigint | undefined>(
  () => userOpEvent.value?.args.actualGasUsed,
);
const actualGasCost = computed<bigint | undefined>(
  () => userOpEvent.value?.args.actualGasCost,
);
const actualGasFee = computed<bigint | undefined>(() => {
  if (!actualGasCost.value || !actualGasUsed.value) {
    return undefined;
  }
  return actualGasCost.value / actualGasUsed.value;
});

function formatEther(value: bigint): string {
  return `${formatNumber(fromWei(value, 18))} ETH`;
}

function formatGasPrice(value: bigint): string {
  return `${formatNumber(fromWei(value, 9))} Gwei`;
}

function formatNumber(value: number): string {
  const valueFormat = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
  return valueFormat.format(value);
}

function fromWei(value: bigint | number, decimals: number): number {
  if (typeof value === 'bigint') {
    return parseFloat(formatUnits(value, decimals));
  }
  return parseFloat(formatUnits(BigInt(value.toString()), decimals));
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
