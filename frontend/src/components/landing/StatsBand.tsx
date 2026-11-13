import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Reveal } from '../ui/Reveal';

// Facts about the product itself, not invented usage numbers.
const STATS = [
  { value: 3, label: 'numbers to set up your budget' },
  { value: 8, label: 'spending categories' },
  { value: 8, label: 'currencies supported' },
  { value: 0, suffix: '', label: 'bank logins needed' },
];

export function StatsBand() {
  return (
    <section className="section stats" aria-label="Cashflow at a glance">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 90} className="stat">
          <span className="stat-value">
            <AnimatedNumber value={s.value} />
          </span>
          <span className="stat-label">{s.label}</span>
        </Reveal>
      ))}
    </section>
  );
}
