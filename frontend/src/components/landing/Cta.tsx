import Link from 'next/link';
import { Reveal, Words } from '../ui/Reveal';

export function Cta() {
  return (
    <section className="stage cta-stage dark glow right">
      <Words text="Start with today. The month follows." dimFrom={3} />
      <Reveal className="cta-row">
        <Link className="btn white big" href="/signup">
          Get started today
        </Link>
        <Link className="btn glass big" href="/login">
          Log in
        </Link>
      </Reveal>
    </section>
  );
}
