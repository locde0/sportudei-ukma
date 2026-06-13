const ukLocale = 'uk-UA';

const pad = (n: number) => String(n).padStart(2, '0');

export interface DatetimeParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(ukLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventDateTime(iso: string): string {
  return new Date(iso).toLocaleString(ukLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  return buildDatetimeLocal({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  });
}

export function parseDatetimeLocal(value: string): DatetimeParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    hours: Number(match[4]),
    minutes: Number(match[5]),
  };
}

export function buildDatetimeLocal(parts: DatetimeParts): string {
  return `${parts.year}-${pad(parts.month + 1)}-${pad(parts.day)}T${pad(parts.hours)}:${pad(parts.minutes)}`;
}

export function formatDatetimePreview(value: string): {
  weekday: string;
  day: string;
  monthYear: string;
  time: string;
} | null {
  const parts = parseDatetimeLocal(value);
  if (!parts) return null;

  const date = new Date(parts.year, parts.month, parts.day, parts.hours, parts.minutes);
  return {
    weekday: date.toLocaleDateString(ukLocale, { weekday: 'long' }),
    day: String(parts.day),
    monthYear: date.toLocaleDateString(ukLocale, { month: 'long', year: 'numeric' }),
    time: `${pad(parts.hours)}:${pad(parts.minutes)}`,
  };
}

export function formatDateButton(value: string): string {
  const parts = parseDatetimeLocal(value);
  if (!parts) return 'Оберіть дату';
  return `${pad(parts.day)}.${pad(parts.month + 1)}.${parts.year}`;
}

export function getCalendarMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(ukLocale, {
    month: 'long',
    year: 'numeric',
  });
}

export function getCalendarWeeks(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i += 1) days.push(null);
  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
