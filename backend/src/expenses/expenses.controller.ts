import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser, SessionGuard } from '../auth/session.guard';
import type { UserRow } from '../common/types';
import { parseMonth } from '../common/validation';
import { CreateExpenseDto } from './expenses.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(SessionGuard)
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  list(@CurrentUser() user: UserRow, @Query('month') month: string) {
    return { expenses: this.expenses.list(user.id, parseMonth(month)) };
  }

  @Post()
  create(@CurrentUser() user: UserRow, @Body() dto: CreateExpenseDto) {
    return { expense: this.expenses.create(user.id, dto) };
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserRow, @Param('id', ParseIntPipe) id: number) {
    this.expenses.remove(user.id, id);
    return { ok: true };
  }
}

@Controller()
@UseGuards(SessionGuard)
export class ReportsController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get('trend')
  trend(@CurrentUser() user: UserRow, @Query('month') month: string) {
    return { months: this.expenses.trend(user.id, parseMonth(month)) };
  }

  @Get('export.csv')
  exportCsv(@CurrentUser() user: UserRow, @Query('month') month: string, @Res({ passthrough: true }) res: Response) {
    const m = parseMonth(month);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cashflow-${m}.csv"`);
    return this.expenses.csv(user.id, m);
  }
}
