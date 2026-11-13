// Money is stored in minor units (paise, cents...). `locale` is fixed on the landing page
// so server and browser render the same text; inside the app it follows the browser.

export function money(minor: number, currency = 'INR', opts: Intl.NumberFormatOptions = {}, locale?: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, ...opts }).format(minor / 100);
}

export const moneyShort = (minor: number, currency = 'INR', locale?: string) =>
  money(minor, currency, { notation: 'compact', maximumFractionDigits: 1 }, locale);

export const moneyWhole = (minor: number, currency = 'INR', locale?: string) =>
  money(minor, currency, { maximumFractionDigits: 0 }, locale);

/** "1,250.50" -> 125050. Returns null for anything that isn't a non-negative number. */
export function parseMoney(text: string): number | null {
  const n = Number(String(text).replace(/,/g, '').trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export const sum = (list: { amount: number }[]) => list.reduce((t, e) => t + e.amount, 0);

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
