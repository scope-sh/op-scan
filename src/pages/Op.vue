<template>
  <div class="page">
    <div class="content">
      <div class="card">
        <div class="header">
          <div class="hash">{{ hash }}</div>
          <IconCheckCircled
            v-if="userOpData && userOpData.success"
            class="icon icon-success"
          />
          <IconCrossCircled
            v-else-if="userOpData && !userOpData.success"
            class="icon icon-error"
          />
        </div>
        <div class="details">
          <Transition>
            <div
              v-if="userOpData && actualGasCost"
              class="description"
            >
              <div class="description-row">
                Operation
                <BlockInfo
                  :value="userOpData.nonce.toString()"
                  :label="`#${userOpData.nonce}`"
                  type="regular"
                  :chain="userOpData.chainId"
                />
                of account
                <BlockInfo
                  :value="userOpData.sender"
                  :label="
                    getAddressLabel(userOpData.chainId, userOpData.sender)
                  "
                  type="address"
                  :chain="userOpData.chainId"
                />
              </div>
              <div class="description-row">
                Paid
                <BlockInfo
                  :value="actualGasCost.toString()"
                  :label="formatEther(actualGasCost)"
                  type="regular"
                  :chain="userOpData.chainId"
                />
                by
                <BlockInfo
                  v-if="userOpData.paymaster !== zeroAddress"
                  :value="userOpData.paymaster"
                  :label="
                    getAddressLabel(userOpData.chainId, userOpData.paymaster)
                  "
                  type="address"
                  :chain="userOpData.chainId"
                />
                <template v-else>account itself</template>
              </div>
              <div class="description-row">
                Bundled by
                <BlockInfo
                  :value="userOpData.bundler"
                  :label="
                    getAddressLabel(userOpData.chainId, userOpData.bundler)
                  "
                  type="address"
                  :chain="userOpData.chainId"
                />
                using
                <BlockInfo
                  :value="userOpData.entryPoint"
                  :label="formatEntryPoint(userOpData.entryPoint)"
                  type="address"
                  :chain="userOpData.chainId"
                />
              </div>
              <div class="description-row">
                Settled on
                <BlockInfo
                  :value="userOpData.chainId.toString()"
                  :label="getChainName(userOpData.chainId)"
                  type="chain"
                  :chain="userOpData.chainId"
                />
                {{
                  formatRelativeTime(
                    toRelativeTime(
                      new Date(),
                      new Date(1000 * userOpData.timestamp),
                    ),
                  )
                }}
                at block
                <BlockInfo
                  :value="userOpData.blockNumber.toString()"
                  :label="userOpData.blockNumber.toString()"
                  type="block"
                  :chain="userOpData.chainId"
                />
                and transaction
                <BlockInfo
                  :value="userOpData.transactionHash"
                  :label="userOpData.transactionHash"
                  type="transaction"
                  :chain="userOpData.chainId"
                />
              </div>
            </div>
          </Transition>

          <Transition>
            <ViewCallData
              v-if="userOp"
              :value="userOp.callData"
            />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Address, Hex, formatUnits, zeroAddress } from 'viem';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import BlockInfo from '@/components/BlockInfo.vue';
import IconCheckCircled from '@/components/IconCheckCircled.vue';
import IconCrossCircled from '@/components/IconCrossCircled.vue';
import ViewCallData from '@/components/ViewCallData.vue';
import useEnv from '@/composables/useEnv';
import useLabels from '@/composables/useLabels';
import EvmService, { Transaction, TransactionReceipt } from '@/services/evm';
import IndexerService, { TransactionUserOp } from '@/services/indexer';
import {
  Chain,
  getChainClient,
  getChainName,
  parseChain,
} from '@/utils/chains';
import { toRelativeTime } from '@/utils/conversion';
import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  UserOp,
  getUserOpEvent,
  getUserOpHash,
  getUserOps,
} from '@/utils/entryPoint';
import { formatRelativeTime } from '@/utils/formatting';

const { alchemyApiKey, indexerEndpoint } = useEnv();
const { requestLabels, getLabelText } = useLabels();
const route = useRoute();

const hash = computed(() => route.params.hash as Hex);
const chain = computed(() => parseChain(route.query.chain as string));

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
  const transactionUserOp = chain.value
    ? await indexerService.getUserOpByChainAndHash(chain.value, hash.value)
    : await indexerService.getUserOpByHash(hash.value);
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

const actualGasCost = computed<bigint | null>(() =>
  userOpEvent.value ? userOpEvent.value.actualGasCost : null,
);

const addresses = computed<Address[]>(() => {
  if (!userOpData.value) {
    return [];
  }
  return [
    userOpData.value.sender,
    userOpData.value.bundler,
    userOpData.value.paymaster,
  ];
});

watch(addresses, () => {
  if (!userOpData.value) {
    return;
  }
  requestLabels(userOpData.value.chainId, addresses.value);
});

function formatEther(value: bigint): string {
  return `${formatNumber(fromWei(value, 18))} ETH`;
}

function formatEntryPoint(value: Address): string {
  if (value === ENTRY_POINT_0_6_ADDRESS) {
    return 'Entry Point 0.6';
  }
  if (value === ENTRY_POINT_0_7_ADDRESS) {
    return 'Entry Point 0.7';
  }
  return value;
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

function getAddressLabel(chain: Chain, address: Address): string {
  return getLabelText(chain, address) || address;
}
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin-top: 16px;
  padding: 8px;

  @media (width >= 768px) {
    margin-top: 10vh;
  }
}

.details {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-success {
  color: var(--color-success);
}

.icon-error {
  color: var(--color-error);
}

.back {
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  text-decoration: none;
  gap: 4px;

  &:hover {
    color: var(--color-text-primary);
  }

  .icon {
    width: 14px;
    height: 14px;
  }
}

.card {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: 32px 20px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background-primary);
  gap: 25px;
}

.header {
  display: flex;
  gap: 10px;
}

.hash {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 200;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  display: flex;
  gap: 10px;
  flex-direction: column;
  font-size: 16px;
}

.description-row {
  display: flex;
  gap: 2px 8px;
  flex-wrap: wrap;
  align-items: center;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
