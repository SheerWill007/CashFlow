import { HttpException, HttpStatus, Injectable, OnModuleDestroy } from '@nestjs/common';

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 30;

/** Small in-memory limiter for the login and signup endpoints. */
@Injectable()
export class RateLimiter implements OnModuleDestroy {
  private readonly attempts = new Map<string, { count: number; reset: number }>();
  private readonly sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of this.attempts) if (entry.reset < now) this.attempts.delete(key);
  }, 60_000).unref();

  hit(key: string | undefined) {
    const id = key || 'unknown';
    const now = Date.now();
    let entry = this.attempts.get(id);
    if (!entry || entry.reset < now) entry = { count: 0, reset: now + WINDOW_MS };
    entry.count += 1;
    this.attempts.set(id, entry);
    if (entry.count > MAX_ATTEMPTS) {
      throw new HttpException('Too many attempts. Try again in a few minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  onModuleDestroy() {
    clearInterval(this.sweep);
  }
}
