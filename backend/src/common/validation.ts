import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

/** The first human-readable message from a class-validator error tree. */
export function firstValidationMessage(errors: ValidationError[]): string {
  for (const error of errors) {
    const message = error.constraints && Object.values(error.constraints)[0];
    if (message) return message;
    if (error.children?.length) {
      const nested = firstValidationMessage(error.children);
      if (nested) return nested;
    }
  }
  return 'Invalid request';
}

export const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
export const trimLower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

/** True for a real calendar date written as YYYY-MM-DD. */
export function isDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function parseMonth(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new BadRequestException('month must be YYYY-MM');
  }
  return value;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}
