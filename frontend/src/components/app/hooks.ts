'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Expense, TrendPoint } from '@/lib/types';

function useFetch<T>(url: string, version: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    setError('');
    api<T>('GET', url)
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [url, version]);
  return { data, error };
}

export function useExpenses(month: string, version: number) {
  const { data, error } = useFetch<{ expenses: Expense[] }>(`/api/expenses?month=${month}`, version);
  // Hide the previous month's rows while the new month loads.
  const fresh = data && data.expenses.every((e) => e.date.startsWith(month));
  return { expenses: fresh ? data.expenses : null, error };
}

export function useTrend(month: string, version: number) {
  const { data, error } = useFetch<{ months: TrendPoint[] }>(`/api/trend?month=${month}`, version);
  const fresh = data && data.months[data.months.length - 1]?.month === month;
  return { months: fresh ? data.months : null, error };
}
