import { monthName } from '@/lib/dates';
import { money, moneyShort } from '@/lib/format';
import type { TrendPoint } from '@/lib/types';

export function TrendBars({ months, current, currency }: { months: TrendPoint[]; current: string; currency: string }) {
  const max = Math.max(...months.map((t) => t.total), 1);
  return (
    <div className="trend">
      {months.map((t) => (
        <div key={t.month} className={`col${t.month === current ? ' now' : ''}`} title={`${monthName(t.month)}: ${money(t.total, currency)}`}>
          <span className="val">{t.total ? moneyShort(t.total, currency) : '–'}</span>
          <i style={{ height: `${(t.total / max) * 70}%` }} />
          <span>{monthName(t.month, { month: 'short' })}</span>
        </div>
      ))}
    </div>
  );
}
