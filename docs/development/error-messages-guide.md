# Error Messages Guide

## User-Facing Error Messages

This guide shows what users see vs what developers see for different error scenarios.

## Development vs Production

### In Development Mode
- **Shows**: Actual error messages for debugging
- **Purpose**: Help developers identify and fix issues quickly
- **Example**: "Cannot read properties of null (reading 'nonExistentMethod')"

### In Production Mode
- **Shows**: User-friendly, generic messages
- **Purpose**: Avoid confusing users with technical details
- **Example**: "Something went wrong. Please refresh the page and try again."

## Error Message Mapping

| Error Type | Technical Message | User Sees (Production) |
|------------|-------------------|------------------------|
| Null Reference | "Cannot read properties of null" | "Something went wrong. Please refresh the page and try again." |
| Undefined Property | "Cannot access before initialization" | "Something went wrong. Please refresh the page and try again." |
| Missing Function | "X is not a function" | "A feature is temporarily unavailable. Please try again later." |
| Network Error | "Failed to fetch" | "Connection error. Please check your internet and try again." |
| API 401 | "Unauthorized" | "Please log in again to continue." |
| API 403 | "Forbidden" | "You don't have permission to perform this action." |
| API 404 | "Not Found" | "The requested item was not found." |
| API 500 | "Internal Server Error" | "Something went wrong on our end. Please try again later." |
| Validation Error | "name is required" | Shows actual validation message (these are user-friendly) |

## Customizing Error Messages

### For API Endpoints

Always provide user-friendly messages in your API responses:

```typescript
// ❌ Bad - Technical message
throw createError({
  statusCode: 400,
  statusMessage: 'Database constraint violation on users.email'
})

// ✅ Good - User-friendly message
throw createError({
  statusCode: 400,
  statusMessage: 'Bad Request',
  data: {
    message: 'This email address is already registered.'
  }
})
```

### For Client-Side Errors

Use the error handler with custom messages:

```typescript
const { handleError } = useErrorHandler()

try {
  await riskyOperation()
} catch (error) {
  handleError(error, {
    fallbackMessage: 'Unable to complete this action. Please try again.'
  })
}
```

### For Form Validation

Validation messages should always be user-friendly:

```typescript
const schema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),  // User-friendly
  password: z.string()
    .min(8, 'Password must be at least 8 characters long'),  // User-friendly
  age: z.number()
    .min(18, 'You must be 18 or older to register')  // User-friendly
})
```

## Best Practices

### 1. Be Helpful, Not Technical
- ❌ "ECONNREFUSED 127.0.0.1:5432"
- ✅ "Unable to connect to the server. Please try again."

### 2. Suggest Actions
- ❌ "Error occurred"
- ✅ "Something went wrong. Please refresh the page and try again."

### 3. Be Specific When Appropriate
- ❌ "Invalid input"
- ✅ "Please enter a valid email address"

### 4. Maintain Consistency
Use the same message for similar errors across the application.

### 5. Log Technical Details
Always log the actual error for debugging:

```typescript
console.error('Technical error details:', error)
// Show user-friendly message to user
```

## Testing Error Messages

1. **Test in Production Mode**: 
   ```bash
   NODE_ENV=production npm run dev
   ```

2. **Verify User Messages**: 
   - Click error test buttons
   - Confirm users see friendly messages
   - Check console for technical details

3. **Error Tracking**: 
   In production, integrate with services like Sentry to capture technical details while showing friendly messages to users.