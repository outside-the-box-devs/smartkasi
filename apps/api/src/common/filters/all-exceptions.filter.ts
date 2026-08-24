import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { ApiError, ApiErrorCode, ApiErrorDetail } from '../errors/api-error';

/**
 * Every non-2xx response leaves this API in exactly one shape:
 *
 *   { "error": { code, message, details[], request_id } }
 *
 * Clients switch on `code`. If you find yourself throwing a bare Error with a
 * useful message, wrap it in ApiError instead — an untyped 500 is unactionable
 * on the client side.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId =
      (req.headers['x-request-id'] as string) ??
      `req_${randomUUID().slice(0, 12)}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ApiErrorCode.INTERNAL_ERROR;
    let message = 'Something went wrong on our side.';
    let details: ApiErrorDetail[] = [];
    let payload: unknown;

    if (exception instanceof ApiError) {
      status = exception.getStatus();
      code = exception.code;
      message = (exception.getResponse() as { message: string }).message;
      details = exception.details;
      payload = exception.payload;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as string | Record<string, unknown>;

      if (typeof body === 'string') {
        message = body;
      } else if (Array.isArray(body.message)) {
        // class-validator produces string[]; turn it into structured details.
        code = ApiErrorCode.VALIDATION_FAILED;
        message = 'Request validation failed';
        details = (body.message as string[]).map((m) => ({ issue: m }));
      } else if (typeof body.message === 'string') {
        message = body.message;
      }

      if (
        status === HttpStatus.NOT_FOUND &&
        code === ApiErrorCode.INTERNAL_ERROR
      ) {
        code = ApiErrorCode.NOT_FOUND;
      }
      if (
        status === HttpStatus.UNAUTHORIZED &&
        code === ApiErrorCode.INTERNAL_ERROR
      ) {
        code = ApiErrorCode.UNAUTHENTICATED;
      }
      if (
        status === HttpStatus.FORBIDDEN &&
        code === ApiErrorCode.INTERNAL_ERROR
      ) {
        code = ApiErrorCode.FORBIDDEN;
      }
    } else {
      this.logger.error(
        `${requestId} ${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: Record<string, unknown> = {
      error: { code, message, details, request_id: requestId },
    };
    if (payload !== undefined) body.data = payload;

    res.status(status).json(body);
  }
}
