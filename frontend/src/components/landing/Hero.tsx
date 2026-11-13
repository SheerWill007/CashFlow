import Link from 'next/link';
import { Donut } from '../charts/Donut';
import { BudgetMeter } from '../charts/BudgetMeter';
import { Reveal, Words } from '../ui/Reveal';
import { money } from '@/lib/format';
import { SAMPLE } from './sample';

export function Hero() {
  return (
    <section className="stage hero-stage dark glow">
      <Words as="h1" text="Your money, one day at a time" dimFrom={2} immediate />
      <Reveal immediate delay={350} as="p" className="lead">
        Track what you spend, see what is left for today, and find out where the rest went. All in one place.
      </Reveal>
      <Reveal immediate delay={500}>
        <Link className="btn white big" href="/signup">
          Open your Cashflow account
        </Link>
      </Reveal>

      <Reveal immediate delay={650}>
        <div className="mock" aria-hidden="true">
        <div className="mock-side">
          <div className="logo">CASHFLOW</div>
          <ul>
            <li className="on">Today</li>
            <li>Expenses</li>
            <li>Where it goes</li>
            <li>Settings</li>
          </ul>
        </div>
        <div className="mock-main">
          <div className="mock-head">
            <span>Today</span>
            <span className="user-chip">
              <span className="avatar">AK</span>
              <span className="name">Asha Kapoor</span>
            </span>
          </div>
          <div className="mock-grid">
            <div>
              <div className="muted small">Left to spend today</div>
              <div className="figure">{money(124500, 'INR', {}, 'en-IN')}</div>
              <BudgetMeter spent={2070000} budget={5400000} pace={46} />
              <div className="muted small">
                {money(2070000, 'INR', {}, 'en-IN')} of {money(5400000, 'INR', {}, 'en-IN')} spent this month
              </div>
            </div>
            <div>
              <div className="muted small" style={{ marginBottom: 12 }}>
                Statistic
              </div>
              <Donut parts={SAMPLE} locale="en-IN" />
            </div>
          </div>
        </div>
        </div>
      </Reveal>
      <div className="scroll-hint">Scroll</div>
    </section>
  );
}
