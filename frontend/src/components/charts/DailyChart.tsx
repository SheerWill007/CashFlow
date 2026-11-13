'use client';

import { useState } from 'react';
import { dateIn, dayLabel, dayOf, daysIn, monthName } from '@/lib/dates';
import { money, moneyShort } from '@/lib/format';
import type { Expense } from '@/lib/types';

function niceMax(major: number) {
  if (major <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(major));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= major) return step * pow;
  return 10 * pow;
}

/** One bar per day of the month, with the even daily budget as a dashed line and a hover tooltip. */
export function DailyChart({
  month,
  expenses,
  budgetPerDay,
  currency,
}: {
  month: string;
  expenses: Expense[];
  budgetPerDay: number;
  currency: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const n = daysIn(month);
  const totals = Array<number>(n).fill(0);
  for (const e of expenses) totals[dayOf(e.date) - 1] += e.amount;

  const W = 720, H = 240, L = 52, R = 8, T = 14, B = 26;
  const iw = W - L - R;
  const ih = H - T - B;
  const top = niceMax(Math.max(...totals, budgetPerDay || 0) / 100) * 100;
  const y = (v: number) => T + ih - (v / top) * ih;
  const slot = iw / n;
  const bw = Math.min(16, slot - 2);

  return (
    <div>
      <div className="chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Spending for each day of ${monthName(month)}`}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line className="gridline" x1={L} x2={W - R} y1={y(top * f)} y2={y(top * f)} />
              <text x={L - 8} y={y(top * f) + 4} textAnchor="end">
                {moneyShort(top * f, currency)}
              </text>
            </g>
          ))}
          {totals.map((v, i) => {
            const cx = L + slot * i + slot / 2;
            const day = i + 1;
            let bar = null;
            if (v > 0) {
              const bh = Math.max(2, (v / top) * ih);
              const r = Math.min(4, bw / 2, bh);
              const x0 = cx - bw / 2;
              const y0 = T + ih - bh;
              const yb = T + ih;
              bar = (
                <path
                  className={`bar${hover === i ? ' active' : ''}`}
                  d={`M${x0},${yb} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw - r} Q${x0 + bw},${y0} ${x0 + bw},${y0 + r} V${yb} Z`}
                />
              );
            }
            return (
              <g key={i}>
                {bar}
                {(day === 1 || day % 5 === 0) && (
                  <text x={cx} y={H - 6} textAnchor="middle">
                    {day}
                  </text>
                )}
              </g>
            );
          })}
          {budgetPerDay > 0 && <line className="budget" x1={L} x2={W - R} y1={y(budgetPerDay)} y2={y(budgetPerDay)} />}
          {/* Full-height hit targets so thin bars and empty days are easy to hover. */}
          {totals.map((_, i) => (
            <rect
              key={i}
              className="hit"
              x={L + slot * i}
              y={T}
              width={slot}
              height={ih}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
        </svg>
        {hover !== null && (
          <div
            className="tip"
            style={{
              left: `${((L + slot * hover + slot / 2) / W) * 100}%`,
              top: `${(Math.min(y(totals[hover]), y(0) - 8) / H) * 100}%`,
            }}
          >
            <strong>{money(totals[hover], currency)}</strong>
            {dayLabel(dateIn(month, hover + 1))}
          </div>
        )}
      </div>
      {budgetPerDay > 0 && (
        <div className="key">
          <span className="k-bar">Spent that day</span>
          <span className="k-line">Even daily budget ({money(budgetPerDay, currency)})</span>
        </div>
      )}
    </div>
  );
}
