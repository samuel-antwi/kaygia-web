# Error Handling Test Plan

## Manual Testing Checklist

### 1. Authentication Errors
- [ ] **Test 401 Error**:
  1. Clear your browser cookies/session
  2. Try to access `/dashboard` or `/admin`
  3. Should redirect to `/auth/login` with toast message

- [ ] **Test Session Expiry**:
  1. Log in successfully
  2. Delete session cookie in browser DevTools
  3. Try to perform any authenticated action
  4. Should show "Session Expired" toast and redirect to login

### 2. Permission Errors
- [ ] **Test 403 Error**:
  1. Log in as a regular user (not admin)
  2. Try to access `/admin` pages
  3. Should show "Access Denied" toast

### 3. Not Found Errors
- [ ] **Test 404 Page**:
  1. Navigate to `/this-page-does-not-exist`
  2. Should show custom 404 page with navigation options
  3. Test "Go back" button functionality

### 4. Server Errors
- [ ] **Test Database Connection Error**:
  1. Stop your database server
  2. Try to load any page that queries the database
  3. Should show appropriate error message

- [ ] **Test API Endpoint Errors**:
  1. Create a project with invalid data
  2. Should show validation error toast
  3. Try to delete a non-existent resource
  4. Should show "Not Found" error

### 5. Form Validation Errors
- [ ] **Test Client-Side Validation**:
  1. Go to any form (e.g., create project)
  2. Submit with empty required fields
  3. Should show validation messages

- [ ] **Test Server-Side Validation**:
  1. Use browser DevTools to bypass client validation
  2. Send invalid data to API
  3. Should receive and display server validation errors

### 6. Network Errors
- [ ] **Test Offline Handling**:
  1. Open DevTools Network tab
  2. Set to "Offline"
  3. Try to perform any action
  4. Should show network error message

- [ ] **Test Timeout Errors**:
  1. Use DevTools to throttle network to "Slow 3G"
  2. Perform data-heavy operations
  3. Should handle timeouts gracefully

### 7. Concurrent Error Handling
- [ ] **Test Multiple Errors**:
  1. Trigger multiple API calls that will fail
  2. Should show appropriate toasts for each
  3. Should not crash the application

## Automated Testing

### Unit Tests for Error Handler

```typescript
// tests/composables/useErrorHandler.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useErrorHandler } from '~/composables/useErrorHandler'

describe('useErrorHandler', () => {
  it('should handle 401 errors by redirecting to login', async () => {
    const { handleError } = useErrorHandler()
    const mockRouter = { push: vi.fn() }
    
    const error = {
      statusCode: 401,
      data: { message: 'Unauthorized' }
    }
    
    handleError(error)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
  })
  
  it('should show toast for 500 errors', async () => {
    const { handleError } = useErrorHandler()
    const mockToast = vi.fn()
    
    const error = {
      statusCode: 500,
      data: { message: 'Server error' }
    }
    
    handleError(error)
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Server Error',
      description: 'Something went wrong on our end. Please try again later.',
      variant: 'destructive'
    })
  })
})
```

### Integration Tests

```typescript
// tests/api/error-handling.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

describe('API Error Handling', () => {
  it('should return 401 for unauthenticated requests', async () => {
    try {
      await $fetch('/api/admin/users')
    } catch (error) {
      expect(error.statusCode).toBe(401)
      expect(error.data.message).toBe('Please log in to continue')
    }
  })
  
  it('should handle validation errors', async () => {
    try {
      await $fetch('/api/projects', {
        method: 'POST',
        body: { name: '' } // Invalid - name required
      })
    } catch (error) {
      expect(error.statusCode).toBe(400)
      expect(error.data.errors).toBeDefined()
    }
  })
})
```

## Browser Testing

### Console Monitoring
1. Open browser DevTools Console
2. Look for error logs with proper formatting
3. Ensure no unhandled errors appear
4. Check that ignored errors (ResizeObserver) are filtered

### Network Tab Testing
1. Monitor failed requests in Network tab
2. Verify proper error status codes
3. Check error response payloads
4. Ensure no sensitive data in errors

## Production Testing

### Error Tracking Integration
1. If using Sentry or similar:
   - Trigger various errors
   - Verify they appear in error tracking dashboard
   - Check error grouping and metadata

### Load Testing
1. Use tools like k6 or Artillery
2. Simulate high error rates
3. Ensure system remains stable
4. Verify error messages under load

## Debugging Tools

### Vue DevTools
1. Install Vue DevTools extension
2. Check component error states
3. Verify error boundaries work
4. Monitor error propagation

### Custom Error Triggers
Add these temporary routes for testing:

```typescript
// server/api/test/trigger-error.post.ts
export default defineEventHandler(async (event) => {
  const { type } = await readBody(event)
  
  switch (type) {
    case 'database':
      throw new Error('ECONNREFUSED')
    case 'duplicate':
      const error = new Error()
      error.code = '23505'
      throw error
    case 'foreign-key':
      const fkError = new Error()
      fkError.code = '23503'
      throw fkError
    default:
      throw createError({
        statusCode: 500,
        statusMessage: 'Test error'
      })
  }
})
```

## Expected Behaviors

### Toast Notifications
- Minor errors: Blue/default toast
- Auth errors: Red/destructive toast  
- Success after error recovery: Green toast

### Page Redirects
- 401 → `/auth/login`
- 403 → Previous page or dashboard
- 404 → Custom 404 page
- 500 → Error boundary page

### Error Recovery
- All errors should be recoverable
- "Try Again" should work
- Navigation should remain functional
- No infinite error loops