import type { User } from './types';

/** What is free to spend each month after fixed bills and savings. */
export const monthlyBudget = (u: Pick<User, 'income' | 'fixed' | 'savings'>) => u.income - u.fixed - u.savings;

/**
 * Today's allowance: the budget left after earlier days, spread over the days remaining
 * (today included). Spending less today raises tomorrow's allowance, and vice versa.
 */
export function dailyAllowance(budget: number, spentBeforeToday: number, daysLeftIncludingToday: number) {
  return Math.max(0, Math.round((budget - spentBeforeToday) / Math.max(1, daysLeftIncludingToday)));
}
