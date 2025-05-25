# Error Handling Guide

This guide explains how to properly handle errors in the Kaygia Web application.

## Table of Contents
- [Global Error System Overview](#global-error-system-overview)
- [Server-Side Error Handling](#server-side-error-handling)
- [Client-Side Error Handling](#client-side-error-handling)
- [Error Pages](#error-pages)
- [Testing Errors](#testing-errors)

## Global Error System Overview

The application has a comprehensive error handling system that:
- Catches all Vue component errors
- Handles unhandled promise rejections
- Provides user-friendly error messages
- Shows toast notifications for minor errors
- Redirects to login on authentication errors
- Logs errors for debugging

## Server-Side Error Handling

### Using the Error Handler Wrapper

The recommended approach is to use the `defineEventHandlerWithError` wrapper that automatically handles errors:

```typescript
import { z } from 'zod'
import { defineEventHandlerWithError } from '~/server/utils/error-handler'

export default defineEventHandlerWithError(async (event) => {
  // Get session - will throw 401 if not authenticated
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Validate input - will throw 400 with validation errors
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email()
  })
  
  const body = await readBody(event)
  const validated = schema.parse(body) // Throws ZodError if invalid

  // Database operation - errors handled automatically
  const db = useDrizzle()
  const result = await db.insert(users).values(validated)

  return {
    success: true,
    data: result
  }
})
```

### Manual Error Handling

For more control, you can handle errors manually:

```typescript
export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    if (!session?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: { message: 'Please log in to continue' }
      })
    }

    // Your logic here
    const data = await someOperation()
    
    return {
      success: true,
      data
    }
  } catch (error) {
    // Use the error handler utility
    return handleApiError(error, event)
  }
})
```

### Common Error Responses

The error handler automatically handles these database errors:
- **Duplicate key (409)**: "This record already exists"
- **Foreign key constraint (400)**: "Related record not found"
- **Connection refused (503)**: "Database connection failed"
- **Validation errors (400)**: Returns detailed validation errors

## Client-Side Error Handling

### Using the Error Handler Composable

```vue
<script setup>
import { useErrorHandler } from '~/composables/useErrorHandler'

const { handleError, withErrorHandling, safeFetch } = useErrorHandler()

// Option 1: Using withErrorHandling
const createProject = async () => {
  const result = await withErrorHandling(
    async () => {
      return await $fetch('/api/projects', {
        method: 'POST',
        body: { name: 'New Project' }
      })
    },
    {
      fallbackMessage: 'Failed to create project',
      showToast: true
    }
  )
  
  if (result) {
    // Success - result contains the data
    navigateTo(`/projects/${result.id}`)
  }
}

// Option 2: Using safeFetch
const loadProjects = async () => {
  const { data, error } = await safeFetch('/api/projects')
  
  if (error) {
    handleError(error, {
      fallbackMessage: 'Failed to load projects'
    })
    return
  }
  
  // Use data
  projects.value = data
}

// Option 3: Manual try-catch
const deleteProject = async (id: string) => {
  try {
    await $fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    })
    toast({
      title: 'Success',
      description: 'Project deleted successfully'
    })
  } catch (error) {
    handleError(error)
  }
}
</script>
```

### Error Handler Options

```typescript
handleError(error, {
  showToast: true,              // Show toast notification (default: true)
  fallbackMessage: 'Custom message', // Fallback if no error message
  redirect: '/dashboard'        // Redirect after error (optional)
})
```

## Error Pages

### Main Error Page (`error.vue`)

Catches all unhandled errors and displays appropriate messages:
- 404: "Page not found"
- 401: "Please log in to continue"
- 403: "You don't have permission"
- 500: "Internal server error"
- 503: "Service temporarily unavailable"

### Custom Error Pages

- `404.vue` - Custom 404 page with helpful navigation
- `500.vue` - Custom server error page

## Testing Errors

### Development Error Testing Page

Visit `/dev/test-errors` in development to test various error scenarios:
- Client-side errors (Vue errors, async errors, type errors)
- API errors (401, 403, 404, 500, validation)
- Navigation errors
- Error recovery

### Test API Endpoint

The `/api/dev/error-test` endpoint (development only) can trigger various errors:

```bash
# Trigger different error types
GET /api/dev/error-test?code=401    # Unauthorized
GET /api/dev/error-test?code=403    # Forbidden
GET /api/dev/error-test?code=404    # Not found
GET /api/dev/error-test?code=500    # Server error
GET /api/dev/error-test?code=validation # Validation error
```

## Best Practices

1. **Always use typed errors**: Include proper status codes and messages
2. **Be specific**: Provide helpful error messages for users
3. **Log appropriately**: Log errors but don't expose sensitive data
4. **Handle gracefully**: Always provide a way for users to recover
5. **Test thoroughly**: Use the error testing tools to ensure proper handling

## Production Considerations

In production, you should:
1. Integrate with error tracking services (e.g., Sentry)
2. Set up error alerts for critical failures
3. Monitor error rates and patterns
4. Keep error messages user-friendly (no stack traces)