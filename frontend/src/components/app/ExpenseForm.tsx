'use client';

import { useRef, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { today } from '@/lib/dates';
import { money, parseMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';
import { useToast } from '../providers/ToastProvider';
import { Icon } from '../ui/Icon';
import { useApp } from './AppShell';

export function ExpenseForm({ defaultDate }: { defaultDate: string }) {
  const { categories, user, changed } = useApp();
  const toast = useToast();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const amount = parseMoney(String(data.get('amount') ?? ''));
    setError('');
    if (!amount) {
      setError('Enter an amount greater than zero');
      return;
    }
    setBusy(true);
    try {
      const { expense } = await api<{ expense: Expense }>('POST', '/api/expenses', {
        amount,
        category: data.get('category'),
        date: data.get('date'),
        note: data.get('note'),
      });
      toast(`Added ${money(expense.amount, user.currency)}`);
      const amountInput = form.current?.elements.namedItem('amount') as HTMLInputElement | null;
      const noteInput = form.current?.elements.namedItem('note') as HTMLInputElement | null;
      if (amountInput) amountInput.value = '';
      if (noteInput) noteInput.value = '';
      amountInput?.focus();
      changed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={form} onSubmit={submit}>
      <div className="add-form">
        <label className="field">
          Amount
          <input name="amount" inputMode="decimal" placeholder="0.00" required autoComplete="off" />
        </label>
        <label className="field">
          Category
          <select name="category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Date
          <input name="date" type="date" defaultValue={defaultDate} max={today()} required key={defaultDate} />
        </label>
        <label className="field">
          Note (optional)
          <input name="note" maxLength={140} placeholder="e.g. lunch with Sam" />
        </label>
        <button className="btn primary" type="submit" disabled={busy}>
          <Icon name="plus" size={16} /> Add expense
        </button>
      </div>
      <div className="error" role="alert">
        {error}
      </div>
    </form>
  );
}
