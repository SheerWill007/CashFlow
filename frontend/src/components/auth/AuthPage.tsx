'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Reveal, Words } from '../ui/Reveal';
import { ThemeToggle } from '../ui/ThemeToggle';

type Mode = 'login' | 'signup';

/** Only follow `?next=` back into the app, never to another site. */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && /^\/app(\/|$)/.test(next) ? next : '/app';
}

export function AuthPage({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    setBusy(true);
    try {
      await api<{ user: User }>('POST', signup ? '/api/signup' : '/api/login', {
        name: signup ? form.get('name') : undefined,
        email: form.get('email'),
        password: form.get('password'),
      });
      router.replace(signup ? '/app/settings' : nextPath());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <header className="topnav">
        <div className="left">
          <Link className="linkbtn" href="/">
            ← Back
          </Link>
        </div>
        <Link href="/" className="logo">
          CASHFLOW
        </Link>
        <div className="right">
          <ThemeToggle />
        </div>
      </header>
      <div className="auth-grid">
        <section className="auth-hero dark glow">
          <span className="chip" style={{ alignSelf: 'flex-start' }}>
            Daily finances
          </span>
          <div>
            <Words as="h1" text="Know what you can spend today" dimFrom={5} immediate />
            <Reveal as="p" immediate delay={400}>
              Track every expense, get a daily allowance that adjusts as you spend, and see exactly where the money goes.
            </Reveal>
          </div>
        </section>
        <section className="auth-panel panel gridded">
          <div className="auth-card">
            <div className="tabs" role="tablist" aria-label="Account">
              <Link role="tab" aria-selected={!signup} href="/login" replace>
                Log in
              </Link>
              <Link role="tab" aria-selected={signup} href="/signup" replace>
                Sign up
              </Link>
            </div>
            <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
            <form className="stack" onSubmit={submit} key={mode}>
              {signup && (
                <label className="field">
                  Name
                  <input name="name" required maxLength={60} autoComplete="name" />
                </label>
              )}
              <label className="field">
                Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label className="field">
                {signup ? 'Password (8+ characters)' : 'Password'}
                <input
                  name="password"
                  type="password"
                  required
                  minLength={signup ? 8 : undefined}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                />
              </label>
              <div className="error" role="alert">
                {error}
              </div>
              <button className="btn primary wide" type="submit" disabled={busy}>
                {busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
