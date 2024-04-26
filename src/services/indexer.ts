import { Address, Hex } from 'viem';

import { CHAINS, Chain } from '@/utils/chains';

type UserOpChainSuffix = `UserOp_${Chain}`;

interface HashUserOpResponse {
  data: Record<
    UserOpChainSuffix,
    {
      success: boolean;
      entryPoint: string;
      blockNumber: number;
      transactionHash: string;
      sender: string;
      paymaster: string;
      bundler: string;
      nonce: string;
    }[]
  >;
}

interface TransactionUserOp {
  chainId: Chain;
  success: boolean;
  entryPoint: Address;
  blockNumber: number;
  transactionHash: Hex;
  sender: Address;
  paymaster: Address;
  bundler: Address;
  nonce: bigint;
}

interface UserOpsResponse {
  data: {
    UserOp: {
      chainId: string;
      success: boolean;
      entryPoint: string;
      blockNumber: number;
      transactionHash: string;
      hash: string;
      paymaster: string;
      bundler: string;
      nonce: string;
    }[];
  };
}

interface SenderUserOp {
  chainId: Chain;
  success: boolean;
  entryPoint: Address;
  blockNumber: number;
  transactionHash: Hex;
  hash: Hex;
  paymaster: Address;
  bundler: Address;
  nonce: bigint;
}

const ENDPOINT_URL = 'https://indexer.bigdevenergy.link/e64d4f6/v1/graphql';

class Service {
  public async getTransactionByUserOpHash(
    hash: Hex,
  ): Promise<TransactionUserOp | null> {
    const query = `{
      ${CHAINS.map((chain) => {
        return `UserOp_${chain}: UserOp(where: {
          id: {
            _eq: "${chain}-${hash}"
          }
        }
        ) {
          success
          entryPoint
          blockNumber
          transactionHash
          sender
          paymaster
          bundler
          nonce
        }`;
      })}
    }`;

    const response = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = (await response.json()) as HashUserOpResponse;
    for (const chain of CHAINS) {
      const userOp = json.data[`UserOp_${chain}`][0];
      if (userOp) {
        return {
          chainId: chain,
          success: userOp.success,
          entryPoint: userOp.entryPoint as Address,
          blockNumber: userOp.blockNumber,
          transactionHash: userOp.transactionHash as Hex,
          sender: userOp.sender as Address,
          paymaster: userOp.paymaster as Address,
          bundler: userOp.bundler as Address,
          nonce: BigInt(userOp.nonce),
        };
      }
    }
    return null;
  }

  public async getUserOpsByAddress(
    address: Address,
    offset: number,
    limit: number,
  ): Promise<SenderUserOp[]> {
    const query = `{
      UserOp(
        limit: ${limit},
        offset: ${offset},
        where: {
          sender: {
            _eq: "${address}"
          }
        }
      ) {
        chainId
        success
        entryPoint
        blockNumber
        transactionHash
        hash
        paymaster
        bundler
        nonce
      }
    }`;

    const response = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = (await response.json()) as UserOpsResponse;
    if (json.data.UserOp.length === 0) {
      return [];
    } else {
      return json.data.UserOp.map((userOp) => ({
        chainId: parseInt(userOp.chainId) as Chain,
        success: userOp.success,
        entryPoint: userOp.entryPoint as Address,
        blockNumber: userOp.blockNumber,
        transactionHash: userOp.transactionHash as Hex,
        hash: userOp.hash as Hex,
        paymaster: userOp.paymaster as Address,
        bundler: userOp.bundler as Address,
        nonce: BigInt(userOp.nonce),
      }));
    }
  }
}

export default Service;
export type { TransactionUserOp, SenderUserOp };
