import {
  Address,
  Hex,
  Transaction,
  TransactionReceipt,
  decodeEventLog,
  decodeFunctionData,
  encodeAbiParameters,
  keccak256,
} from 'viem';

import entryPointV_0_6_0Abi from '@/abi/entryPointV0_6_0';
import entryPointV_0_7_0Abi from '@/abi/entryPointV0_7_0';

import { Chain } from './chains';

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

interface UserOpEvent {
  userOpHash: Hex;
  sender: Address;
  paymaster: Address;
  nonce: bigint;
  success: boolean;
  actualGasCost: bigint;
  actualGasUsed: bigint;
}

type TxType =
  | typeof TX_TYPE_ENTRY_POINT_0_6
  | typeof TX_TYPE_ENTRY_POINT_0_7
  | typeof TX_TYPE_UNKNOWN;

const TX_TYPE_ENTRY_POINT_0_6 = 'Entry Point 0.6';
const TX_TYPE_ENTRY_POINT_0_7 = 'Entry Point 0.7';
const TX_TYPE_UNKNOWN = 'Unknown';

const ENTRY_POINT_0_6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
const ENTRY_POINT_0_7_ADDRESS = '0x0000000071727de22e5e9d8baf0edac6f37da032';

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

function getUserOpEvent(
  transactionReceipt: TransactionReceipt,
  hash: Hex,
): UserOpEvent | null {
  const log = transactionReceipt.logs.find(
    (log) =>
      log.topics[0] ===
        '0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f' &&
      log.topics[1] === hash,
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
  return event.args;
}

export {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  getUserOps,
  getUserOpHash,
  getUserOpEvent,
};
export type { UserOp };
