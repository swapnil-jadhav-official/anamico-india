import { NextResponse } from 'next/server'

/**
 * Standard API Response Types
 */
export type ApiResponseSuccess<T = any> = {
  success: true
  message?: string
  data?: T
  [key: string]: any
}

export type ApiResponseError = {
  success: false
  error: string
  code?: string
  details?: any
}

export type ApiResponse<T = any> = ApiResponseSuccess<T> | ApiResponseError

/**
 * Create a standardized success response
 */
export function successResponse<T = any>(
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  additionalFields?: Record<string, any>
): NextResponse<ApiResponseSuccess<T>> {
  const response: ApiResponseSuccess<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...additionalFields,
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponseError> {
  const response: ApiResponseError = {
    success: false,
    error,
    ...(code && { code }),
    ...(details && { details }),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Handle common error cases
 */
export const ApiErrors = {
  UNAUTHORIZED: () =>
    errorResponse('Unauthorized. Please log in.', 401, 'UNAUTHORIZED'),

  FORBIDDEN: () =>
    errorResponse(
      'Forbidden. You do not have permission to perform this action.',
      403,
      'FORBIDDEN'
    ),

  NOT_FOUND: (resource: string = 'Resource') =>
    errorResponse(`${resource} not found.`, 404, 'NOT_FOUND'),

  BAD_REQUEST: (message: string = 'Invalid request') =>
    errorResponse(message, 400, 'BAD_REQUEST'),

  VALIDATION_ERROR: (fields: Record<string, string>) =>
    errorResponse(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      fields
    ),

  INTERNAL_SERVER_ERROR: (message: string = 'An unexpected error occurred') =>
    errorResponse(message, 500, 'INTERNAL_SERVER_ERROR'),

  CONFLICT: (message: string = 'Resource already exists') =>
    errorResponse(message, 409, 'CONFLICT'),

  RATE_LIMIT: () =>
    errorResponse(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT'
    ),

  SERVICE_UNAVAILABLE: () =>
    errorResponse(
      'Service temporarily unavailable. Please try again later.',
      503,
      'SERVICE_UNAVAILABLE'
    ),
}

/**
 * Validate required fields and return validation error if any are missing
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): ApiResponseError | null {
  const missingFields: Record<string, string> = {}

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields[field] = `${field} is required`
    }
  }

  if (Object.keys(missingFields).length > 0) {
    return ApiErrors.VALIDATION_ERROR(missingFields) as any
  }

  return null
}

/**
 * Safely handle async operations and catch errors
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)
    console.error(`[API Error] ${errorMessage}:`, error)
    return { success: false, error: message }
  }
}
