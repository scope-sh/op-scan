<template>
  <div class="page">
    <div class="content">
      <div class="card">
        <form @submit.prevent="handleSubmit">
          <input v-model="query" />
        </form>
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
import {
  Address,
  Hex,
  decodeEventLog,
  decodeFunctionData,
  encodeAbiParameters,
  formatUnits,
  keccak256,
} from 'viem';
import { computed, ref } from 'vue';

import entryPointV_0_6_0Abi from '@/abi/entryPointV0_6_0';
import entryPointV_0_7_0Abi from '@/abi/entryPointV0_7_0';
import IconEtherscan from '@/components/IconEtherscan.vue';
import useEnv from '@/composables/useEnv';
import EvmService, { Transaction, TransactionReceipt } from '@/services/evm';
import IndexerService, { TransactionUserOp } from '@/services/indexer';
import { Chain, getChainClient, getExplorerUrl } from '@/utils/chains';
import { isUserOpHash } from '@/utils/validation/pattern';

interface UserOp_0_6 {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
}

interface UserOp_0_7 {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  accountGasLimits: Hex;
  preVerificationGas: bigint;
  gasFees: Hex;
  paymasterAndData: Hex;
  signature: Hex;
}

type UserOp = UserOp_0_6 | UserOp_0_7;

type TxType =
  | typeof TX_TYPE_ENTRY_POINT_0_6
  | typeof TX_TYPE_ENTRY_POINT_0_7
  | typeof TX_TYPE_UNKNOWN;

const TX_TYPE_ENTRY_POINT_0_6 = 'Entry Point 0.6';
const TX_TYPE_ENTRY_POINT_0_7 = 'Entry Point 0.7';
const TX_TYPE_UNKNOWN = 'Unknown';

const ENTRY_POINT_0_6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
const ENTRY_POINT_0_7_ADDRESS = '0x0000000071727de22e5e9d8baf0edac6f37da032';

const { alchemyApiKey, indexerEndpoint } = useEnv();

const indexerService = new IndexerService(indexerEndpoint);

const query = ref('');
const userOpHash = ref('');
const userOpData = ref<TransactionUserOp | null>(null);
const transaction = ref<Transaction | null>(null);
const transactionReceipt = ref<TransactionReceipt | null>(null);

async function handleSubmit(): Promise<void> {
  const hash = query.value.trim().toLowerCase();
  if (!isUserOpHash(hash)) {
    return;
  }
  userOpHash.value = hash;
  userOpData.value = null;
  transaction.value = null;
  transactionReceipt.value = null;
  const transactionUserOp =
    await indexerService.getTransactionByUserOpHash(hash);
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

function getUserOps(transaction: Transaction): UserOp[] {
  function getTxType(transaction: Transaction): TxType {
    if (transaction.to === ENTRY_POINT_0_6_ADDRESS) {
      return TX_TYPE_ENTRY_POINT_0_6;
    }
    if (transaction.to === ENTRY_POINT_0_7_ADDRESS) {
      return TX_TYPE_ENTRY_POINT_0_7;
    }
    return TX_TYPE_UNKNOWN;
  }

  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRY_POINT_0_6) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV_0_6_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as UserOp_0_6[];
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_7) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV_0_7_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as UserOp_0_7[];
  }
  return [];
}

function getUserOpHash(
  chain: Chain,
  entryPoint: Address,
  userOp: UserOp,
): Hex | null {
  if (entryPoint === ENTRY_POINT_0_6_ADDRESS) {
    const userOperation = userOp as UserOp_0_6;
    const hashedInitCode = keccak256(userOperation.initCode);
    const hashedCallData = keccak256(userOperation.callData);
    const hashedPaymasterAndData = keccak256(userOperation.paymasterAndData);

    const packedUserOp = encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'bytes32' },
      ],
      [
        userOperation.sender,
        userOperation.nonce,
        hashedInitCode,
        hashedCallData,
        userOperation.callGasLimit,
        userOperation.verificationGasLimit,
        userOperation.preVerificationGas,
        userOperation.maxFeePerGas,
        userOperation.maxPriorityFeePerGas,
        hashedPaymasterAndData,
      ],
    );
    const encoded = encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
      [keccak256(packedUserOp), entryPoint, BigInt(chain)],
    ) as `0x${string}`;
    return keccak256(encoded);
  } else if (entryPoint === ENTRY_POINT_0_7_ADDRESS) {
    const userOperation = userOp as UserOp_0_7;
    const hashedInitCode = keccak256(userOperation.initCode);
    const hashedCallData = keccak256(userOperation.callData);
    const hashedPaymasterAndData = keccak256(userOperation.paymasterAndData);
    const packedUserOp = encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
      ],
      [
        userOperation.sender,
        userOperation.nonce,
        hashedInitCode,
        hashedCallData,
        userOperation.accountGasLimits,
        userOperation.preVerificationGas,
        userOperation.gasFees,
        hashedPaymasterAndData,
      ],
    );
    const encoded = encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
      [keccak256(packedUserOp), entryPoint, BigInt(chain)],
    );
    return keccak256(encoded);
  }
  return null;
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
        getUserOpHash(data.chainId, data.entryPoint, userOp) ===
        userOpHash.value,
    ) || null
  );
});

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

const actualGasUsed = computed<bigint | null>(() =>
  userOpEvent.value ? userOpEvent.value.args.actualGasUsed : null,
);
const actualGasCost = computed<bigint | null>(() =>
  userOpEvent.value ? userOpEvent.value.args.actualGasCost : null,
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
