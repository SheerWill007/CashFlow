'use strict';

// Cashflow — zero-dependency server: static files + JSON API + SQLite (node:sqlite).

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SESSION_DAYS = 30;
const SECURE_COOKIE = process.env.NODE_ENV === 'production';

const CATEGORIES = [
  'Food & dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Bills & utilities',
  'Health',
  'Entertainment',
  'Other',
];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'CAD', 'AUD', 'SGD'];
const MAX_AMOUNT = 1e11; // minor units

// ---------- database ----------

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'cashflow.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    income INTEGER NOT NULL DEFAULT 0,
    fixed INTEGER NOT NULL DEFAULT 0,
    savings INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    spent_on TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS expenses_user_day ON expenses (user_id, spent_on);
`);
db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());

// ---------- helpers ----------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
};

function send(res, status, body, headers = {}) {
  const isJson = typeof body === 'object' && !Buffer.isBuffer(body);
  const payload = isJson ? JSON.stringify(body) : body;
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    // Requiring a JSON content type blocks cross-site form posts.
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) {
      return reject(new HttpError(415, 'Expected application/json'));
    }
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 10_000) {
        reject(new HttpError(413, 'Request too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
        resolve(data);
      } catch {
        reject(new HttpError(400, 'Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');

function cookieValue(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

function sessionCookie(token, maxAgeSec) {
  return `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}${SECURE_COOKIE ? '; Secure' : ''}`;
}

function startSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    sha256(token),
    userId,
    Date.now() + SESSION_DAYS * 86_400_000,
  );
  return sessionCookie(token, SESSION_DAYS * 86_400);
}

function currentUser(req) {
  const token = cookieValue(req, 'sid');
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(sha256(token), Date.now()) || null
  );
}

function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw new HttpError(401, 'Please log in');
  return user;
}

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  currency: u.currency,
  income: u.income,
  fixed: u.fixed,
  savings: u.savings,
});

// Small in-memory limiter for the auth endpoints.
const attempts = new Map();
function rateLimit(req) {
  const key = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || entry.reset < now) entry = { count: 0, reset: now + 15 * 60_000 };
  entry.count += 1;
  attempts.set(key, entry);
  if (entry.count > 30) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of attempts) if (v.reset < now) attempts.delete(k);
}, 60_000).unref();

// ---------- validation ----------

function str(v, label, min, max) {
  if (typeof v !== 'string') throw new HttpError(400, `${label} is required`);
  const s = v.trim();
  if (s.length < min) throw new HttpError(400, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`);
  if (s.length > max) throw new HttpError(400, `${label} is too long`);
  return s;
}

function money(v, label, { allowZero = true } = {}) {
  if (!Number.isInteger(v) || v < 0 || v > MAX_AMOUNT || (!allowZero && v === 0)) {
    throw new HttpError(400, `${label} must be a valid amount`);
  }
  return v;
}

function isDay(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function monthParam(url) {
  const m = url.searchParams.get('month') || '';
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)) throw new HttpError(400, 'month must be YYYY-MM');
  return m;
}

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

const expenseRow = (e) => ({
  id: e.id,
  amount: e.amount,
  category: e.category,
  note: e.note,
  date: e.spent_on,
});

function monthExpenses(userId, month) {
  return db
    .prepare(
      `SELECT * FROM expenses WHERE user_id = ? AND spent_on BETWEEN ? AND ?
       ORDER BY spent_on DESC, id DESC`,
    )
    .all(userId, `${month}-01`, `${month}-31`);
}

// ---------- API ----------

async function api(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'POST /api/signup') {
    rateLimit(req);
    const body = await readJson(req);
    const name = str(body.name, 'Name', 1, 60);
    const email = str(body.email, 'Email', 3, 200).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address');
    if (typeof body.password !== 'string' || body.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }
    if (body.password.length > 200) throw new HttpError(400, 'Password is too long');
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
      throw new HttpError(409, 'An account with that email already exists');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const info = db
      .prepare('INSERT INTO users (name, email, pass_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(name, email, hashPassword(body.password, salt), salt, Date.now());
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    return send(res, 201, { user: publicUser(user) }, { 'Set-Cookie': startSession(user.id) });
  }

  if (route === 'POST /api/login') {
    rateLimit(req);
    const body = await readJson(req);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    // Hash even when the account is missing so timing doesn't reveal which emails exist.
    const hash = Buffer.from(hashPassword(password, user ? user.salt : 'no-such-user-salt'), 'hex');
    const ok = user && crypto.timingSafeEqual(hash, Buffer.from(user.pass_hash, 'hex'));
    if (!ok) throw new HttpError(401, 'Wrong email or password');
    return send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': startSession(user.id) });
  }

  if (route === 'POST /api/logout') {
    const token = cookieValue(req, 'sid');
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
  }

  if (route === 'GET /api/me') {
    const user = currentUser(req);
    return send(res, 200, { user: user ? publicUser(user) : null, categories: CATEGORIES, currencies: CURRENCIES });
  }

  const user = requireUser(req);

  if (route === 'PUT /api/settings') {
    const body = await readJson(req);
    const name = str(body.name, 'Name', 1, 60);
    if (!CURRENCIES.includes(body.currency)) throw new HttpError(400, 'Unsupported currency');
    const income = money(body.income, 'Monthly income');
    const fixed = money(body.fixed, 'Fixed bills');
    const savings = money(body.savings, 'Savings goal');
    db.prepare('UPDATE users SET name = ?, currency = ?, income = ?, fixed = ?, savings = ? WHERE id = ?').run(
      name,
      body.currency,
      income,
      fixed,
      savings,
      user.id,
    );
    return send(res, 200, { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) });
  }

  if (route === 'GET /api/expenses') {
    return send(res, 200, { expenses: monthExpenses(user.id, monthParam(url)).map(expenseRow) });
  }

  if (route === 'POST /api/expenses') {
    const body = await readJson(req);
    const amount = money(body.amount, 'Amount', { allowZero: false });
    if (!CATEGORIES.includes(body.category)) throw new HttpError(400, 'Pick a category');
    if (!isDay(body.date)) throw new HttpError(400, 'Pick a valid date');
    const note = body.note == null ? '' : str(String(body.note), 'Note', 0, 140);
    const info = db
      .prepare('INSERT INTO expenses (user_id, amount, category, note, spent_on, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(user.id, amount, body.category, note, body.date, Date.now());
    const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    return send(res, 201, { expense: expenseRow(row) });
  }

  const del = /^\/api\/expenses\/(\d+)$/.exec(url.pathname);
  if (del && req.method === 'DELETE') {
    const info = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(Number(del[1]), user.id);
    if (!info.changes) throw new HttpError(404, 'Expense not found');
    return send(res, 200, { ok: true });
  }

  if (route === 'GET /api/trend') {
    // Totals for the six months ending at ?month=
    const end = monthParam(url);
    const start = shiftMonth(end, -5);
    const rows = db
      .prepare(
        `SELECT substr(spent_on, 1, 7) AS month, SUM(amount) AS total FROM expenses
         WHERE user_id = ? AND spent_on BETWEEN ? AND ? GROUP BY month`,
      )
      .all(user.id, `${start}-01`, `${end}-31`);
    const totals = Object.fromEntries(rows.map((r) => [r.month, r.total]));
    const months = [];
    for (let i = 0; i < 6; i++) {
      const m = shiftMonth(start, i);
      months.push({ month: m, total: totals[m] || 0 });
    }
    return send(res, 200, { months });
  }

  if (route === 'GET /api/export.csv') {
    const month = monthParam(url);
    const cell = (v) => {
      let s = String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheets treating notes as formulas
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = ['Date,Category,Note,Amount'];
    for (const e of monthExpenses(user.id, month).reverse()) {
      lines.push([e.spent_on, cell(e.category), cell(e.note), (e.amount / 100).toFixed(2)].join(','));
    }
    return send(res, 200, lines.join('\r\n') + '\r\n', {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cashflow-${month}.csv"`,
    });
  }

  throw new HttpError(404, 'Not found');
}

// ---------- static files ----------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed');
  let rel;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    throw new HttpError(400, 'Bad path');
  }
  let file = path.join(PUBLIC_DIR, rel);
  if (file !== PUBLIC_DIR && !file.startsWith(PUBLIC_DIR + path.sep)) throw new HttpError(403, 'Forbidden');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(PUBLIC_DIR, 'index.html');
  send(res, 200, fs.readFileSync(file), {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
}

// ---------- server ----------

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else serveStatic(req, res, url);
  } catch (err) {
    if (res.headersSent) return res.end();
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'Something went wrong' });
  }
});

server.listen(PORT, () => console.log(`Cashflow running at http://localhost:${PORT}`));
