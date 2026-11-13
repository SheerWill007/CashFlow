'use client';

import { api } from '@/lib/api';
import { colorOf } from '@/lib/categories';
import { dayLabel } from '@/lib/dates';
import { money } from '@/lib/format';
import type { Expense } from '@/lib/types';
import { useToast } from '../providers/ToastProvider';
import { Icon } from '../ui/Icon';
import { useApp } from './AppShell';

export function ExpenseRow({ expense: e, showDate = false }: { expense: Expense; showDate?: boolean }) {
  const { user, changed } = useApp();
  const toast = useToast();

  async function remove() {
    if (!window.confirm(`Delete ${money(e.amount, user.currency)} · ${e.category}?`)) return;
    try {
      await api('DELETE', `/api/expenses/${e.id}`);
      toast('Expense deleted');
      changed();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete');
    }
  }

  const sub = [e.note ? e.category : null, showDate ? dayLabel(e.date) : null].filter(Boolean).join(' · ');
  return (
    <div className="row">
      <span className="dot" style={{ background: colorOf(e.category) }} />
      <div className="what">
        <div>{e.note || e.category}</div>
        {sub && <div className="muted small">{sub}</div>}
      </div>
      <span className="amt">{money(e.amount, user.currency)}</span>
      <button className="del" aria-label={`Delete ${e.note || e.category}`} title="Delete" onClick={remove}>
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
