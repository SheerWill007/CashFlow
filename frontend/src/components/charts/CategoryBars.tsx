import { colorOf } from '@/lib/categories';
import { money } from '@/lib/format';
import type { Slice } from '@/lib/types';

export function CategoryBars({ parts, currency }: { parts: Slice[]; currency: string }) {
  const total = parts.reduce((t, p) => t + p.amount, 0);
  const max = parts[0]?.amount || 1;
  return (
    <div>
      {parts.map((c) => (
        <div key={c.name} className="cat" style={{ ['--c' as string]: colorOf(c.name) }}>
          <span className="dot" />
          <span>{c.name}</span>
          <div className="track">
            <i style={{ width: `${(c.amount / max) * 100}%` }} />
          </div>
          <span className="num">{money(c.amount, currency)}</span>
          <span className="pct">{Math.round((c.amount / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}
