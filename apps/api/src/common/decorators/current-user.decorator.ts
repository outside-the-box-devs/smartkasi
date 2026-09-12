import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../types/auth.types';

/**
 * The authenticated caller, as SupabaseAuthGuard left it on the request.
 *
 * Typed `AuthUser | undefined` rather than `AuthUser`: on a `@Public()` route
 * there is genuinely nobody, and the old signature lied about that. Every
 * public handler reading this already declared the parameter as optional.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    return ctx.switchToHttp().getRequest<Request>().user;
  },
);
