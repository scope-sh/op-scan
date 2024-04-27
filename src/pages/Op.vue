<template>
  <div class="page">
    <div class="content">
      <div class="card">
        <div v-if="userOpData">
          <div>chain id: {{ userOpData.chainId }}</div>
          <div>success: {{ userOpData.success }}</div>
          <div>entry point: {{ userOpData.entryPoint }}</div>
          <div>block number: {{ userOpData.blockNumber }}</div>
          <div class="row-link">
            transaction hash: {{ userOpData.transactionHash }}
            <a
              :href="
                getTransactionExplorerUrl(
                  userOpData.chainId,
                  userOpData.transactionHash,
                )
              "
              target="_blank"
            >
              <IconEtherscan class="icon" />
            </a>
          </div>
          <div class="row-link">
            sender: {{ userOpData.sender }}
            <a
              :href="
                getAddressExplorerUrl(userOpData.chainId, userOpData.sender)
              "
              target="_blank"
            >
              <IconEtherscan class="icon" />
            </a>
          </div>
          <div class="row-link">
            paymaster: {{ userOpData.paymaster }}
            <a
              :href="
                getAddressExplorerUrl(userOpData.chainId, userOpData.paymaster)
              "
              target="_blank"
            >
              <IconEtherscan class="icon" />
            </a>
          </div>
          <div class="row-link">
            bundler: {{ userOpData.bundler }}
            <a
              :href="
                getAddressExplorerUrl(userOpData.chainId, userOpData.bundler)
              "
              target="_blank"
            >
              <IconEtherscan class="icon" />
            </a>
          </div>
          <div>nonce: {{ userOpData.nonce }}</div>
        </div>
        <div v-if="userOp">
          <div>
            calldata
            <div class="hex">{{ userOp.callData }}</div>
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
import { Address, Hex, formatUnits } from 'viem';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import IconEtherscan from '@/components/IconEtherscan.vue';
import useEnv from '@/composables/useEnv';
import EvmService, { Transaction, TransactionReceipt } from '@/services/evm';
import IndexerService, { TransactionUserOp } from '@/services/indexer';
import { Chain, getChainClient, getExplorerUrl } from '@/utils/chains';
import { getUserOpEvent, getUserOpHash, getUserOps } from '@/utils/entryPoint';
import type { UserOp } from '@/utils/entryPoint';

const { alchemyApiKey, indexerEndpoint } = useEnv();
const route = useRoute();

const hash = computed(() => route.params.hash as Hex);

const indexerService = new IndexerService(indexerEndpoint);

const userOpData = ref<TransactionUserOp | null>(null);
const transaction = ref<Transaction | null>(null);
const transactionReceipt = ref<TransactionReceipt | null>(null);

watch(
  hash,
  () => {
    if (hash.value) {
      fetch();
    }
  },
  {
    immediate: true,
  },
);

async function fetch(): Promise<void> {
  userOpData.value = null;
  transaction.value = null;
  transactionReceipt.value = null;
  const transactionUserOp = await indexerService.getTransactionByUserOpHash(
    hash.value,
  );
  if (!transactionUserOp) {
    return;
  }
  userOpData.value = transactionUserOp;
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

const userOp = computed<UserOp | null>(() => {
  const data = userOpData.value;
  if (!transaction.value || !data) {
    return null;
  }
  const userOps = getUserOps(transaction.value);
  return (
    userOps.find(
      (userOp) =>
        getUserOpHash(data.chainId, data.entryPoint, userOp) === hash.value,
    ) || null
  );
});

const userOpEvent = computed(() => {
  if (!transactionReceipt.value) {
    return null;
  }
  return getUserOpEvent(transactionReceipt.value, hash.value);
});

const actualGasUsed = computed<bigint | null>(() =>
  userOpEvent.value ? userOpEvent.value.actualGasUsed : null,
);
const actualGasCost = computed<bigint | null>(() =>
  userOpEvent.value ? userOpEvent.value.actualGasCost : null,
);
const actualGasFee = computed<bigint | null>(() => {
  if (!actualGasCost.value || !actualGasUsed.value) {
    return null;
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

function getAddressExplorerUrl(chain: Chain, address: Address): string {
  const explorerUrl = getExplorerUrl(chain);
  return `${explorerUrl}/address/${address}`;
}

function getTransactionExplorerUrl(chain: Chain, hash: Hex): string {
  const explorerUrl = getExplorerUrl(chain);
  return `${explorerUrl}/tx/${hash}`;
}
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--color-background-secondary);
}

.content {
  width: 100%;
  max-width: 800px;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  gap: 16px;
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

a {
  color: inherit;
}

.icon {
  width: 16px;
  height: 16px;
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
}

.row-link {
  display: flex;
  gap: 4px;
}
</style>
