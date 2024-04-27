import { RelativeTime } from './conversion';

function formatRelativeTime({ value, unit }: RelativeTime): string {
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return format.format(value, unit);
}

// eslint-disable-next-line import/prefer-default-export
export { formatRelativeTime };
