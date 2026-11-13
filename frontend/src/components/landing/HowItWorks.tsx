'use client';

import { useState } from 'react';
import { Reveal, Words } from '../ui/Reveal';
import { inr } from './sample';

const DAYS = 30;

function Slider({
  label,
  value,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="slider">
      <span className="slider-head">
        <span>{label}</span>
        <strong>{inr(value * 100)}</strong>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--p' as string]: `${(value / max) * 100}%` }}
      />
    </label>
  );
}

/** Explains the allowance maths, then lets the visitor try it with their own numbers. */
export function HowItWorks() {
  const [income, setIncome] = useState(80000);
  const [bills, setBills] = useState(25000);
  const [savings, setSavings] = useState(10000);
  const budget = income - bills - savings;
  const perDay = Math.max(0, Math.round(budget / DAYS));

  return (
    <section className="stage steps-stage dark glow" id="how">
      <span className="chip">How it works</span>
      <Words text="The maths behind your daily number" dimFrom={3} />
      <Reveal as="p" className="sub">
        No bank connection and no guesswork. Three figures from you, and the rest is arithmetic.
      </Reveal>

      <Reveal className="steps">
        <div className="step">
          <span className="n">Step 1</span>
          <span className="big">Income</span>
          <p>Take what you earn each month, then subtract fixed bills and the amount you want to save.</p>
        </div>
        <div className="step">
          <span className="n">Step 2</span>
          <span className="big">÷ days left</span>
          <p>Whatever is still unspent is shared across the remaining days of the month.</p>
        </div>
        <div className="step">
          <span className="n">Step 3</span>
          <span className="big">It adjusts</span>
          <p>Each expense you add changes the figure straight away, for today and for the days ahead.</p>
        </div>
      </Reveal>

      <Reveal className="calc" delay={120}>
        <div className="calc-inputs">
          <h3>Try it with your numbers</h3>
          <Slider label="Monthly income" value={income} max={300000} step={1000} onChange={setIncome} />
          <Slider label="Fixed bills" value={bills} max={150000} step={500} onChange={setBills} />
          <Slider label="Savings goal" value={savings} max={100000} step={500} onChange={setSavings} />
        </div>
        <div className="calc-result" aria-live="polite">
          <span className="muted small">You could spend</span>
          <span className={`calc-figure${budget < 0 ? ' over' : ''}`}>{inr(perDay * 100)}</span>
          <span className="muted small">a day, across a {DAYS}-day month</span>
          <div className="calc-line">
            <span>Free to spend this month</span>
            <strong>{inr(budget * 100)}</strong>
          </div>
          {budget < 0 && <p className="calc-warn">Bills and savings are more than your income.</p>}
        </div>
      </Reveal>
    </section>
  );
}
