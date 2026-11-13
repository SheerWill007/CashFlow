'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useApp } from '@/components/app/AppShell';
import { Card, PageHead } from '@/components/app/parts';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { api } from '@/lib/api';
import { monthlyBudget } from '@/lib/budget';
import { daysIn, thisMonth } from '@/lib/dates';
import { money, parseMoney } from '@/lib/format';
import type { User } from '@/lib/types';

const toInput = (minor: number) => (minor ? String(minor / 100) : '');

export default function SettingsPage() {
  const { user, setUser, currencies } = useApp();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [currency, setCurrency] = useState(user.currency);
  const [income, setIncome] = useState(toInput(user.income));
  const [fixed, setFixed] = useState(toInput(user.fixed));
  const [savings, setSavings] = useState(toInput(user.savings));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const values = { income: parseMoney(income || '0'), fixed: parseMoney(fixed || '0'), savings: parseMoney(savings || '0') };
  const valid = values.income !== null && values.fixed !== null && values.savings !== null;
  const budget = valid ? monthlyBudget(values as { income: number; fixed: number; savings: number }) : null;
  const days = daysIn(thisMonth());

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!valid) {
      setError('Amounts must be numbers, zero or more');
      return;
    }
    setBusy(true);
    try {
      const { user: updated } = await api<{ user: User }>('PUT', '/api/settings', { name: name.trim(), currency, ...values });
      setUser(updated);
      toast('Settings saved');
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title="Settings" />
      <div className="stack">
        <Card title="Your monthly budget">
          <form className="stack" onSubmit={save}>
            <div className="settings-form">
              <label className="field">
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
              </label>
              <label className="field">
                Currency
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field full">
                Monthly income (after tax)
                <input inputMode="decimal" placeholder="0" value={income} onChange={(e) => setIncome(e.target.value)} />
              </label>
              <label className="field">
                Fixed bills — rent, EMIs, subscriptions
                <input inputMode="decimal" placeholder="0" value={fixed} onChange={(e) => setFixed(e.target.value)} />
              </label>
              <label className="field">
                Savings goal per month
                <input inputMode="decimal" placeholder="0" value={savings} onChange={(e) => setSavings(e.target.value)} />
              </label>
            </div>
            <div>
              <div className="summary-line">
                <span>Free to spend each month</span>
                <strong>{budget === null ? '—' : money(budget, currency)}</strong>
              </div>
              <div className="summary-line">
                <span>Roughly per day ({days}-day month)</span>
                <strong>{budget === null ? '—' : money(Math.max(0, Math.round(budget / days)), currency)}</strong>
              </div>
            </div>
            <div className="error" role="alert">
              {error}
            </div>
            <div>
              <button className="btn primary" type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Appearance">
          <div className="segmented" role="radiogroup" aria-label="Theme">
            {(['light', 'dark'] as const).map((t) => (
              <button key={t} type="button" role="radio" aria-checked={theme === t} onClick={() => setTheme(t)}>
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Account">
          <p className="muted">Signed in as {user.email}</p>
        </Card>
      </div>
    </>
  );
}
