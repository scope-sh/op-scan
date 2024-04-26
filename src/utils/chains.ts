import { alchemy } from 'evm-providers';
import {
  PublicClient,
  createPublicClient,
  http,
  type Chain as ChainData,
} from 'viem';
import {
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
} from 'viem/chains';

const ETHEREUM = mainnet.id;
const SEPOLIA = sepolia.id;
const OPTIMISM = optimism.id;
const OPTIMISM_SEPOLIA = optimismSepolia.id;
const BASE = base.id;
const BASE_SEPOLIA = baseSepolia.id;
const POLYGON = polygon.id;
const POLYGON_AMOY = polygonAmoy.id;
const ARBITRUM = arbitrum.id;
const ARBITRUM_SEPOLIA = arbitrumSepolia.id;

type Chain =
  | typeof ETHEREUM
  | typeof SEPOLIA
  | typeof OPTIMISM
  | typeof OPTIMISM_SEPOLIA
  | typeof BASE
  | typeof BASE_SEPOLIA
  | typeof POLYGON
  | typeof POLYGON_AMOY
  | typeof ARBITRUM
  | typeof ARBITRUM_SEPOLIA;

const DEFAULT_CHAIN = ETHEREUM;

const CHAINS: Chain[] = [
  ETHEREUM,
  SEPOLIA,
  OPTIMISM,
  OPTIMISM_SEPOLIA,
  BASE,
  BASE_SEPOLIA,
  POLYGON,
  POLYGON_AMOY,
  ARBITRUM,
  ARBITRUM_SEPOLIA,
];

function getChainData(chainId: Chain): ChainData {
  switch (chainId) {
    case ETHEREUM:
      return mainnet;
    case SEPOLIA:
      return sepolia;
    case OPTIMISM:
      return optimism;
    case OPTIMISM_SEPOLIA:
      return optimismSepolia;
    case BASE:
      return base;
    case BASE_SEPOLIA:
      return baseSepolia;
    case POLYGON:
      return polygon;
    case POLYGON_AMOY:
      return polygonAmoy;
    case ARBITRUM:
      return arbitrum;
    case ARBITRUM_SEPOLIA:
      return arbitrumSepolia;
  }
}

function getChainClient(chainId: Chain, alchemyKey: string): PublicClient {
  const endpointUrl = getEndpointUrl(chainId, alchemyKey);
  return createPublicClient({
    chain: getChainData(chainId),
    transport: http(endpointUrl),
  });
}

function getChainName(chainId: Chain): string {
  return getChainData(chainId).name;
}

function getEndpointUrl(chainId: Chain, alchemyKey: string): string {
  return alchemy(chainId, alchemyKey);
}

export {
  CHAINS,
  DEFAULT_CHAIN,
  ETHEREUM,
  SEPOLIA,
  OPTIMISM,
  OPTIMISM_SEPOLIA,
  BASE,
  BASE_SEPOLIA,
  POLYGON,
  POLYGON_AMOY,
  ARBITRUM,
  ARBITRUM_SEPOLIA,
  getChainClient,
  getChainData,
  getChainName,
  getEndpointUrl,
};
export type { Chain };
