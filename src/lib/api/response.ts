/**
 * Centralized API Response & Error Handling Utilities
 * The Jawed Habib Salon – Lalganj
 *
 * Provides consistent, structured HTTP JSON responses across all route handlers.
 * Ensures error messages are sanitized and sensitive internal stack traces or SQL
 * errors are never exposed to the client in production.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
  code?: string;
  retryAfterMs?: number;
  meta?: Record<string, any>;
}

/**
 * Standard successful response (HTTP 200 OK by default, or 201 Created)
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    meta?: Record<string, any>;
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponse<T>> {
  const status = options?.status ?? 200;
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };

  if (options?.message) {
    payload.message = options.message;
  }
  if (options?.meta) {
    payload.meta = options.meta;
  }

  return NextResponse.json(payload, {
    status,
    headers: options?.headers,
  });
}

/**
 * Standard client or operational error response
 */
export function apiError(
  message: string,
  status: number = 400,
  options?: {
    code?: string;
    details?: any;
    retryAfterMs?: number;
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponse<null>> {
  const payload: ApiResponse<null> = {
    success: false,
    error: message,
  };

  if (options?.code) {
    payload.code = options.code;
  }
  if (options?.details !== undefined) {
    payload.details = options.details;
  }
  if (options?.retryAfterMs !== undefined) {
    payload.retryAfterMs = options.retryAfterMs;
  }

  return NextResponse.json(payload, {
    status,
    headers: options?.headers,
  });
}

/**
 * Zod validation failure response (HTTP 400 Bad Request)
 */
export function apiValidationError(
  error: ZodError,
  message: string = "Validation failed"
): NextResponse<ApiResponse<null>> {
  const flattened = error.flatten();
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: flattened.fieldErrors,
      code: "VALIDATION_ERROR",
    },
    { status: 400 }
  );
}

/**
 * Unauthorized error response (HTTP 401 Unauthorized)
 */
export function apiUnauthorized(
  message: string = "Authentication required. Please sign in."
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "UNAUTHORIZED",
    },
    { status: 401 }
  );
}

/**
 * Forbidden error response (HTTP 403 Forbidden)
 */
export function apiForbidden(
  message: string = "Access denied. Insufficient administrative privileges."
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "FORBIDDEN",
    },
    { status: 403 }
  );
}

/**
 * Resource not found response (HTTP 404 Not Found)
 */
export function apiNotFound(
  message: string = "Requested resource was not found."
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "NOT_FOUND",
    },
    { status: 404 }
  );
}

/**
 * Rate limited error response (HTTP 429 Too Many Requests)
 */
export function apiRateLimited(
  resetInMs: number,
  message: string = "Too many requests. Please wait a few moments before trying again."
): NextResponse<ApiResponse<null>> {
  const retryAfterSeconds = Math.ceil(resetInMs / 1000);
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "RATE_LIMITED",
      retryAfterMs: resetInMs,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}

/**
 * Conflict error response (HTTP 409 Conflict)
 */
export function apiConflict(
  message: string = "A conflict occurred with an existing resource."
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "CONFLICT",
    },
    { status: 409 }
  );
}

/**
 * Sanitized Internal Server Error response (HTTP 500 Internal Server Error)
 * Automatically redacts internal database errors, connection strings, and stack traces.
 */
export function apiServerError(
  error: unknown,
  fallbackMessage: string = "An unexpected server error occurred. Please try again later."
): NextResponse<ApiResponse<null>> {
  let safeMessage = fallbackMessage;

  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    safeMessage = error.message || fallbackMessage;
  }

  return NextResponse.json(
    {
      success: false,
      error: safeMessage,
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}
