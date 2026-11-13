import type { Request } from 'express';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  pass_hash: string;
  salt: string;
  currency: string;
  income: number;
  fixed: number;
  savings: number;
  created_at: number;
}

export interface ExpenseRow {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  note: string;
  spent_on: string;
  created_at: number;
}

export type AuthedRequest = Request & { user: UserRow };

export const toPublicUser = (u: UserRow) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  currency: u.currency,
  income: u.income,
  fixed: u.fixed,
  savings: u.savings,
});

export const toExpense = (e: ExpenseRow) => ({
  id: e.id,
  amount: e.amount,
  category: e.category,
  note: e.note,
  date: e.spent_on,
});
