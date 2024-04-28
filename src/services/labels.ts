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

  constructor(chainId: Chain) {
    this.chainId = chainId;
  }

  public async getLabel(address: Address): Promise<LabelWithAddress | null> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
      address,
    };
    const url = new URL(`${labelApiEndpoint}/one`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);
    const label: LabelWithAddress | null = await response.json();
    return label;
  }

  public async getLabels(
    addresses: Address[],
  ): Promise<Record<Address, Label>> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
    };
    const body = JSON.stringify({ addresses });
    const url = new URL(`${labelApiEndpoint}/many`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const labels: Record<Address, Label> = await response.json();
    return labels;
  }
}

export default Service;
export type { Label, LabelId };
