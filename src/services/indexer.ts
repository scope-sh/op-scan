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

interface ChainHashUserOpResponse {
  data: {
    UserOp: {
      success: boolean;
      entryPoint: string;
      blockNumber: number;
      transactionHash: string;
      sender: string;
      paymaster: string;
      bundler: string;
      nonce: string;
    }[];
  };
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

interface UserOpFeedResponse {
  data: {
    UserOp: {
      chainId: string;
      blockNumber: number;
      blockTimestamp: number;
      transactionHash: string;
      sender: string;
      bundler: string;
      paymaster: string;
      entryPoint: string;
      hash: string;
    }[];
  };
}

interface FeedUserOp {
  chainId: Chain;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  sender: Address;
  bundler: Address;
  paymaster: Address;
  entryPoint: Address;
  hash: Hex;
}

class Service {
  endpointUrl: string;

  constructor(endpointUrl: string) {
    this.endpointUrl = endpointUrl;
  }

  public async getUserOpByHash(hash: Hex): Promise<TransactionUserOp | null> {
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

    const response = await fetch(this.endpointUrl, {
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

  public async getUserOpByChainAndHash(
    chain: Chain,
    hash: Hex,
  ): Promise<TransactionUserOp | null> {
    const query = `{
      UserOp(where: {
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
      }
    }`;

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = (await response.json()) as ChainHashUserOpResponse;
    const userOp = json.data.UserOp[0];
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

    const response = await fetch(this.endpointUrl, {
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

  public async getLatestUserOps(limit: number): Promise<FeedUserOp[]> {
    const query = `{
      UserOp(
        limit: ${limit},
        order_by: {
          blockTimestamp: desc
        }
      ) {
        chainId
        blockNumber
        blockTimestamp
        transactionHash
        sender
        bundler
        paymaster
        entryPoint
        hash
      }
    }`;

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = (await response.json()) as UserOpFeedResponse;
    if (json.data.UserOp.length === 0) {
      return [];
    } else {
      return json.data.UserOp.map((userOp) => ({
        chainId: parseInt(userOp.chainId) as Chain,
        blockNumber: userOp.blockNumber,
        blockTimestamp: userOp.blockTimestamp,
        transactionHash: userOp.transactionHash as Hex,
        sender: userOp.sender as Address,
        bundler: userOp.bundler as Address,
        paymaster: userOp.paymaster as Address,
        entryPoint: userOp.entryPoint as Address,
        hash: userOp.hash as Hex,
      }));
    }
  }
}

export default Service;
export type { TransactionUserOp, SenderUserOp, FeedUserOp };
