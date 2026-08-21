import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { ApiError } from '../errors/api-error';
import { UserRole } from '../types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest<Request>().user;
    if (!user) throw ApiError.forbidden('Authentication required for this action');
    if (user.role === 'admin') return true;
    if (!required.includes(user.role)) {
      throw ApiError.forbidden(`Requires one of: ${required.join(', ')}`);
    }
    return true;
  }
}
