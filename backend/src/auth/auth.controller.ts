import { Body, Controller, Get, HttpCode, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { CATEGORIES, CURRENCIES, SESSION_COOKIE, SESSION_DAYS } from '../common/constants';
import { toPublicUser, type UserRow } from '../common/types';
import { LoginDto, SettingsDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import { RateLimiter } from './rate-limiter';
import { CurrentUser, SessionGuard } from './session.guard';

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
});

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly limiter: RateLimiter,
  ) {}

  private startSession(res: Response, user: UserRow) {
    res.cookie(SESSION_COOKIE, this.auth.createSession(user.id), {
      ...cookieOptions(),
      maxAge: SESSION_DAYS * 86_400_000,
    });
  }

  @Post('signup')
  signup(@Body() dto: SignupDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.limiter.hit(req.ip);
    const user = this.auth.signup(dto);
    this.startSession(res, user);
    return { user: toPublicUser(user) };
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.limiter.hit(req.ip);
    const user = this.auth.login(dto);
    this.startSession(res, user);
    return { user: toPublicUser(user) };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.auth.destroySession(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, cookieOptions());
    return { ok: true };
  }

  @Get('me')
  me(@Req() req: Request) {
    const user = this.auth.userForToken(req.cookies?.[SESSION_COOKIE]);
    return { user: user ? toPublicUser(user) : null, categories: CATEGORIES, currencies: CURRENCIES };
  }

  @Put('settings')
  @UseGuards(SessionGuard)
  settings(@CurrentUser() user: UserRow, @Body() dto: SettingsDto) {
    return { user: toPublicUser(this.auth.updateSettings(user.id, dto)) };
  }
}
