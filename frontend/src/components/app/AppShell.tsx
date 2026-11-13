'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, UNAUTHORIZED_EVENT } from '@/lib/api';
import { thisMonth } from '@/lib/dates';
import type { MeResponse, User } from '@/lib/types';
import { Icon, type IconName } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';

interface AppContextValue {
  user: User;
  setUser: (u: User) => void;
  categories: string[];
  currencies: string[];
  /** Month shown on Expenses and Where it goes (YYYY-MM). */
  month: string;
  setMonth: (m: string) => void;
  /** Bumped after any change so pages refetch. */
  version: number;
  changed: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppShell');
  return ctx;
}

const NAV: [string, string, IconName][] = [
  ['/app', 'Today', 'today'],
  ['/app/expenses', 'Expenses', 'list'],
  ['/app/insights', 'Where it goes', 'pie'],
  ['/app/settings', 'Settings', 'gear'],
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [month, setMonth] = useState(thisMonth);
  const [version, setVersion] = useState(0);

  const leave = useCallback(async () => {
    // Logging out also clears the cookie, so the login page won't bounce back here.
    await api('POST', '/api/logout').catch(() => {});
    router.replace('/login');
    router.refresh();
  }, [router]);

  useEffect(() => {
    let alive = true;
    api<MeResponse>('GET', '/api/me')
      .then((data) => {
        if (!alive) return;
        if (!data.user) void leave();
        else setMe(data);
      })
      .catch(() => alive && setFailed(true));
    const onUnauthorized = () => void leave();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      alive = false;
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [leave]);

  const setUser = useCallback((user: User) => setMe((m) => (m ? { ...m, user } : m)), []);
  const changed = useCallback(() => setVersion((v) => v + 1), []);

  if (failed) {
    return (
      <div className="center-screen">
        <p>Could not reach the server. Is the backend running?</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }
  if (!me?.user) {
    return (
      <div className="center-screen" aria-busy="true">
        <span className="spinner" aria-label="Loading" />
      </div>
    );
  }

  const value: AppContextValue = {
    user: me.user,
    setUser,
    categories: me.categories,
    currencies: me.currencies,
    month,
    setMonth,
    version,
    changed,
  };

  return (
    <AppContext.Provider value={value}>
      <div className="shell">
        <aside className="sidebar">
          <Link href="/" className="logo">
            CASHFLOW
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map(([href, label, icon]) => (
              <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
                <Icon name={icon} size={17} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="who">
            <ThemeToggle />
            <button className="btn" onClick={leave}>
              <Icon name="logout" size={16} /> Log out
            </button>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </AppContext.Provider>
  );
}
