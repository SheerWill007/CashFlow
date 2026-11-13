const pad = (n: number) => String(n).padStart(2, '0');

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(new Date());
export const thisMonth = () => today().slice(0, 7);
export const dayOf = (date: string) => Number(date.slice(8));
export const dateIn = (month: string, day: number) => `${month}-${pad(day)}`;

function parts(month: string): [number, number] {
  const [y = 1970, m = 1] = month.split('-').map(Number);
  return [y, m];
}

export function daysIn(month: string): number {
  const [y, m] = parts(month);
  return new Date(y, m, 0).getDate();
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = parts(month);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthName(month: string, opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }): string {
  const [y, m] = parts(month);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, opts);
}

export function dayLabel(date: string): string {
  if (date === today()) return 'Today';
  const [y = 1970, m = 1, d = 1] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
