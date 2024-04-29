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

function getChainClient(chainId: Chain): PublicClient {
  const endpointUrl = getEndpointUrl(chainId);
  return createPublicClient({
    chain: getChainData(chainId),
    transport: http(endpointUrl),
  });
}

function getChainNativeSymbol(chainId: Chain): string {
  return getChainData(chainId).nativeCurrency.symbol;
}

function getChainName(chainId: Chain): string {
  return getChainData(chainId).name;
}

function getEndpointUrl(chainId: Chain): string {
  const chainData = getChainData(chainId);
  const endpointUrl = chainData.rpcUrls.default.http[0];
  if (!endpointUrl) {
    throw new Error(`No endpoint URL for chain ${chainId}`);
  }
  return endpointUrl;
}

function getExplorerUrl(chainId: Chain): string | null {
  const chainData = getChainData(chainId);
  return chainData.blockExplorers?.default.url || null;
}

function parseChain(value: string): Chain | null {
  const chain = CHAINS.find((chain) => value === chain.toString());
  return chain ?? null;
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
  getChainNativeSymbol,
  getChainName,
  getEndpointUrl,
  getExplorerUrl,
  parseChain,
};
export type { Chain };
