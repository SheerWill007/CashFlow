import type { Expense, Slice } from './types';
import { sum } from './format';

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

/** Each category keeps one colour everywhere (a colour-blind-safe order; light/dark steps live in CSS). */
export function colorOf(category: string) {
  const i = CATEGORIES.indexOf(category);
  return `var(--cat-${i === -1 ? 8 : i + 1})`;
}

export function byCategory(expenses: Expense[]): Slice[] {
  return CATEGORIES.map((name) => ({ name, amount: sum(expenses.filter((e) => e.category === name)) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}
