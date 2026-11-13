'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useScrollTo } from '../providers/SmoothScroll';
import { ThemeToggle } from '../ui/ThemeToggle';

const LINKS = [
  ['#features', 'Features'],
  ['#tour', 'Tour'],
  ['#how', 'How it works'],
  ['#faq', 'FAQ'],
] as const;

export function Navbar() {
  const scrollTo = useScrollTo();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topnav${scrolled ? ' scrolled' : ''}`}>
      <nav className="left" aria-label="Sections">
        {LINKS.map(([href, label]) => (
          <a
            key={href}
            className="linkbtn opt"
            href={href}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(href);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <Link href="/" className="logo" aria-label="Cashflow home">
        CASHFLOW
      </Link>
      <div className="right">
        <ThemeToggle />
        <Link className="linkbtn" href="/login">
          Log in
        </Link>
        <Link className="btn invert" href="/signup">
          Sign up
        </Link>
      </div>
    </header>
  );
}
