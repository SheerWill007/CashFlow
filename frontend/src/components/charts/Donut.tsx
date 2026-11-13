import { colorOf } from '@/lib/categories';
import { money, moneyShort } from '@/lib/format';
import type { Slice } from '@/lib/types';

/** Share of spending by category: a ring with a 2px gap between segments, plus a legend of the top five. */
export function Donut({ parts, currency = 'INR', locale }: { parts: Slice[]; currency?: string; locale?: string }) {
  const total = parts.reduce((t, p) => t + p.amount, 0);
  const R = 50;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="statistic">
      <svg viewBox="0 0 132 132" role="img" aria-label="Share of spending by category">
        <circle cx={66} cy={66} r={R} fill="none" className="ring-track" strokeWidth={14} />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.amount / total) * C;
            const gap = parts.length > 1 && len > 5 ? 2.5 : 0;
            const el = (
              <circle
                key={p.name}
                cx={66}
                cy={66}
                r={R}
                fill="none"
                stroke={colorOf(p.name)}
                strokeWidth={14}
                strokeDasharray={`${len - gap} ${C - len + gap}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 66 66)"
              >
                <title>{`${p.name}: ${money(p.amount, currency, {}, locale)}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        <text className="center-k" x={66} y={60} textAnchor="middle">
          SPENT
        </text>
        <text className="center" x={66} y={78} textAnchor="middle">
          {moneyShort(total, currency, locale)}
        </text>
      </svg>
      <div className="legend">
        {parts.slice(0, 5).map((p) => (
          <div key={p.name}>
            <span className="dot" style={{ background: colorOf(p.name) }} />
            <span>{p.name}</span>
            <span>{total ? Math.round((p.amount / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
