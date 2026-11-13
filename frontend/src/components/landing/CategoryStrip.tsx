import { CATEGORIES, colorOf } from '@/lib/categories';
import { Marquee } from '../ui/Marquee';

const CURRENCIES = ['₹ INR', '$ USD', '€ EUR', '£ GBP', 'د.إ AED', 'C$ CAD', 'A$ AUD', 'S$ SGD'];

/** Two tickers running in opposite directions: categories, then supported currencies. */
export function CategoryStrip() {
  return (
    <section className="strip" aria-label="Categories and currencies">
      <Marquee label="Spending categories">
        {CATEGORIES.map((c) => (
          <span key={c} className="strip-pill">
            <span className="dot" style={{ background: colorOf(c) }} />
            {c}
          </span>
        ))}
      </Marquee>
      <Marquee label="Supported currencies" reverse>
        {CURRENCIES.map((c) => (
          <span key={c} className="strip-pill ghost">
            {c}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
