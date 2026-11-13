import { sum } from './format';
import type { Expense, Slice } from './types';

export const CATEGORIES = [
  'Food & dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Bills & utilities',
  'Health',
  'Entertainment',
  'Other',
];

export const CURRENCY_LABELS = ['₹ INR', '$ USD', '€ EUR', '£ GBP', 'د.إ AED', 'C$ CAD', 'A$ AUD', 'S$ SGD'];

/** Each category keeps one colour everywhere (a colour-blind-safe order; light/dark steps live in CSS). */
export function colorOf(category: string): string {
  const i = CATEGORIES.indexOf(category);
  return `var(--cat-${i === -1 ? 8 : i + 1})`;
}

export function byCategory(expenses: Expense[]): Slice[] {
  return CATEGORIES.map((name) => ({ name, amount: sum(expenses.filter((e) => e.category === name)) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}
