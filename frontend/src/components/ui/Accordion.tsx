'use client';

import { useId, useState } from 'react';
import { Icon } from './Icon';

export interface AccordionItem {
  q: string;
  a: string;
}

/** One-open-at-a-time disclosure list with an animated height. */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`acc-item${isOpen ? ' open' : ''}`}>
            <h3>
              <button
                type="button"
                id={`${id}-h${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <Icon name="plus" size={18} className="acc-icon" />
              </button>
            </h3>
            <div className="acc-panel" id={`${id}-p${i}`} role="region" aria-labelledby={`${id}-h${i}`}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
