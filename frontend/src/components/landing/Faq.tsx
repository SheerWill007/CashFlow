import { Accordion } from '../ui/Accordion';
import { Reveal, Words } from '../ui/Reveal';

const FAQ = [
  {
    q: 'How is my daily allowance worked out?',
    a: 'Cashflow takes your monthly income, subtracts your fixed bills and savings goal, then removes what you have already spent on earlier days this month. What is left is divided by the days remaining, including today.',
  },
  {
    q: 'Do I need to connect my bank account?',
    a: 'No. You add expenses yourself, which takes a few seconds each. Nothing is pulled from your bank.',
  },
  {
    q: 'What happens if I overspend one day?',
    a: 'The difference comes out of the days that are left, so the allowance for each remaining day shrinks a little. Spend less than your allowance and the opposite happens.',
  },
  {
    q: 'Which currencies can I use?',
    a: 'Indian rupee, US dollar, euro, pound sterling, UAE dirham, Canadian dollar, Australian dollar and Singapore dollar. Pick one in Settings.',
  },
  {
    q: 'Can I get my data out?',
    a: 'Yes. Any month can be downloaded as a CSV file from the Expenses page and opened in Excel or Google Sheets.',
  },
];

export function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="faq-grid">
        <div>
          <span className="chip">FAQ</span>
          <Words text="Questions, answered" dimFrom={1} />
          <Reveal as="p" className="muted">
            The short version: three numbers in, one number out.
          </Reveal>
        </div>
        <Reveal>
          <Accordion items={FAQ} />
        </Reveal>
      </div>
    </section>
  );
}
