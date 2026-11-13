import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { SESSION_DAYS } from '../common/constants';
import type { UserRow } from '../common/types';
import { DatabaseService } from '../database/database.service';
import type { LoginDto, SettingsDto, SignupDto } from './auth.dto';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const hashPassword = (password: string, salt: string) => scryptSync(password, salt, 64).toString('hex');

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  findById(id: number): UserRow | undefined {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  }

  signup(dto: SignupDto): UserRow {
    if (this.db.prepare('SELECT 1 FROM users WHERE email = ?').get(dto.email)) {
      throw new ConflictException('An account with that email already exists');
    }
    const salt = randomBytes(16).toString('hex');
    const info = this.db
      .prepare('INSERT INTO users (name, email, pass_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(dto.name, dto.email, hashPassword(dto.password, salt), salt, Date.now());
    return this.findById(Number(info.lastInsertRowid))!;
  }

  login(dto: LoginDto): UserRow {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(dto.email) as UserRow | undefined;
    // Hash even when the account is missing so response time doesn't reveal which emails exist.
    const hash = Buffer.from(hashPassword(dto.password, user ? user.salt : 'no-such-user-salt'), 'hex');
    if (!user || !timingSafeEqual(hash, Buffer.from(user.pass_hash, 'hex'))) {
      throw new UnauthorizedException('Wrong email or password');
    }
    return user;
  }

  /** Starts a session and returns the raw token for the cookie; only its hash is stored. */
  createSession(userId: number): string {
    const token = randomBytes(32).toString('hex');
    this.db
      .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .run(sha256(token), userId, Date.now() + SESSION_DAYS * 86_400_000);
    return token;
  }

  destroySession(token: unknown) {
    if (typeof token === 'string' && token) {
      this.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    }
  }

  userForToken(token: unknown): UserRow | null {
    if (typeof token !== 'string' || !token) return null;
    const row = this.db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(sha256(token), Date.now());
    return (row as UserRow | undefined) ?? null;
  }

  updateSettings(userId: number, dto: SettingsDto): UserRow {
    this.db
      .prepare('UPDATE users SET name = ?, currency = ?, income = ?, fixed = ?, savings = ? WHERE id = ?')
      .run(dto.name, dto.currency, dto.income, dto.fixed, dto.savings, userId);
    return this.findById(userId)!;
  }
}
