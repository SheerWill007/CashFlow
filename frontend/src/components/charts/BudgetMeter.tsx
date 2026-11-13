/** Horizontal budget bar with a marker for where an even pace would be today. */
export function BudgetMeter({ spent, budget, pace }: { spent: number; budget: number; pace: number }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  return (
    <div
      className="meter"
      role="img"
      aria-label={`${Math.round(budget > 0 ? (spent / budget) * 100 : 0)}% of budget spent, ${Math.round(pace)}% of the month gone`}
    >
      <i className={spent > budget ? 'over' : ''} style={{ width: `${pct}%` }} />
      <b style={{ left: `calc(${Math.min(100, pace)}% - 1px)` }} title="Where an even pace would be today" />
    </div>
  );
}
