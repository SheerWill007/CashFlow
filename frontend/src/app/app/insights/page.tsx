'use client';

import { useApp } from '@/components/app/AppShell';
import { ExpenseRow } from '@/components/app/ExpenseRow';
import { useExpenses, useTrend } from '@/components/app/hooks';
import { Card, MonthSwitch, PageHead, Skeleton, Tile } from '@/components/app/parts';
import { CategoryBars } from '@/components/charts/CategoryBars';
import { DailyChart } from '@/components/charts/DailyChart';
import { Donut } from '@/components/charts/Donut';
import { TrendBars } from '@/components/charts/TrendBars';
import { monthlyBudget } from '@/lib/budget';
import { byCategory } from '@/lib/categories';
import { dayOf, daysIn, monthName, thisMonth, today } from '@/lib/dates';
import { money, moneyWhole, plural, sum } from '@/lib/format';

export default function InsightsPage() {
  const { user, month, version } = useApp();
  const { expenses, error } = useExpenses(month, version);
  const { months } = useTrend(month, version);
  const head = (
    <PageHead title="Where it goes">
      <MonthSwitch />
    </PageHead>
  );

  if (error) return <>{head}<Card><p className="error">{error}</p></Card></>;
  if (!expenses) return <>{head}<Card><Skeleton rows={5} /></Card></>;
  if (!expenses.length) {
    return (
      <>
        {head}
        <Card>
          <p className="empty">No expenses in {monthName(month)} yet. Add some and the breakdown appears here.</p>
        </Card>
      </>
    );
  }

  const fmt = (v: number) => money(v, user.currency);
  const total = sum(expenses);
  const budget = monthlyBudget(user);
  const n = daysIn(month);
  const daysCounted = month === thisMonth() ? dayOf(today()) : n;
  const cats = byCategory(expenses);
  const biggest = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const quietDays = daysCounted - new Set(expenses.map((e) => e.date)).size;

  return (
    <>
      {head}
      <div className="stack">
        <div className="tiles">
          <Tile
            k="Total spent"
            v={fmt(total)}
            d={budget > 0 ? `${Math.round((total / budget) * 100)}% of ${moneyWhole(budget, user.currency)} budget` : plural(expenses.length, 'expense')}
          />
          <Tile k="Average per day" v={fmt(Math.round(total / daysCounted))} d={`over ${plural(daysCounted, 'day')}`} />
          <Tile k="Top category" v={cats[0].name} d={`${fmt(cats[0].amount)} · ${Math.round((cats[0].amount / total) * 100)}%`} />
          <Tile k="Days with no spending" v={String(quietDays)} d={`of ${daysCounted}`} />
        </div>

        <div className="cols">
          <Card title="By category">
            <CategoryBars parts={cats} currency={user.currency} />
          </Card>
          <Card title="Share of spending">
            <Donut parts={cats} currency={user.currency} />
          </Card>
        </div>

        <Card title="Day by day">
          <DailyChart month={month} expenses={expenses} budgetPerDay={budget > 0 ? Math.round(budget / n) : 0} currency={user.currency} />
        </Card>

        <div className="cols">
          <Card title="Last 6 months">
            {months ? <TrendBars months={months} current={month} currency={user.currency} /> : <Skeleton rows={3} />}
          </Card>
          <Card title="Biggest expenses">
            <div className="list">
              {biggest.map((e) => (
                <ExpenseRow key={e.id} expense={e} showDate />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
