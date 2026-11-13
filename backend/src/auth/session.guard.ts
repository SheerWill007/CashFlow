import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { SESSION_COOKIE } from '../common/constants';
import type { AuthedRequest, UserRow } from '../common/types';
import { AuthService } from './auth.service';

/** Rejects requests without a live session and puts the user on `req.user`. */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = this.auth.userForToken(req.cookies?.[SESSION_COOKIE]);
    if (!user) throw new UnauthorizedException('Please log in');
    req.user = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): UserRow => context.switchToHttp().getRequest<AuthedRequest>().user,
);
