interface RelativeTime {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
}
function toRelativeTime(from: Date, to: Date): RelativeTime {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  // Calculate time difference in milliseconds
  const diff = to.getTime() - from.getTime();

  // Define units and the corresponding milliseconds
  const units: Partial<Record<Intl.RelativeTimeFormatUnit, number>> = {
    second: SECOND,
    seconds: SECOND,
    minute: MINUTE,
    minutes: MINUTE,
    hour: HOUR,
    hours: HOUR,
    day: DAY,
    days: DAY,
    week: WEEK,
    weeks: WEEK,
    month: MONTH,
    months: MONTH,
    year: YEAR,
    years: YEAR,
  };

  // Find the most suitable unit
  let selectedUnit: Intl.RelativeTimeFormatUnit = 'second'; // Default unit
  for (const [unitString, value] of Object.entries(units)) {
    const unit = unitString as Intl.RelativeTimeFormatUnit;
    if (Math.abs(diff) >= value) {
      selectedUnit = unit;
    }
  }

  // Calculate the difference in the selected unit
  const unitSize = units[selectedUnit];
  if (!unitSize) {
    throw new Error('Invalid unit');
  }
  const value = Math.round(diff / unitSize);
  return {
    value,
    unit: selectedUnit,
  };
}

// eslint-disable-next-line import/prefer-default-export
export { toRelativeTime };
export type { RelativeTime };
