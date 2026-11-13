'use client';

import { useState, type KeyboardEvent } from 'react';
import { colorOf } from '@/lib/categories';
import { Icon, type IconName } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { MiniRow, type MiniRowProps } from './MiniRow';
import { SAMPLE, inr } from './sample';

const total = SAMPLE.reduce((t, s) => t + s.amount, 0);

const TOUR: { label: string; icon: IconName; text: string; rows: MiniRowProps[] }[] = [
  {
    label: 'Daily allowance',
    icon: 'today',
    text: 'Your budget for the rest of the month, split over the days you have left. Spend less today and tomorrow gets bigger.',
    rows: [
      { icon: 'today', color: 'var(--invert-bg)', name: 'Today', amount: inr(124500) },
      { icon: 'up', color: 'var(--invert-bg)', name: 'From tomorrow', amount: inr(131200) },
    ],
  },
  {
    label: 'Expense log',
    icon: 'list',
    text: 'A day-by-day list of everything you spent, with notes, so nothing goes missing.',
    rows: [
      { icon: 'fork', color: colorOf('Food & dining'), name: 'Lunch', amount: inr(45000) },
      { icon: 'car', color: colorOf('Transport'), name: 'Metro card', amount: inr(20000) },
      { icon: 'bag', color: colorOf('Groceries'), name: 'Vegetables', amount: inr(38000) },
    ],
  },
  {
    label: 'Where it goes',
    icon: 'pie',
    text: 'Totals for each category and each day of the month, set against your daily budget.',
    rows: SAMPLE.slice(0, 3).map((s) => ({
      icon: 'pie' as IconName,
      color: colorOf(s.name),
      name: s.name,
      amount: `${Math.round((s.amount / total) * 100)}%`,
      share: (s.amount / SAMPLE[0].amount) * 100,
    })),
  },
  {
    label: 'Six-month trend',
    icon: 'up',
    text: 'See whether this month is running above or below the ones before it.',
    rows: [
      { icon: 'up', color: 'var(--invert-bg)', name: 'This month', amount: inr(2070000) },
      { icon: 'up', color: 'var(--muted)', name: 'Last month', amount: inr(4810000) },
    ],
  },
  {
    label: 'Light & dark',
    icon: 'moon',
    text: 'Switch themes from the toggle in the top bar. Cashflow remembers your choice, or follows your system setting.',
    rows: [
      { icon: 'sun', color: 'var(--invert-bg)', name: 'Light theme', amount: 'Bright' },
      { icon: 'moon', color: 'var(--invert-bg)', name: 'Dark theme', amount: 'Easy on the eyes' },
    ],
  },
  {
    label: 'CSV export',
    icon: 'download',
    text: 'Download any month as a spreadsheet file whenever you want a copy of your data.',
    rows: [{ icon: 'download', color: 'var(--invert-bg)', name: 'cashflow-2026-11.csv', amount: 'Ready' }],
  },
];

export function FeatureTour() {
  const [active, setActive] = useState(0);
  const tab = TOUR[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (active + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + TOUR.length) % TOUR.length;
    setActive(next);
    (e.currentTarget.children[next] as HTMLButtonElement | undefined)?.focus();
  };

  return (
    <section className="section" id="tour">
      <Reveal className="tabbed">
        <div className="tablist" role="tablist" aria-label="Features" aria-orientation="vertical" onKeyDown={onKey}>
          {TOUR.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              id={`tour-tab-${i}`}
              aria-selected={i === active}
              aria-controls="tour-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="panel tabpanel" role="tabpanel" id="tour-panel" aria-labelledby={`tour-tab-${active}`}>
          <h3>
            <span className="ico plain">
              <Icon name={tab.icon} size={16} />
            </span>
            {tab.label}
          </h3>
          <p>{tab.text}</p>
          <div className="mini" key={active}>
            {tab.rows.map((r) => (
              <MiniRow key={r.name} {...r} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
