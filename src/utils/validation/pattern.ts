import { Address, Hex } from 'viem';

function isAddress(value: string): value is Address {
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  return !!value.match(addressRegex);
}

function isUserOpHash(value: string): value is Hex {
  const hashRegex = /^0x[0-9a-f]{64}$/;
  return !!value.match(hashRegex);
}

export { isAddress, isUserOpHash };
