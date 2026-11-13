import { colorOf } from '@/lib/categories';
import { Icon } from '../ui/Icon';
import { Reveal, Words } from '../ui/Reveal';
import { SpotlightCard } from '../ui/SpotlightCard';
import { MiniRow } from './MiniRow';
import { inr } from './sample';

export function DailyFinance() {
  return (
    <section className="section" id="features">
      <div className="section-head">
        <span className="chip">Daily finances</span>
        <Words text="Know your number before you spend" />
        <p>One figure each morning: what you can spend today.</p>
      </div>

      <div className="split">
        <Reveal>
          <span className="chip">Quick add</span>
          <h3>Log an expense in a few seconds</h3>
          <p>Amount, category, done. Your allowance for the day updates the moment you add it.</p>
        </Reveal>
        <Reveal className="panel gridded" delay={120}>
          <div className="widget">
            <h4>Amount</h4>
            <div className="muted small">Add expense</div>
            <div className="fake-input">
              <div>
                <strong>{inr(45000)}</strong>
                <span className="muted small">Left today: {inr(124500)}</span>
              </div>
              <span className="pill">INR</span>
            </div>
            <div className="muted small">What was it for?</div>
            <div className="fake-input">
              <span className="pill">
                <span className="dot" style={{ background: colorOf('Food & dining') }} />
                Food &amp; dining
              </span>
              <span className="muted">Lunch</span>
            </div>
            <div className="done">
              <Icon name="check" size={16} /> Added!
            </div>
          </div>
        </Reveal>
      </div>

      <div className="three">
        <Reveal>
          <SpotlightCard className="feature">
            <h3>Analytics</h3>
            <p>See which categories take the biggest share of your month, at a glance.</p>
            <div className="mini">
              <MiniRow icon="fork" color={colorOf('Food & dining')} name="Food & dining" amount={inr(820000)} share={78} />
              <MiniRow icon="bag" color={colorOf('Groceries')} name="Groceries" amount={inr(540000)} share={52} />
              <MiniRow icon="car" color={colorOf('Transport')} name="Transport" amount={inr(310000)} share={30} />
            </div>
          </SpotlightCard>
        </Reveal>
        <Reveal delay={90}>
          <SpotlightCard className="feature">
            <h3>Budgeting</h3>
            <p>Income minus bills and savings gives a budget that follows you through the month.</p>
            <div className="mini">
              <div className="mini-row">
                <span className="ico invert">
                  <Icon name="wallet" size={15} />
                </span>
                <span className="grow">
                  <span className="stat-big">{inr(5400000)}</span>
                  <span className="badge">monthly</span>
                  <div className="muted small">Free to spend</div>
                </span>
              </div>
            </div>
            <div className="mini">
              <div className="mini-row">
                <span className="ico invert">
                  <Icon name="calendar" size={15} />
                </span>
                <span className="grow">
                  <span className="stat-big">{inr(180000)}</span>
                  <span className="badge">per day</span>
                  <div className="muted small">Daily allowance</div>
                </span>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
        <Reveal delay={180}>
          <SpotlightCard className="feature">
            <h3>Expenses</h3>
            <p>Every expense in one list, grouped by day, with a running total for each.</p>
            <div className="mini">
              <MiniRow icon="bag" color={colorOf('Shopping')} name="Shopping" amount={inr(33000)} />
              <MiniRow icon="fork" color={colorOf('Food & dining')} name="Restaurants" amount={inr(15400)} />
              <MiniRow icon="car" color={colorOf('Transport')} name="Travel" amount={inr(259200)} />
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
