'use strict';

// Public landing page. Uses the helpers defined in app.js (h, svg, fmt, donut, colorOf).

const ICONS = {
  today: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6M12 8a4 4 0 100 8 4 4 0 000-8z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  pie: 'M12 3a9 9 0 109 9h-9V3zM15 3.5A9 9 0 0120.5 9H15V3.5z',
  gear: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4',
  bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  down: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  bag: 'M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 016 0v2',
  fork: 'M7 3v8M5 3v4a2 2 0 004 0V3M7 11v10M16 3c-2 2-2 7 0 9v9',
  car: 'M4 16v-4l2-5h12l2 5v4M4 16h16M7 16v2M17 16v2M7.5 12.5h.01M16.5 12.5h.01',
  up: 'M6 18L18 6M9 6h9v9',
};

function icon(name) {
  return svg(
    'svg',
    { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
    svg('path', { d: ICONS[name] }),
  );
}

// Headline whose words drift in one after another.
function words(tag, text, dimFrom = Infinity) {
  const el = h(tag, { class: 'words' });
  text.split(' ').forEach((word, i) => {
    el.append(h('span', { class: `w${i >= dimFrom ? ' dim' : ''}`, style: { transitionDelay: `${i * 90}ms` } }, word), ' ');
  });
  return el;
}

function watchReveals(root) {
  const targets = root.querySelectorAll('.words, .rise');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 },
  );
  targets.forEach((el) => io.observe(el));
}

function miniRow(iconName, color, name, amount, share) {
  return h(
    'div',
    { class: 'mini-row' },
    h('span', { class: 'ico', style: { '--c': color } }, icon(iconName)),
    h('span', { class: 'grow' }, name, share != null && h('span', { class: 'bar' }, h('i', { style: { width: `${share}%` } }))),
    h('span', { class: 'amt' }, amount),
  );
}

function landingView({ onLogin, onSignup }) {
  const sample = [
    { name: 'Food & dining', amount: 820000 },
    { name: 'Groceries', amount: 540000 },
    { name: 'Transport', amount: 310000 },
    { name: 'Shopping', amount: 260000 },
    { name: 'Entertainment', amount: 140000 },
  ];
  const sampleTotal = sample.reduce((t, s) => t + s.amount, 0);

  // ----- hero -----
  const hero = h(
    'section',
    { class: 'stage hero-stage dark glow' },
    words('h1', 'Your money, one day at a time', 2),
    h('p', { class: 'lead rise' }, 'Track what you spend, see what is left for today, and find out where the rest went. All in one place.'),
    h('button', { class: 'btn white big rise', onclick: onSignup }, 'Open your Cashflow account'),
    h(
      'div',
      { class: 'mock rise', 'aria-hidden': 'true' },
      h(
        'div',
        { class: 'mock-side' },
        h('div', { class: 'logo' }, 'CASHFLOW'),
        h('ul', null, h('li', { class: 'on' }, 'Today'), h('li', null, 'Expenses'), h('li', null, 'Where it goes'), h('li', null, 'Settings')),
      ),
      h(
        'div',
        { class: 'mock-main' },
        h('div', { class: 'mock-head' }, h('span', null, 'Today'), h('span', { class: 'user-chip' }, h('span', { class: 'avatar' }, 'AK'), 'Asha Kapoor')),
        h(
          'div',
          { class: 'mock-grid' },
          h(
            'div',
            null,
            h('div', { class: 'muted small' }, 'Left to spend today'),
            h('div', { class: 'figure' }, fmt(124500)),
            h('div', { class: 'meter' }, h('i', { style: { width: '38%' } }), h('b', { style: { left: '46%' } })),
            h('div', { class: 'muted small' }, `${fmt(2070000)} of ${fmt(5400000)} spent this month`),
          ),
          h('div', null, h('div', { class: 'muted small', style: { marginBottom: '12px' } }, 'Statistic'), donut(sample, sampleTotal)),
        ),
      ),
    ),
    h('div', { class: 'scroll-hint' }, 'Scroll'),
  );

  // ----- daily finances -----
  const quickAdd = h(
    'div',
    { class: 'panel gridded rise' },
    h(
      'div',
      { class: 'widget' },
      h('h4', null, 'Amount'),
      h('div', { class: 'muted small' }, 'Add expense'),
      h(
        'div',
        { class: 'fake-input' },
        h('div', null, h('strong', null, fmt(45000)), h('span', { class: 'muted small' }, `Left today: ${fmt(124500)}`)),
        h('span', { class: 'pill' }, 'INR'),
      ),
      h('div', { class: 'muted small' }, 'What was it for?'),
      h('div', { class: 'fake-input' }, h('span', { class: 'pill' }, h('span', { class: 'dot', style: { '--c': colorOf('Food & dining') } }), 'Food & dining'), h('span', { class: 'muted' }, 'Lunch')),
      h('div', { class: 'done' }, 'Added!'),
    ),
  );

  const daily = h(
    'section',
    { class: 'section', id: 'features' },
    h(
      'div',
      { class: 'section-head' },
      h('span', { class: 'chip' }, 'Daily finances'),
      words('h2', 'Know your number before you spend'),
      h('p', null, 'One figure each morning: what you can spend today.'),
    ),
    h(
      'div',
      { class: 'split' },
      h(
        'div',
        { class: 'rise' },
        h('span', { class: 'chip' }, 'Quick add'),
        h('h3', null, 'Log an expense in a few seconds'),
        h('p', null, 'Amount, category, done. Your allowance for the day updates the moment you add it.'),
      ),
      quickAdd,
    ),
    h(
      'div',
      { class: 'three' },
      h(
        'article',
        { class: 'feature rise' },
        h('h3', null, 'Analytics'),
        h('p', null, 'See which categories take the biggest share of your month, at a glance.'),
        h('div', { class: 'mini' }, miniRow('fork', '#3987e5', 'Food & dining', fmt(820000), 78), miniRow('bag', '#d95926', 'Groceries', fmt(540000), 52), miniRow('car', '#199e70', 'Transport', fmt(310000), 30)),
      ),
      h(
        'article',
        { class: 'feature rise', style: { transitionDelay: '90ms' } },
        h('h3', null, 'Budgeting'),
        h('p', null, 'Income minus bills and savings gives a budget that follows you through the month.'),
        h('div', { class: 'mini' }, h('div', { class: 'mini-row' }, h('span', { class: 'ico' }, icon('up')), h('span', { class: 'grow' }, h('span', { class: 'stat-big' }, fmt(5400000)), h('span', { class: 'badge' }, 'monthly'), h('div', { class: 'muted small' }, 'Free to spend')))),
        h('div', { class: 'mini' }, h('div', { class: 'mini-row' }, h('span', { class: 'ico' }, icon('today')), h('span', { class: 'grow' }, h('span', { class: 'stat-big' }, fmt(180000)), h('span', { class: 'badge' }, 'per day'), h('div', { class: 'muted small' }, 'Daily allowance')))),
      ),
      h(
        'article',
        { class: 'feature rise', style: { transitionDelay: '180ms' } },
        h('h3', null, 'Expenses'),
        h('p', null, 'Every expense in one list, grouped by day, with a running total for each.'),
        h('div', { class: 'mini' }, miniRow('bag', '#c9a2f2', 'Shopping', fmt(33000)), miniRow('fork', '#a5e3b3', 'Restaurants', fmt(15400)), miniRow('car', '#a9cdf6', 'Travel', fmt(259200))),
      ),
    ),
  );

  // ----- tabbed tour -----
  const tour = [
    { label: 'Daily allowance', icon: 'today', text: 'Your budget for the rest of the month, split over the days you have left. Spend less today and tomorrow gets bigger.', rows: [miniRow('today', '#0b0b0b', 'Today', fmt(124500)), miniRow('up', '#0b0b0b', 'From tomorrow', fmt(131200))] },
    { label: 'Expense log', icon: 'list', text: 'A day-by-day list of everything you spent, with notes, so nothing goes missing.', rows: [miniRow('fork', '#3987e5', 'Lunch', fmt(45000)), miniRow('car', '#199e70', 'Metro card', fmt(20000)), miniRow('bag', '#d95926', 'Vegetables', fmt(38000))] },
    { label: 'Where it goes', icon: 'pie', text: 'Totals for each category and each day of the month, set against your daily budget.', rows: sample.slice(0, 3).map((s) => miniRow('pie', colorOf(s.name), s.name, `${Math.round((s.amount / sampleTotal) * 100)}%`, (s.amount / sample[0].amount) * 100)) },
    { label: 'Six-month trend', icon: 'up', text: 'See whether this month is running above or below the ones before it.', rows: [miniRow('up', '#0b0b0b', 'This month', fmt(2070000)), miniRow('up', '#8f8f8a', 'Last month', fmt(4810000))] },
    { label: 'CSV export', icon: 'down', text: 'Download any month as a spreadsheet file whenever you want a copy of your data.', rows: [miniRow('down', '#0b0b0b', 'cashflow-2026-11.csv', 'Ready')] },
  ];
  const tabPanel = h('div', { class: 'panel tabpanel', role: 'tabpanel' });
  const tabList = h('div', { class: 'tablist', role: 'tablist', 'aria-label': 'Features' });
  function showTab(index) {
    const t = tour[index];
    [...tabList.children].forEach((b, i) => b.setAttribute('aria-selected', String(i === index)));
    tabPanel.replaceChildren(h('h3', null, h('span', { class: 'ico', style: { '--c': '#fff', color: '#0b0b0b' } }, icon(t.icon)), t.label), h('p', null, t.text), h('div', { class: 'mini' }, t.rows));
  }
  tour.forEach((t, i) => tabList.append(h('button', { role: 'tab', onclick: () => showTab(i) }, t.label)));
  showTab(0);
  const tourSection = h('section', { class: 'section', id: 'tour' }, h('div', { class: 'tabbed rise' }, tabList, tabPanel));

  // ----- how it works -----
  const steps = h(
    'section',
    { class: 'stage steps-stage dark glow', id: 'how' },
    h('span', { class: 'chip' }, 'How it works'),
    words('h2', 'The maths behind your daily number', 3),
    h('p', { class: 'rise' }, 'No bank connection and no guesswork. Three figures from you, and the rest is arithmetic.'),
    h(
      'div',
      { class: 'steps rise' },
      h('div', { class: 'step' }, h('span', { class: 'n' }, 'Step 1'), h('span', { class: 'big' }, 'Income'), h('p', null, 'Take what you earn each month, then subtract fixed bills and the amount you want to save.')),
      h('div', { class: 'step' }, h('span', { class: 'n' }, 'Step 2'), h('span', { class: 'big' }, '÷ days left'), h('p', null, 'Whatever is still unspent is shared across the remaining days of the month.')),
      h('div', { class: 'step' }, h('span', { class: 'n' }, 'Step 3'), h('span', { class: 'big' }, 'It adjusts'), h('p', null, 'Each expense you add changes the figure straight away, for today and for the days ahead.')),
    ),
  );

  // ----- advantages -----
  const adv = h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'split' },
      h('div', null, h('span', { class: 'chip' }, 'Why Cashflow'), words('h2', 'Discover the advantages of knowing', 2)),
      h(
        'div',
        { class: 'adv' },
        h('article', { class: 'feature rise' }, h('span', { class: 'ico' }, icon('bolt')), h('h3', null, 'Easy'), h('p', null, 'One screen tells you where you stand today.')),
        h('article', { class: 'feature rise', style: { transitionDelay: '90ms' } }, h('span', { class: 'ico' }, icon('lock')), h('h3', null, 'Private'), h('p', null, 'Your own login. Nobody else sees your expenses.')),
        h('article', { class: 'feature rise', style: { transitionDelay: '180ms' } }, h('span', { class: 'ico' }, icon('check')), h('h3', null, 'Clear'), h('p', null, 'Exact amounts, by category and by day.')),
        h('article', { class: 'feature rise', style: { transitionDelay: '270ms' } }, h('span', { class: 'ico' }, icon('down')), h('h3', null, 'Portable'), h('p', null, 'Export any month to a CSV file.')),
      ),
    ),
  );

  const cta = h(
    'section',
    { class: 'stage cta-stage dark glow right' },
    words('h2', 'Start with today. The month follows.', 3),
    h('div', { class: 'cta-row rise' }, h('button', { class: 'btn white big', onclick: onSignup }, 'Get started today'), h('button', { class: 'btn glass big', onclick: onLogin }, 'Log in')),
  );

  const root = h(
    'div',
    { class: 'landing' },
    h(
      'header',
      { class: 'topnav' },
      h('div', { class: 'left' }, h('a', { class: 'linkbtn opt', href: '#features' }, 'Features'), h('a', { class: 'linkbtn opt', href: '#tour' }, 'Tour'), h('a', { class: 'linkbtn opt', href: '#how' }, 'How it works')),
      h('div', { class: 'logo' }, 'CASHFLOW'),
      h('div', { class: 'right' }, h('button', { class: 'linkbtn', onclick: onLogin }, 'Log in'), h('button', { class: 'btn black', onclick: onSignup }, 'Sign up')),
    ),
    hero,
    daily,
    tourSection,
    steps,
    adv,
    cta,
    h(
      'footer',
      { class: 'footer' },
      h('div', null, h('div', { class: 'logo' }, 'CASHFLOW'), 'Your money, one day at a time.'),
      h('nav', { 'aria-label': 'Sections' }, h('strong', null, 'Sections'), h('a', { href: '#features' }, 'Features'), h('a', { href: '#tour' }, 'Tour'), h('a', { href: '#how' }, 'How it works')),
      h('nav', { 'aria-label': 'Account' }, h('strong', null, 'Account'), h('button', { onclick: onLogin }, 'Log in'), h('button', { onclick: onSignup }, 'Sign up')),
    ),
  );

  // Start the hero straight away; everything else animates as it scrolls into view.
  setTimeout(() => hero.querySelectorAll('.words, .rise').forEach((el) => el.classList.add('in')), 80);
  setTimeout(() => watchReveals(root), 0);
  return root;
}
