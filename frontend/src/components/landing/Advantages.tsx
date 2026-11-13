import { Icon, type IconName } from '../ui/Icon';
import { Reveal, Words } from '../ui/Reveal';
import { SpotlightCard } from '../ui/SpotlightCard';

const ITEMS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'bolt', title: 'Easy', text: 'One screen tells you where you stand today.' },
  { icon: 'lock', title: 'Private', text: 'Your own login. Nobody else sees your expenses.' },
  { icon: 'check', title: 'Clear', text: 'Exact amounts, by category and by day.' },
  { icon: 'download', title: 'Portable', text: 'Export any month to a CSV file.' },
];

export function Advantages() {
  return (
    <section className="section">
      <div className="split">
        <div>
          <span className="chip">Why Cashflow</span>
          <Words text="Discover the advantages of knowing" dimFrom={2} />
        </div>
        <div className="adv">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <SpotlightCard className="feature">
                <span className="ico soft">
                  <Icon name={item.icon} size={20} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
