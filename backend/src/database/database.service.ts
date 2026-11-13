import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/** One SQLite file, opened once. Override its folder with DATA_DIR. */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: DatabaseSync;

  constructor() {
    const dir = process.env.DATA_DIR || resolve(__dirname, '..', '..', 'data');
    mkdirSync(dir, { recursive: true });
    this.db = new DatabaseSync(join(dir, 'cashflow.db'));
    this.db.exec(`
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
    this.db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  }

  onModuleDestroy() {
    this.db.close();
  }
}
