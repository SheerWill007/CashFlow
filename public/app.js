'use strict';

// ---------- tiny DOM helpers (text is always set as text, never as HTML) ----------

const PROPS = new Set(['value', 'checked', 'selected', 'disabled']);

function applyAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style') {
      for (const [p, val] of Object.entries(v)) {
        if (p.startsWith('--')) el.style.setProperty(p, val);
        else el.style[p] = val;
      }
    } else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (PROPS.has(k)) el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
}

function addKids(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : String(kid));
  }
  return el;
}

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  applyAttrs(el, attrs);
  return addKids(el, kids);
}

function svg(tag, attrs, ...kids) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  applyAttrs(el, attrs);
  return addKids(el, kids);
}

// ---------- state ----------

const state = {
  user: null,
  categories: [],
  currencies: [],
  view: 'today',
  screen: 'landing', // logged-out: 'landing' or 'auth'
  authMode: 'login',
  month: null, // month shown on Expenses / Where it goes
  cache: {}, // month -> expenses
  trend: {}, // month -> six-month totals
};

// Fixed colour per category, in a colour-blind-safe order; "Other" stays neutral.
const CATEGORY_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#898781'];
const colorOf = (cat) => CATEGORY_COLORS[state.categories.indexOf(cat)] || '#898781';

const VIEWS = [
  ['today', 'Today', 'today'],
  ['expenses', 'Expenses', 'list'],
  ['insights', 'Where it goes', 'pie'],
  ['settings', 'Settings', 'gear'],
];

// ---------- dates & money ----------

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const thisMonth = () => today().slice(0, 7);
const daysIn = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};
const shiftMonth = (month, delta) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthName = (month, opts = { month: 'long', year: 'numeric' }) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, opts);
};
const dayLabel = (date) => {
  if (date === today()) return 'Today';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

function fmt(minor, opts = {}) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: state.user ? state.user.currency : 'INR',
    ...opts,
  }).format(minor / 100);
}
const fmtShort = (minor) => fmt(minor, { notation: 'compact', maximumFractionDigits: 1 });
const fmtWhole = (minor) => fmt(minor, { maximumFractionDigits: 0 });

function parseMoney(text) {
  const n = Number(String(text).replace(/,/g, '').trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

const sum = (list) => list.reduce((t, e) => t + e.amount, 0);

// ---------- api ----------

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && state.user) {
    state.user = null;
    render();
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

async function loadMonth(month) {
  if (!state.cache[month]) {
    state.cache[month] = (await api('GET', `/api/expenses?month=${month}`)).expenses;
  }
  return state.cache[month];
}

async function loadTrend(month) {
  if (!state.trend[month]) state.trend[month] = (await api('GET', `/api/trend?month=${month}`)).months;
  return state.trend[month];
}

let toastTimer;
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ---------- auth screen ----------

function authView() {
  let mode = state.authMode;
  const error = h('div', { class: 'error', role: 'alert' });
  const card = h('div', { class: 'auth-card' });

  async function submit(ev) {
    ev.preventDefault();
    const form = new FormData(ev.target);
    const button = ev.target.querySelector('button[type=submit]');
    error.textContent = '';
    button.disabled = true;
    try {
      const data = await api('POST', mode === 'login' ? '/api/login' : '/api/signup', {
        name: form.get('name') || undefined,
        email: form.get('email'),
        password: form.get('password'),
      });
      state.user = data.user;
      state.cache = {};
      state.trend = {};
      state.view = mode === 'signup' ? 'settings' : 'today';
      render();
    } catch (err) {
      error.textContent = err.message;
      button.disabled = false;
    }
  }

  function draw() {
    const signup = mode === 'signup';
    card.replaceChildren(
      h(
        'div',
        { class: 'tabs', role: 'tablist' },
        h('button', { type: 'button', role: 'tab', 'aria-selected': String(!signup), onclick: () => ((mode = 'login'), draw()) }, 'Log in'),
        h('button', { type: 'button', role: 'tab', 'aria-selected': String(signup), onclick: () => ((mode = 'signup'), draw()) }, 'Sign up'),
      ),
      h('h2', null, signup ? 'Create your account' : 'Welcome back'),
      h(
        'form',
        { class: 'stack', onsubmit: submit },
        signup && h('label', { class: 'field' }, 'Name', h('input', { name: 'name', required: true, maxlength: 60, autocomplete: 'name' })),
        h('label', { class: 'field' }, 'Email', h('input', { name: 'email', type: 'email', required: true, autocomplete: 'email' })),
        h(
          'label',
          { class: 'field' },
          signup ? 'Password (8+ characters)' : 'Password',
          h('input', {
            name: 'password',
            type: 'password',
            required: true,
            minlength: signup ? 8 : undefined,
            autocomplete: signup ? 'new-password' : 'current-password',
          }),
        ),
        error,
        h('button', { class: 'btn primary wide', type: 'submit' }, signup ? 'Create account' : 'Log in'),
      ),
    );
    error.textContent = '';
  }
  draw();

  const back = () => {
    state.screen = 'landing';
    render();
  };
  const hero = h(
    'section',
    { class: 'auth-hero dark glow' },
    h('span', { class: 'chip', style: { alignSelf: 'flex-start' } }, 'Daily finances'),
    h(
      'div',
      null,
      words('h1', 'Know what you can spend today', 5),
      h('p', { class: 'rise' }, 'Track every expense, get a daily allowance that adjusts as you spend, and see exactly where the money goes.'),
    ),
  );
  setTimeout(() => hero.querySelectorAll('.words, .rise').forEach((el) => el.classList.add('in')), 80);

  return h(
    'div',
    { class: 'auth' },
    h(
      'header',
      { class: 'topnav' },
      h('div', { class: 'left' }, h('button', { class: 'linkbtn', onclick: back }, '← Back')),
      h('div', { class: 'logo' }, 'CASHFLOW'),
      h('div', { class: 'right' }),
    ),
    h('div', { class: 'auth-grid' }, hero, h('section', { class: 'auth-panel panel gridded' }, card)),
  );
}

// ---------- shared pieces ----------

function monthSwitch() {
  const atLatest = state.month >= thisMonth();
  const go = (delta) => {
    state.month = shiftMonth(state.month, delta);
    render();
  };
  return h(
    'div',
    { class: 'month-switch' },
    h('button', { class: 'btn icon', 'aria-label': 'Previous month', onclick: () => go(-1) }, '‹'),
    h('span', null, monthName(state.month)),
    h('button', { class: 'btn icon', 'aria-label': 'Next month', disabled: atLatest, onclick: () => go(1) }, '›'),
  );
}

function expenseForm(defaultDate) {
  const error = h('div', { class: 'error', role: 'alert' });
  async function submit(ev) {
    ev.preventDefault();
    const form = new FormData(ev.target);
    const amount = parseMoney(form.get('amount'));
    error.textContent = '';
    if (!amount) {
      error.textContent = 'Enter an amount greater than zero';
      return;
    }
    try {
      const { expense } = await api('POST', '/api/expenses', {
        amount,
        category: form.get('category'),
        date: form.get('date'),
        note: form.get('note'),
      });
      const month = expense.date.slice(0, 7);
      if (state.cache[month]) {
        state.cache[month].push(expense);
        state.cache[month].sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1));
      }
      state.trend = {};
      toast(`Added ${fmt(expense.amount)}`);
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  }
  return h(
    'form',
    { onsubmit: submit },
    h(
      'div',
      { class: 'add-form' },
      h('label', { class: 'field' }, 'Amount', h('input', { name: 'amount', inputmode: 'decimal', placeholder: '0.00', required: true, autocomplete: 'off' })),
      h(
        'label',
        { class: 'field' },
        'Category',
        h('select', { name: 'category' }, state.categories.map((c) => h('option', { value: c }, c))),
      ),
      h('label', { class: 'field' }, 'Date', h('input', { name: 'date', type: 'date', value: defaultDate, max: today(), required: true })),
      h('label', { class: 'field' }, 'Note (optional)', h('input', { name: 'note', maxlength: 140, placeholder: 'e.g. lunch with Sam' })),
      h('button', { class: 'btn primary', type: 'submit' }, 'Add expense'),
    ),
    error,
  );
}

async function removeExpense(expense) {
  if (!window.confirm(`Delete ${fmt(expense.amount)} · ${expense.category}?`)) return;
  try {
    await api('DELETE', `/api/expenses/${expense.id}`);
    const month = expense.date.slice(0, 7);
    if (state.cache[month]) state.cache[month] = state.cache[month].filter((e) => e.id !== expense.id);
    state.trend = {};
    toast('Expense deleted');
    render();
  } catch (err) {
    toast(err.message);
  }
}

function expenseRow(e, { showDate = false } = {}) {
  return h(
    'div',
    { class: 'row' },
    h('span', { class: 'dot', style: { '--c': colorOf(e.category) } }),
    h(
      'div',
      { class: 'what' },
      h('div', null, e.note || e.category),
      h('div', { class: 'muted small' }, [e.note ? e.category : null, showDate ? dayLabel(e.date) : null].filter(Boolean).join(' · ')),
    ),
    h('span', { class: 'amt' }, fmt(e.amount)),
    h('button', { class: 'del', 'aria-label': `Delete ${e.note || e.category}`, title: 'Delete', onclick: () => removeExpense(e) }, '×'),
  );
}

function tile(k, v, d) {
  return h('div', { class: 'tile' }, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v), d && h('div', { class: 'd' }, d));
}

// Share of spending by category: ring plus a legend (largest five named).
function donut(parts, total) {
  const R = 50, C = 2 * Math.PI * R;
  const ring = svg('svg', { viewBox: '0 0 132 132', role: 'img', 'aria-label': 'Share of spending by category' });
  ring.append(svg('circle', { cx: 66, cy: 66, r: R, fill: 'none', stroke: 'rgba(255,255,255,0.07)', 'stroke-width': 14 }));
  let offset = 0;
  for (const p of parts) {
    const len = (p.amount / total) * C;
    const gap = len > 5 ? 2.5 : 0;
    ring.append(
      svg(
        'circle',
        { cx: 66, cy: 66, r: R, fill: 'none', stroke: colorOf(p.name), 'stroke-width': 14, 'stroke-dasharray': `${len - gap} ${C - len + gap}`, 'stroke-dashoffset': -offset, transform: 'rotate(-90 66 66)' },
        svg('title', null, `${p.name}: ${fmt(p.amount)}`),
      ),
    );
    offset += len;
  }
  ring.append(svg('text', { class: 'center-k', x: 66, y: 60, 'text-anchor': 'middle' }, 'SPENT'), svg('text', { class: 'center', x: 66, y: 78, 'text-anchor': 'middle' }, fmtShort(total)));
  return h(
    'div',
    { class: 'statistic' },
    ring,
    h(
      'div',
      { class: 'legend' },
      parts.slice(0, 5).map((p) => h('div', null, h('span', { class: 'dot', style: { '--c': colorOf(p.name) } }), h('span', null, p.name), h('span', null, `${Math.round((p.amount / total) * 100)}%`))),
    ),
  );
}

function byCategory(expenses) {
  return state.categories
    .map((c) => ({ name: c, amount: sum(expenses.filter((e) => e.category === c)) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// What is free to spend each month after fixed bills and savings.
const monthlyBudget = (u) => u.income - u.fixed - u.savings;

// ---------- Today ----------

async function todayView() {
  const month = thisMonth();
  const date = today();
  const expenses = await loadMonth(month);
  const u = state.user;
  const budget = monthlyBudget(u);
  const day = Number(date.slice(8));
  const total = daysIn(month);
  const daysLeft = total - day + 1;

  const todays = expenses.filter((e) => e.date === date);
  const spentToday = sum(todays);
  const spentMonth = sum(expenses);
  const spentBefore = spentMonth - spentToday;
  // Today's allowance: what's left after earlier days, spread over the days remaining.
  const allowance = Math.max(0, Math.round((budget - spentBefore) / daysLeft));
  const leftToday = allowance - spentToday;
  const leftMonth = budget - spentMonth;
  const hasBudget = budget > 0;

  const hero = h(
    'section',
    { class: 'hero glow' },
    h('div', { class: 'label' }, !hasBudget ? 'Spent today' : leftToday >= 0 ? 'Left to spend today' : 'Over today’s allowance by'),
    h('div', { class: `figure${hasBudget && leftToday < 0 ? ' over' : ''}` }, fmt(hasBudget ? Math.abs(leftToday) : spentToday)),
    h(
      'div',
      { class: 'sub' },
      hasBudget
        ? `${fmt(allowance)} allowance for today · ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left in ${monthName(month, { month: 'long' })}`
        : 'Add your income in Settings to get a daily allowance.',
    ),
  );

  const parts = [hero];

  if (!hasBudget) {
    parts.push(
      h(
        'div',
        { class: 'notice' },
        h('span', null, u.income > 0 ? 'Your fixed bills and savings use up all of your income, so there is nothing left to budget.' : 'Tell Cashflow your monthly income to see how much you have per day.'),
        h('button', { class: 'btn primary', onclick: () => go('settings') }, 'Set up budget'),
      ),
    );
  }

  parts.push(
    h(
      'div',
      { class: 'tiles' },
      tile('Spent today', fmt(spentToday), `${todays.length} ${todays.length === 1 ? 'expense' : 'expenses'}`),
      tile('Spent this month', fmt(spentMonth), `${fmt(Math.round(spentMonth / day))} a day so far`),
      tile(
        leftMonth >= 0 ? 'Left this month' : 'Over budget by',
        hasBudget ? fmt(Math.abs(leftMonth)) : '—',
        hasBudget ? `of ${fmt(budget)}` : 'No budget set',
      ),
      tile('Per day from tomorrow', hasBudget && daysLeft > 1 ? fmt(Math.max(0, Math.round(leftMonth / (daysLeft - 1)))) : '—', daysLeft > 1 ? `${daysLeft - 1} days after today` : 'Last day of the month'),
    ),
  );

  const statCard = h(
    'section',
    { class: 'card' },
    h('h2', null, 'Statistic · this month'),
    expenses.length ? donut(byCategory(expenses), spentMonth) : h('p', { class: 'empty' }, 'Add an expense to see where your money goes.'),
  );
  let budgetCard = null;

  if (hasBudget) {
    const pct = Math.min(100, (spentMonth / budget) * 100);
    const pace = (day / total) * 100;
    const expected = Math.round((budget * day) / total);
    const diff = expected - spentMonth;
    budgetCard = (
      h(
        'section',
        { class: 'card' },
        h('h2', null, `${monthName(month, { month: 'long' })} budget`),
        h(
          'div',
          { class: 'meter', role: 'img', 'aria-label': `${Math.round((spentMonth / budget) * 100)}% of budget spent, ${Math.round(pace)}% of the month gone` },
          h('i', { class: spentMonth > budget ? 'over' : '', style: { width: `${pct}%` } }),
          h('b', { style: { left: `calc(${pace}% - 1px)` }, title: 'Where an even pace would be today' }),
        ),
        h(
          'div',
          { class: 'meter-legend' },
          h('span', null, `${fmt(spentMonth)} of ${fmt(budget)} spent`),
          h('span', null, diff >= 0 ? `${fmt(diff)} under an even pace` : `${fmt(-diff)} over an even pace`),
        ),
        h('p', { class: 'muted small', style: { marginTop: '14px' } }, 'The white marker shows where an even pace would put you today.'),
      )
    );
  }
  parts.push(budgetCard ? h('div', { class: 'cols' }, budgetCard, statCard) : statCard);

  parts.push(
    h('section', { class: 'card' }, h('h2', null, 'Add an expense'), expenseForm(date)),
    h(
      'section',
      { class: 'card' },
      h('h2', null, 'Today'),
      todays.length ? h('div', { class: 'list' }, todays.map((e) => expenseRow(e))) : h('p', { class: 'empty' }, 'Nothing spent yet today.'),
    ),
  );

  return [pageHead(`Hi, ${u.name.split(' ')[0]}`), h('div', { class: 'stack' }, parts)];
}

// ---------- Expenses ----------

async function expensesView() {
  const month = state.month;
  const expenses = await loadMonth(month);
  const byDay = new Map();
  for (const e of expenses) {
    if (!byDay.has(e.date)) byDay.set(e.date, []);
    byDay.get(e.date).push(e);
  }
  const list = h('div', { class: 'list' });
  for (const [date, items] of byDay) {
    list.append(h('div', { class: 'day-head' }, h('span', null, dayLabel(date)), h('span', null, fmt(sum(items)))), ...items.map((e) => expenseRow(e)));
  }
  const defaultDate = month === thisMonth() ? today() : `${month}-01`;

  return [
    pageHead('Expenses', monthSwitch()),
    h(
      'div',
      { class: 'stack' },
      h('section', { class: 'card' }, h('h2', null, 'Add an expense'), expenseForm(defaultDate)),
      h(
        'section',
        { class: 'card' },
        h(
          'div',
          { class: 'page-head', style: { marginBottom: '0' } },
          h('h2', { style: { margin: '0' } }, `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'} · ${fmt(sum(expenses))}`),
          expenses.length ? h('a', { class: 'btn', href: `/api/export.csv?month=${month}` }, 'Export CSV') : null,
        ),
        expenses.length ? list : h('p', { class: 'empty' }, `No expenses in ${monthName(month)}.`),
      ),
    ),
  ];
}

// ---------- Where it goes ----------

function niceMax(major) {
  if (major <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(major));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= major) return step * pow;
  return 10 * pow;
}

function dailyChart(month, expenses, budgetPerDay) {
  const n = daysIn(month);
  const totals = Array(n).fill(0);
  for (const e of expenses) totals[Number(e.date.slice(8)) - 1] += e.amount;

  const W = 720, H = 240, L = 48, R = 8, T = 14, B = 26;
  const iw = W - L - R, ih = H - T - B;
  const top = niceMax(Math.max(...totals, budgetPerDay || 0) / 100) * 100;
  const y = (v) => T + ih - (v / top) * ih;
  const slot = iw / n;
  const bw = Math.min(16, slot - 2);

  const tip = h('div', { class: 'tip' });
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Spending for each day of ${monthName(month)}` });

  for (const frac of [0, 0.5, 1]) {
    const v = top * frac;
    root.append(
      svg('line', { class: 'gridline', x1: L, x2: W - R, y1: y(v), y2: y(v) }),
      svg('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, fmtShort(v)),
    );
  }

  totals.forEach((v, i) => {
    const cx = L + slot * i + slot / 2;
    if (v > 0) {
      const bh = Math.max(2, (v / top) * ih);
      const r = Math.min(4, bw / 2, bh);
      const x0 = cx - bw / 2, y0 = T + ih - bh, yb = T + ih;
      root.append(
        svg('path', {
          class: 'bar',
          d: `M${x0},${yb} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw - r} Q${x0 + bw},${y0} ${x0 + bw},${y0 + r} V${yb} Z`,
        }),
      );
    }
    const dayNum = i + 1;
    if (dayNum === 1 || dayNum % 5 === 0) root.append(svg('text', { x: cx, y: H - 6, 'text-anchor': 'middle' }, dayNum));
  });

  if (budgetPerDay > 0) {
    root.append(svg('line', { class: 'budget', x1: L, x2: W - R, y1: y(budgetPerDay), y2: y(budgetPerDay) }));
  }

  // Full-height hit targets so thin bars (and empty days) are easy to hover.
  totals.forEach((v, i) => {
    const hit = svg('rect', { class: 'hit', x: L + slot * i, y: T, width: slot, height: ih });
    hit.addEventListener('pointerenter', () => {
      tip.replaceChildren(h('strong', null, fmt(v)), dayLabel(`${month}-${pad(i + 1)}`));
      tip.style.left = `${((L + slot * i + slot / 2) / W) * 100}%`;
      tip.style.top = `${(Math.min(y(v), y(0) - 8) / H) * 100}%`;
      tip.style.display = 'block';
    });
    hit.addEventListener('pointerleave', () => (tip.style.display = 'none'));
    root.append(hit);
  });

  return h(
    'div',
    null,
    h('div', { class: 'chart' }, root, tip),
    budgetPerDay > 0 &&
      h('div', { class: 'key' }, h('span', { class: 'k-bar' }, 'Spent that day'), h('span', { class: 'k-line' }, `Even daily budget (${fmt(budgetPerDay)})`)),
  );
}

async function insightsView() {
  const month = state.month;
  const [expenses, trend] = await Promise.all([loadMonth(month), loadTrend(month)]);
  const total = sum(expenses);
  const budget = monthlyBudget(state.user);
  const n = daysIn(month);
  const daysCounted = month === thisMonth() ? Number(today().slice(8)) : n;

  const byCat = byCategory(expenses);
  const maxCat = byCat.length ? byCat[0].amount : 0;
  const biggest = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxTrend = Math.max(...trend.map((t) => t.total), 1);

  const head = pageHead('Where it goes', monthSwitch());
  if (!expenses.length) {
    return [head, h('section', { class: 'card' }, h('p', { class: 'empty' }, `No expenses in ${monthName(month)} yet. Add some and the breakdown appears here.`))];
  }

  return [
    head,
    h(
      'div',
      { class: 'stack' },
      h(
        'div',
        { class: 'tiles' },
        tile('Total spent', fmt(total), budget > 0 ? `${Math.round((total / budget) * 100)}% of ${fmtWhole(budget)} budget` : `${expenses.length} expenses`),
        tile('Average per day', fmt(Math.round(total / daysCounted)), `over ${daysCounted} ${daysCounted === 1 ? 'day' : 'days'}`),
        tile('Top category', byCat[0].name, `${fmt(byCat[0].amount)} · ${Math.round((byCat[0].amount / total) * 100)}%`),
        tile('Days with no spending', String(daysCounted - new Set(expenses.map((e) => e.date)).size), `of ${daysCounted}`),
      ),
      h(
        'section',
        { class: 'card' },
        h('h2', null, 'By category'),
        byCat.map((c) =>
          h(
            'div',
            { class: 'cat', style: { '--c': colorOf(c.name) } },
            h('span', { class: 'dot' }),
            h('span', null, c.name),
            h('div', { class: 'track' }, h('i', { style: { width: `${(c.amount / maxCat) * 100}%` } })),
            h('span', { class: 'num' }, fmt(c.amount)),
            h('span', { class: 'pct' }, `${Math.round((c.amount / total) * 100)}%`),
          ),
        ),
      ),
      h('section', { class: 'card' }, h('h2', null, 'Day by day'), dailyChart(month, expenses, budget > 0 ? Math.round(budget / n) : 0)),
      h(
        'div',
        { class: 'cols' },
        h(
          'section',
          { class: 'card' },
          h('h2', null, 'Last 6 months'),
          h(
            'div',
            { class: 'trend' },
            trend.map((t) =>
              h(
                'div',
                { class: `col${t.month === month ? ' now' : ''}`, title: `${monthName(t.month)}: ${fmt(t.total)}` },
                h('span', { class: 'val' }, t.total ? fmtShort(t.total) : '–'),
                h('i', { style: { height: `${(t.total / maxTrend) * 70}%` } }),
                h('span', null, monthName(t.month, { month: 'short' })),
              ),
            ),
          ),
        ),
        h('section', { class: 'card' }, h('h2', null, 'Biggest expenses'), h('div', { class: 'list' }, biggest.map((e) => expenseRow(e, { showDate: true })))),
      ),
    ),
  ];
}

// ---------- Settings ----------

function settingsView() {
  const u = state.user;
  const error = h('div', { class: 'error', role: 'alert' });
  const summary = h('div');
  const toInput = (minor) => (minor ? String(minor / 100) : '');
  const inputs = {
    name: h('input', { name: 'name', value: u.name, required: true, maxlength: 60 }),
    currency: h('select', { name: 'currency' }, state.currencies.map((c) => h('option', { value: c, selected: c === u.currency }, c))),
    income: h('input', { name: 'income', inputmode: 'decimal', value: toInput(u.income), placeholder: '0' }),
    fixed: h('input', { name: 'fixed', inputmode: 'decimal', value: toInput(u.fixed), placeholder: '0' }),
    savings: h('input', { name: 'savings', inputmode: 'decimal', value: toInput(u.savings), placeholder: '0' }),
  };

  function read() {
    return {
      name: inputs.name.value.trim(),
      currency: inputs.currency.value,
      income: parseMoney(inputs.income.value || '0'),
      fixed: parseMoney(inputs.fixed.value || '0'),
      savings: parseMoney(inputs.savings.value || '0'),
    };
  }

  function drawSummary() {
    const v = read();
    const money = (minor) => new Intl.NumberFormat(undefined, { style: 'currency', currency: v.currency }).format(minor / 100);
    const line = (k, val) => h('div', { class: 'summary-line' }, h('span', null, k), h('strong', null, val));
    if (v.income == null || v.fixed == null || v.savings == null) {
      summary.replaceChildren(line('Free to spend each month', '—'));
      return;
    }
    const budget = v.income - v.fixed - v.savings;
    summary.replaceChildren(
      line('Free to spend each month', money(budget)),
      line(`Roughly per day (${daysIn(thisMonth())}-day month)`, money(Math.max(0, Math.round(budget / daysIn(thisMonth()))))),
    );
  }
  Object.values(inputs).forEach((el) => el.addEventListener('input', drawSummary));
  drawSummary();

  async function save(ev) {
    ev.preventDefault();
    const v = read();
    error.textContent = '';
    if (v.income == null || v.fixed == null || v.savings == null) {
      error.textContent = 'Amounts must be numbers, zero or more';
      return;
    }
    try {
      state.user = (await api('PUT', '/api/settings', v)).user;
      toast('Settings saved');
      go('today');
    } catch (err) {
      error.textContent = err.message;
    }
  }

  return [
    pageHead('Settings'),
    h(
      'div',
      { class: 'stack' },
      h(
        'section',
        { class: 'card' },
        h('h2', null, 'Your monthly budget'),
        h(
          'form',
          { class: 'stack', onsubmit: save },
          h(
            'div',
            { class: 'settings-form' },
            h('label', { class: 'field' }, 'Name', inputs.name),
            h('label', { class: 'field' }, 'Currency', inputs.currency),
            h('label', { class: 'field full' }, 'Monthly income (after tax)', inputs.income),
            h('label', { class: 'field' }, 'Fixed bills — rent, EMIs, subscriptions', inputs.fixed),
            h('label', { class: 'field' }, 'Savings goal per month', inputs.savings),
          ),
          summary,
          error,
          h('div', null, h('button', { class: 'btn primary', type: 'submit' }, 'Save')),
        ),
      ),
      h(
        'section',
        { class: 'card' },
        h('h2', null, 'Account'),
        h('p', { class: 'muted', style: { marginBottom: '14px' } }, `Signed in as ${u.email}`),
        h('button', { class: 'btn', onclick: logout }, 'Log out'),
      ),
    ),
  ];
}

// ---------- shell & routing ----------

function pageHead(title, right) {
  const u = state.user;
  const initials = u.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return h(
    'div',
    { class: 'page-head' },
    h('h1', null, title),
    h(
      'div',
      { class: 'head-right' },
      right,
      h('button', { class: 'user-chip', title: 'Settings', onclick: () => go('settings') }, h('span', { class: 'avatar' }, initials), h('span', { class: 'name' }, u.name)),
    ),
  );
}

function go(view) {
  state.view = view;
  history.replaceState(null, '', `#${view}`);
  render();
  window.scrollTo(0, 0);
}

async function logout() {
  await api('POST', '/api/logout').catch(() => {});
  state.user = null;
  state.screen = 'landing';
  state.cache = {};
  state.trend = {};
  history.replaceState(null, '', location.pathname);
  render();
}

let renderToken = 0;
async function render() {
  const app = document.getElementById('app');
  const token = ++renderToken;
  if (!state.user) {
    const open = (mode) => () => {
      state.screen = 'auth';
      state.authMode = mode;
      render();
      window.scrollTo(0, 0);
    };
    app.replaceChildren(state.screen === 'auth' ? authView() : landingView({ onLogin: open('login'), onSignup: open('signup') }));
    return;
  }
  if (!state.month) state.month = thisMonth();

  const builders = { today: todayView, expenses: expensesView, insights: insightsView, settings: settingsView };
  let content;
  try {
    content = await (builders[state.view] || todayView)();
  } catch (err) {
    if (!state.user) return; // session expired; the auth screen is already showing
    content = [h('section', { class: 'card' }, h('p', { class: 'error' }, err.message))];
  }
  if (token !== renderToken) return; // a newer render started while this one was loading

  app.replaceChildren(
    h(
      'div',
      { class: 'shell dark glow' },
      h(
        'aside',
        { class: 'sidebar' },
        h('div', { class: 'logo' }, 'CASHFLOW'),
        h(
          'nav',
          { class: 'nav', 'aria-label': 'Main' },
          VIEWS.map(([id, label, ic]) => h('button', { 'aria-current': state.view === id ? 'page' : undefined, onclick: () => go(id) }, icon(ic), label)),
        ),
        h('div', { class: 'who' }, h('button', { class: 'btn', onclick: logout }, 'Log out')),
      ),
      h('main', { class: 'main' }, content),
    ),
  );
}

async function boot() {
  const data = await api('GET', '/api/me');
  state.user = data.user;
  state.categories = data.categories;
  state.currencies = data.currencies;
  const hash = location.hash.slice(1);
  if (VIEWS.some(([id]) => id === hash)) state.view = hash;
  render();
}

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (state.user && hash !== state.view && VIEWS.some(([id]) => id === hash)) {
    state.view = hash;
    render();
  }
});

boot().catch(() => {
  document.getElementById('app').replaceChildren(h('p', { style: { padding: '40px' } }, 'Could not reach the server. Is it running?'));
});
