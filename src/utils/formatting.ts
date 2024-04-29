import { formatUnits } from 'viem';

import { Chain, getChainNativeSymbol } from './chains';
import { RelativeTime } from './conversion';

function formatRelativeTime({ value, unit }: RelativeTime): string {
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return format.format(value, unit);
}

function formatNative(chain: Chain, value: bigint): string {
  const nativeSymbol = getChainNativeSymbol(chain);
  return `${formatNumber(fromWei(value, 18))} ${nativeSymbol}`;
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

export { formatRelativeTime, formatNative };
