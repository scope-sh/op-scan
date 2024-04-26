import type {
  Hex,
  Log,
  PublicClient,
  Transaction,
  TransactionReceipt,
} from 'viem';

import type { Chain } from '@/utils/chains';

class Service {
  chainId: Chain;
  client: PublicClient;

  constructor(chainId: Chain, client: PublicClient) {
    this.chainId = chainId;
    this.client = client;
  }

  public async getLatestBlock(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }

  public async getTransaction(hash: Hex): Promise<Transaction | null> {
    try {
      const transaction = await this.client.getTransaction({
        hash,
      });
      return transaction || null;
    } catch (e) {
      return null;
    }
  }

  public async getTransactionReceipt(
    hash: Hex,
  ): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.client.getTransactionReceipt({
        hash,
      });
      return receipt || null;
    } catch (e) {
      return null;
    }
  }
}

export default Service;
export type { Log, Transaction, TransactionReceipt };
