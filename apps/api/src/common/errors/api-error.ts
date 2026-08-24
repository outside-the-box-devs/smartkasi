import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Stable machine-readable error codes. These are part of the frozen contract —
 * clients switch on them. Add new ones freely; never rename or repurpose one.
 * Mirrors ErrorResponse.error.code in api/openapi.yaml.
 */
export enum ApiErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  ALREADY_STOCKED = 'ALREADY_STOCKED',
  STALE_WRITE = 'STALE_WRITE',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  TOTALS_MISMATCH = 'TOTALS_MISMATCH',
  DUPLICATE_SALE = 'DUPLICATE_SALE',
  LICENCE_NOT_VERIFIED = 'LICENCE_NOT_VERIFIED',
  SHOP_NOT_ACCEPTING_ORDERS = 'SHOP_NOT_ACCEPTING_ORDERS',
  QUOTE_EXPIRED = 'QUOTE_EXPIRED',
  SHOPS_TOO_FAR_APART = 'SHOPS_TOO_FAR_APART',
  OUTSIDE_SERVICE_AREA = 'OUTSIDE_SERVICE_AREA',
  ORDER_NOT_CANCELLABLE = 'ORDER_NOT_CANCELLABLE',
  DELIVERY_ALREADY_ASSIGNED = 'DELIVERY_ALREADY_ASSIGNED',
  DELIVERY_NOT_COLLECTED = 'DELIVERY_NOT_COLLECTED',
  COURIER_NOT_AVAILABLE = 'COURIER_NOT_AVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ApiErrorDetail {
  field?: string;
  issue?: string;
  code?: string;
  message?: string;
}

export class ApiError extends HttpException {
  /**
   * Optional body attached alongside the error envelope. Used only where the
   * contract says a 4xx carries useful data — e.g. STALE_WRITE returns the
   * winning inventory row so the client can overwrite locally instead of
   * retrying forever. Emitted as a `data` sibling of `error`, never instead of it.
   */
  public payload?: unknown;

  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details: ApiErrorDetail[] = [],
  ) {
    super({ code, message, details }, status);
  }

  withPayload(payload: unknown): ApiError {
    this.payload = payload;
    return this;
  }

  static notFound(what: string): ApiError {
    return new ApiError(
      ApiErrorCode.NOT_FOUND,
      `${what} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  static forbidden(
    message = 'You do not have access to this resource',
  ): ApiError {
    return new ApiError(ApiErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }

  static unprocessable(
    code: ApiErrorCode,
    message: string,
    details: ApiErrorDetail[] = [],
  ): ApiError {
    return new ApiError(
      code,
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}
