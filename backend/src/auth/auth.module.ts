import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimiter } from './rate-limiter';
import { SessionGuard } from './session.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RateLimiter, SessionGuard],
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
