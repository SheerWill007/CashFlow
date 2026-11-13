export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  income: number;
  fixed: number;
  savings: number;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface TrendPoint {
  month: string;
  total: number;
}

export interface MeResponse {
  user: User | null;
  categories: string[];
  currencies: string[];
}

export interface Slice {
  name: string;
  amount: number;
}
