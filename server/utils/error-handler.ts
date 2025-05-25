import type { H3Event } from 'h3'
import { ZodError } from 'zod'

export function handleApiError(error: any, event: H3Event) {
  // Log the error
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        message: 'Invalid request data',
        errors: error.errors
      }
    })
  }

  // Handle database errors
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: {
        message: 'Database connection failed. Please try again later.'
      }
    })
  }

  // Handle duplicate key errors (PostgreSQL)
  if (error?.code === '23505') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      data: {
        message: 'This record already exists'
      }
    })
  }

  // Handle foreign key constraint errors
  if (error?.code === '23503') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: {
        message: 'Related record not found'
      }
    })
  }

  // Handle authentication errors
  if (error?.statusCode === 401 || error?.message?.includes('Unauthorized')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: {
        message: 'Please log in to continue'
      }
    })
  }

  // Handle permission errors
  if (error?.statusCode === 403 || error?.message?.includes('Forbidden')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: {
        message: 'You do not have permission to perform this action'
      }
    })
  }

  // Default error
  throw createError({
    statusCode: error?.statusCode || 500,
    statusMessage: error?.statusMessage || 'Internal Server Error',
    data: {
      message: error?.data?.message || error?.message || 'An unexpected error occurred'
    }
  })
}

// Wrapper for async route handlers
export function defineEventHandlerWithError<T>(
  handler: (event: H3Event) => T | Promise<T>
) {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    } catch (error) {
      return handleApiError(error, event)
    }
  })
}