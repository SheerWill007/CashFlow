import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { toExpense, type ExpenseRow } from '../common/types';
import { isDay, shiftMonth } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import type { CreateExpenseDto } from './expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  private rows(userId: number, month: string): ExpenseRow[] {
    return this.db
      .prepare(
        `SELECT * FROM expenses WHERE user_id = ? AND spent_on BETWEEN ? AND ?
         ORDER BY spent_on DESC, id DESC`,
      )
      .all(userId, `${month}-01`, `${month}-31`) as unknown as ExpenseRow[];
  }

  list(userId: number, month: string) {
    return this.rows(userId, month).map(toExpense);
  }

  create(userId: number, dto: CreateExpenseDto) {
    if (!isDay(dto.date)) throw new BadRequestException('Pick a valid date');
    const info = this.db
      .prepare('INSERT INTO expenses (user_id, amount, category, note, spent_on, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, dto.amount, dto.category, dto.note ?? '', dto.date, Date.now());
    const row = this.db.prepare('SELECT * FROM expenses WHERE id = ?').get(Number(info.lastInsertRowid)) as unknown as ExpenseRow;
    return toExpense(row);
  }

  remove(userId: number, id: number) {
    const info = this.db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
    if (!info.changes) throw new NotFoundException('Expense not found');
  }

  /** Monthly totals for the six months ending at `end`. */
  trend(userId: number, end: string) {
    const start = shiftMonth(end, -5);
    const rows = this.db
      .prepare(
        `SELECT substr(spent_on, 1, 7) AS month, SUM(amount) AS total FROM expenses
         WHERE user_id = ? AND spent_on BETWEEN ? AND ? GROUP BY month`,
      )
      .all(userId, `${start}-01`, `${end}-31`) as unknown as { month: string; total: number }[];
    const totals = new Map(rows.map((r) => [r.month, r.total]));
    return Array.from({ length: 6 }, (_, i) => {
      const month = shiftMonth(start, i);
      return { month, total: totals.get(month) ?? 0 };
    });
  }

  csv(userId: number, month: string): string {
    const cell = (value: string) => {
      // Stop spreadsheets from treating notes as formulas.
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const lines = ['Date,Category,Note,Amount'];
    for (const e of this.rows(userId, month).reverse()) {
      lines.push([e.spent_on, cell(e.category), cell(e.note), (e.amount / 100).toFixed(2)].join(','));
    }
    return lines.join('\r\n') + '\r\n';
  }
}
