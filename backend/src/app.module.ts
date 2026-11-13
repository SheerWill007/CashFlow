import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [DatabaseModule, AuthModule, ExpensesModule],
})
export class AppModule {}
