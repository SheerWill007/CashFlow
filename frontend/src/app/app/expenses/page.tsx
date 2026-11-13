'use client';

import { Fragment } from 'react';
import { useApp } from '@/components/app/AppShell';
import { ExpenseForm } from '@/components/app/ExpenseForm';
import { ExpenseRow } from '@/components/app/ExpenseRow';
import { useExpenses } from '@/components/app/hooks';
import { Card, MonthSwitch, PageHead, Skeleton } from '@/components/app/parts';
import { Icon } from '@/components/ui/Icon';
import { dayLabel, monthName, thisMonth, today } from '@/lib/dates';
import { money, plural, sum } from '@/lib/format';
import type { Expense } from '@/lib/types';

export default function ExpensesPage() {
  const { user, month, version } = useApp();
  const { expenses, error } = useExpenses(month, version);
  const defaultDate = month === thisMonth() ? today() : `${month}-01`;

  const byDay = new Map<string, Expense[]>();
  for (const e of expenses ?? []) {
    const list = byDay.get(e.date) ?? [];
    list.push(e);
    byDay.set(e.date, list);
  }

  return (
    <>
      <PageHead title="Expenses">
        <MonthSwitch />
      </PageHead>
      <div className="stack">
        <Card title="Add an expense">
          <ExpenseForm defaultDate={defaultDate} />
        </Card>
        {error ? (
          <Card><p className="error">{error}</p></Card>
        ) : !expenses ? (
          <Card><Skeleton rows={4} /></Card>
        ) : (
          <Card
            title={`${plural(expenses.length, 'expense')} · ${money(sum(expenses), user.currency)}`}
            actions={
              expenses.length > 0 && (
                <a className="btn" href={`/api/export.csv?month=${month}`}>
                  <Icon name="download" size={16} /> Export CSV
                </a>
              )
            }
          >
            {expenses.length ? (
              <div className="list">
                {[...byDay].map(([date, items]) => (
                  <Fragment key={date}>
                    <div className="day-head">
                      <span>{dayLabel(date)}</span>
                      <span>{money(sum(items), user.currency)}</span>
                    </div>
                    {items.map((e) => (
                      <ExpenseRow key={e.id} expense={e} />
                    ))}
                  </Fragment>
                ))}
              </div>
            ) : (
              <p className="empty">No expenses in {monthName(month)}.</p>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
