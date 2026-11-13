'use client';

import Link from 'next/link';
import { useApp } from '@/components/app/AppShell';
import { ExpenseForm } from '@/components/app/ExpenseForm';
import { ExpenseRow } from '@/components/app/ExpenseRow';
import { useExpenses } from '@/components/app/hooks';
import { Card, PageHead, Skeleton, Tile } from '@/components/app/parts';
import { BudgetMeter } from '@/components/charts/BudgetMeter';
import { Donut } from '@/components/charts/Donut';
import { dailyAllowance, monthlyBudget } from '@/lib/budget';
import { byCategory } from '@/lib/categories';
import { dayOf, daysIn, monthName, thisMonth, today } from '@/lib/dates';
import { money, plural, sum } from '@/lib/format';

export default function TodayPage() {
  const { user, version } = useApp();
  const month = thisMonth();
  const date = today();
  const { expenses, error } = useExpenses(month, version);
  const first = user.name.split(' ')[0];
  const fmt = (v: number) => money(v, user.currency);

  if (error) return <Card><p className="error">{error}</p></Card>;
  if (!expenses) {
    return (
      <>
        <PageHead title={`Hi, ${first}`} />
        <div className="hero"><Skeleton rows={3} /></div>
      </>
    );
  }

  const budget = monthlyBudget(user);
  const hasBudget = budget > 0;
  const day = dayOf(date);
  const total = daysIn(month);
  const daysLeft = total - day + 1;
  const todays = expenses.filter((e) => e.date === date);
  const spentToday = sum(todays);
  const spentMonth = sum(expenses);
  const allowance = dailyAllowance(budget, spentMonth - spentToday, daysLeft);
  const leftToday = allowance - spentToday;
  const leftMonth = budget - spentMonth;
  const expected = Math.round((budget * day) / total);
  const paceDiff = expected - spentMonth;
  const monthLabel = monthName(month, { month: 'long' });

  return (
    <>
      <PageHead title={`Hi, ${first}`} />
      <div className="stack">
        <section className="hero">
          <div className="label">
            {!hasBudget ? 'Spent today' : leftToday >= 0 ? 'Left to spend today' : 'Over today’s allowance by'}
          </div>
          <div className={`figure${hasBudget && leftToday < 0 ? ' over' : ''}`}>
            {fmt(hasBudget ? Math.abs(leftToday) : spentToday)}
          </div>
          <div className="sub">
            {hasBudget
              ? `${fmt(allowance)} allowance for today · ${plural(daysLeft, 'day')} left in ${monthLabel}`
              : 'Add your income in Settings to get a daily allowance.'}
          </div>
        </section>

        {!hasBudget && (
          <div className="notice">
            <span>
              {user.income > 0
                ? 'Your fixed bills and savings use up all of your income, so there is nothing left to budget.'
                : 'Tell Cashflow your monthly income to see how much you have per day.'}
            </span>
            <Link className="btn primary" href="/app/settings">
              Set up budget
            </Link>
          </div>
        )}

        <div className="tiles">
          <Tile k="Spent today" v={fmt(spentToday)} d={plural(todays.length, 'expense')} />
          <Tile k="Spent this month" v={fmt(spentMonth)} d={`${fmt(Math.round(spentMonth / day))} a day so far`} />
          <Tile
            k={leftMonth >= 0 ? 'Left this month' : 'Over budget by'}
            v={hasBudget ? fmt(Math.abs(leftMonth)) : '—'}
            d={hasBudget ? `of ${fmt(budget)}` : 'No budget set'}
          />
          <Tile
            k="Per day from tomorrow"
            v={hasBudget && daysLeft > 1 ? fmt(Math.max(0, Math.round(leftMonth / (daysLeft - 1)))) : '—'}
            d={daysLeft > 1 ? `${plural(daysLeft - 1, 'day')} after today` : 'Last day of the month'}
          />
        </div>

        <div className={hasBudget ? 'cols' : ''}>
          {hasBudget && (
            <Card title={`${monthLabel} budget`}>
              <BudgetMeter spent={spentMonth} budget={budget} pace={(day / total) * 100} />
              <div className="meter-legend">
                <span>
                  {fmt(spentMonth)} of {fmt(budget)} spent
                </span>
                <span>{paceDiff >= 0 ? `${fmt(paceDiff)} under an even pace` : `${fmt(-paceDiff)} over an even pace`}</span>
              </div>
              <p className="muted small" style={{ marginTop: 14 }}>
                The marker shows where an even pace would put you today.
              </p>
            </Card>
          )}
          <Card title="Statistic · this month">
            {expenses.length ? (
              <Donut parts={byCategory(expenses)} currency={user.currency} />
            ) : (
              <p className="empty">Add an expense to see where your money goes.</p>
            )}
          </Card>
        </div>

        <Card title="Add an expense">
          <ExpenseForm defaultDate={date} />
        </Card>

        <Card title="Today">
          {todays.length ? (
            <div className="list">
              {todays.map((e) => (
                <ExpenseRow key={e.id} expense={e} />
              ))}
            </div>
          ) : (
            <p className="empty">Nothing spent yet today.</p>
          )}
        </Card>
      </div>
    </>
  );
}
