'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { monthName, shiftMonth, thisMonth } from '@/lib/dates';
import { Icon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useApp } from './AppShell';

export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  const { user } = useApp();
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="page-head">
      <h1>{title}</h1>
      <div className="head-right">
        {children}
        <ThemeToggle className="mobile-only" />
        <Link className="user-chip" href="/app/settings" title="Settings">
          <span className="avatar">{initials}</span>
          <span className="name">{user.name}</span>
        </Link>
      </div>
    </div>
  );
}

export function MonthSwitch() {
  const { month, setMonth } = useApp();
  return (
    <div className="month-switch">
      <button className="btn icon" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
        <Icon name="chevronLeft" size={16} />
      </button>
      <span>{monthName(month)}</span>
      <button
        className="btn icon"
        aria-label="Next month"
        disabled={month >= thisMonth()}
        onClick={() => setMonth(shiftMonth(month, 1))}
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </div>
  );
}

export function Tile({ k, v, d }: { k: string; v: ReactNode; d?: ReactNode }) {
  return (
    <div className="tile">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {d && <div className="d">{d}</div>}
    </div>
  );
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="card">
      {(title || actions) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} style={{ width: `${90 - i * 18}%` }} />
      ))}
    </div>
  );
}
