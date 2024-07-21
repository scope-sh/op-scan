import ky, { KyInstance } from 'ky';
import { Address } from 'viem';

import useEnv from '@/composables/useEnv';
import { Chain } from '@/utils/chains';

type LabelId =
  | 'wrapped'
  | 'erc20'
  | 'biconomy-v2-account'
  | 'kernel-v2-account'
  | 'kernel-v3-account'
  | 'safe-v1.3.0-account'
  | 'safe-v1.4.1-account';

interface LabelType {
  id: LabelId;
  value: string;
}

interface LabelNamespace {
  id: string;
  value: string;
}

interface Label {
  value: string;
  namespace?: LabelNamespace;
  type?: LabelType;
  iconUrl?: string;
  metadata?: Record<string, unknown>;
}

type LabelWithAddress = Label & {
  address: Address;
};

const { labelApiEndpoint } = useEnv();

class Service {
  chainId: Chain;
  client: KyInstance;

  constructor(chainId: Chain) {
    this.chainId = chainId;
    this.client = ky.create({
      prefixUrl: labelApiEndpoint,
    });
  }

  public async getLabel(address: Address): Promise<LabelWithAddress | null> {
    const response = await this.client.get('all', {
      searchParams: {
        chain: this.chainId,
        address,
      },
    });
    const labels = await response.json<Label[]>();
    if (labels.length === 0) {
      return null;
    }
    return { ...labels[0] } as LabelWithAddress;
  }

  public async getLabels(
    addresses: Address[],
  ): Promise<Record<Address, Label>> {
    const response = await this.client.post('primary', {
      searchParams: {
        chain: this.chainId,
      },
      json: { addresses },
    });
    const labels = await response.json<Record<Address, Label>>();
    return labels;
  }
}

export default Service;
export type { Label, LabelId };
