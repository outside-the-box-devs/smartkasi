import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ApiError, ApiErrorCode } from '../errors/api-error';
import { AuthUser, UserRole } from '../types/auth.types';

/**
 * Verifies a Supabase-issued access token. This API issues no tokens and has no
 * login route — see docs/API_CONTRACT.md § Authentication.
 *
 * Two verification modes, because Supabase is mid-migration:
 *   - Legacy projects sign HS256 with a shared secret  -> SUPABASE_JWT_SECRET
 *   - Newer projects sign asymmetrically               -> JWKS endpoint
 * Set one. If both are set the shared secret wins, since that is the explicit
 * choice.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private hsKey?: Uint8Array;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);

    // Public routes still parse the token when present, so a signed-in customer
    // browsing the shop directory gets personalised results without a second
    // code path.
    if (!token) {
      if (isPublic) return true;
      throw new ApiError(
        ApiErrorCode.UNAUTHENTICATED,
        'Missing Authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload = await this.verify(token);
      req.user = this.toUser(payload);
      return true;
    } catch (err) {
      if (isPublic) return true;

      const expired = err instanceof Error && /exp/i.test(err.message);
      throw new ApiError(
        expired ? ApiErrorCode.TOKEN_EXPIRED : ApiErrorCode.UNAUTHENTICATED,
        expired
          ? 'Access token expired — refresh and retry once'
          : 'Invalid access token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return header.slice(7).trim() || null;
  }

  private async verify(token: string): Promise<JWTPayload> {
    const secret = this.config.get<string>('supabase.jwtSecret');

    if (secret) {
      this.hsKey ??= new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, this.hsKey, {
        algorithms: ['HS256'],
      });
      return payload;
    }

    const url = this.config.get<string>('supabase.url');
    if (!url) throw new Error('SUPABASE_URL is not configured');

    this.jwks ??= createRemoteJWKSet(
      new URL(`${url}/auth/v1/.well-known/jwks.json`),
    );
    const { payload } = await jwtVerify(token, this.jwks);
    return payload;
  }

  private toUser(payload: JWTPayload): AuthUser {
    const appMeta = (payload.app_metadata ?? {}) as Record<string, unknown>;
    return {
      id: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: (appMeta.role as UserRole) ?? 'customer',
    };
  }
}
