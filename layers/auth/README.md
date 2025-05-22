# Auth Layer Documentation

> Layer: `/layers/auth/`  
> Purpose: Complete authentication system  
> Routes: `/auth/*`, `/verify-email/*`, `/resend-verification`  
> Module: `nuxt-auth-utils`

## Overview

The Auth Layer provides a comprehensive authentication system with email verification, password reset, role-based access control, and secure session management. Built on `nuxt-auth-utils` with bcrypt password hashing and Resend email integration.

## Features

### ✅ Implemented Features

#### User Registration & Verification
- **User Registration** (`/auth/register`) - Account creation with email verification
- **Email Verification** (`/verify-email/[token]`) - Token-based email confirmation
- **Resend Verification** (`/resend-verification`) - Resend verification emails
- **Account Activation** - Automatic activation after email verification

#### Authentication Flow
- **User Login** (`/auth/login`) - Secure authentication with session creation
- **User Logout** - Session termination with cookie cleanup
- **Session Management** - 7-day secure cookie sessions
- **Auto-redirect** - Redirect to intended page after login

#### Password Security
- **Password Reset Request** (`/auth/forgot-password`) - Email-based password reset
- **Password Reset Completion** (`/auth/reset-password/[token]`) - Token validation and reset
- **Password Hashing** - bcrypt with salt for secure storage
- **Password Validation** - Minimum length and complexity requirements

#### Role-Based Access
- **Role System** - CLIENT, ADMIN, SUPER_ADMIN roles
- **Route Protection** - Middleware-based access control
- **Session Context** - User role available throughout application

### 🚧 Planned Enhancements
- Two-factor authentication (2FA)
- Social login (Google, GitHub)
- Password complexity requirements
- Account lockout after failed attempts
- Session management dashboard

## Architecture

### Layer Structure
```
auth/
├── nuxt.config.ts              # Auth configuration with nuxt-auth-utils
├── middleware/auth.ts          # Route protection middleware
├── pages/auth/                 # Authentication pages
├── pages/verify-email/         # Email verification
├── pages/resend-verification.vue
├── composables/useAuth.ts      # Authentication composable
├── server/api/auth/            # Authentication API endpoints
├── server/api/user/            # User profile endpoints
└── types/                      # Auth-related types
```

### Authentication Flow
```
1. Registration → Email Verification → Account Activation
2. Login → Session Creation → Dashboard Access
3. Password Reset → Email Token → New Password → Login
```

### Security Model

#### Session Management
- **Technology**: `nuxt-auth-utils` with sealed cookies
- **Duration**: 7 days (configurable)
- **Storage**: HTTP-only secure cookies
- **Encryption**: AES encryption with `NUXT_SESSION_PASSWORD`

#### Password Security
- **Hashing**: bcrypt with automatic salt generation
- **Validation**: Minimum 8 characters (configurable)
- **Reset Tokens**: UUID v4 with expiration (1 hour)
- **Verification Tokens**: UUID v4 with expiration (24 hours)

## API Endpoints

### Base Path: `/api/auth/`

#### Registration & Verification
```typescript
POST /api/auth/register
// Create new user account
Body: {
  email: string,
  password: string,
  name?: string,
  company?: string
}
Response: {
  success: true,
  message: "Account created. Please check your email.",
  requiresVerification: true
}

POST /api/auth/verify-email
// Verify email with token
Body: { token: string }
Response: {
  success: true,
  message: "Email verified successfully"
}

POST /api/auth/resend-verification
// Resend verification email
Body: { email: string }
Response: {
  success: true,
  message: "Verification email sent"
}
```

#### Authentication
```typescript
POST /api/auth/login
// Authenticate user
Body: {
  email: string,
  password: string
}
Response: {
  success: true,
  user: {
    id: string,
    email: string,
    name: string,
    role: Role,
    emailVerified: boolean
  }
}

POST /api/auth/logout
// End user session
Response: {
  success: true
}
```

#### Password Reset
```typescript
POST /api/auth/reset-password
// Request password reset
Body: { email: string }
Response: {
  success: true,
  message: "Password reset email sent"
}

POST /api/auth/complete-reset
// Complete password reset
Body: {
  token: string,
  newPassword: string
}
Response: {
  success: true,
  message: "Password updated successfully"
}
```

#### User Profile
```typescript
GET /api/user/profile
// Get current user profile (protected)
Response: {
  id: string,
  email: string,
  name: string,
  company: string,
  role: Role,
  emailVerified: boolean,
  active: boolean,
  createdAt: string,
  lastLoggedIn: string
}
```

## Components & Pages

### Authentication Pages

#### Register Page (`/auth/register`)
```vue
<template>
  <AuthSidebar>
    <form @submit="handleRegister">
      <FormField name="email" label="Email">
        <Input type="email" required />
      </FormField>
      
      <FormField name="password" label="Password">
        <Input type="password" required />
      </FormField>
      
      <FormField name="name" label="Full Name">
        <Input type="text" />
      </FormField>
      
      <FormField name="company" label="Company">
        <Input type="text" />
      </FormField>
      
      <Button type="submit">Create Account</Button>
    </form>
  </AuthSidebar>
</template>
```

#### Login Page (`/auth/login`)
```vue
<template>
  <AuthSidebar>
    <form @submit="handleLogin">
      <FormField name="email" label="Email">
        <Input type="email" required />
      </FormField>
      
      <FormField name="password" label="Password">
        <Input type="password" required />
      </FormField>
      
      <Button type="submit">Sign In</Button>
      
      <NuxtLink to="/auth/forgot-password">
        Forgot your password?
      </NuxtLink>
    </form>
  </AuthSidebar>
</template>
```

#### Password Reset (`/auth/forgot-password`)
```vue
<template>
  <AuthSidebar>
    <form @submit="handlePasswordReset">
      <FormField name="email" label="Email Address">
        <Input type="email" required />
      </FormField>
      
      <Button type="submit">Send Reset Email</Button>
    </form>
  </AuthSidebar>
</template>
```

#### Reset Completion (`/auth/reset-password/[token].vue`)
```vue
<template>
  <AuthSidebar>
    <form @submit="handlePasswordUpdate">
      <FormField name="password" label="New Password">
        <Input type="password" required />
      </FormField>
      
      <FormField name="confirmPassword" label="Confirm Password">
        <Input type="password" required />
      </FormField>
      
      <Button type="submit">Update Password</Button>
    </form>
  </AuthSidebar>
</template>
```

### Shared Components

#### AuthSidebar.vue
Provides consistent layout for all authentication pages with branding and messaging.

```vue
<template>
  <div class="grid lg:grid-cols-2 min-h-screen">
    <!-- Branding Side -->
    <div class="bg-primary text-primary-foreground p-8">
      <div class="space-y-6">
        <h1 class="text-3xl font-bold">Kaygia Web</h1>
        <p class="text-lg">Professional web development services</p>
        <!-- Features list, testimonials, etc. -->
      </div>
    </div>
    
    <!-- Form Side -->
    <div class="p-8 flex items-center justify-center">
      <div class="max-w-md w-full">
        <slot />
      </div>
    </div>
  </div>
</template>
```

## Composables

### useAuth.ts
```typescript
export const useAuth = () => {
  const user = useUserState()

  const login = async (credentials: LoginCredentials) => {
    const { data } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    
    user.value = data.user
    await navigateTo('/dashboard')
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/')
  }

  const register = async (userData: RegisterData) => {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })
    
    await navigateTo('/auth/check-email')
  }

  const resetPassword = async (email: string) => {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email }
    })
  }

  const completePasswordReset = async (token: string, newPassword: string) => {
    await $fetch('/api/auth/complete-reset', {
      method: 'POST',
      body: { token, newPassword }
    })
  }

  return {
    user: readonly(user),
    login,
    logout,
    register,
    resetPassword,
    completePasswordReset
  }
}
```

## Middleware Protection

### auth.ts
```typescript
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserState()

  // Protect dashboard routes
  if (to.path.startsWith('/dashboard')) {
    if (!user.value) {
      return navigateTo('/auth/login')
    }
    
    if (!user.value.emailVerified) {
      return navigateTo('/resend-verification')
    }
    
    if (!user.value.active) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account is deactivated'
      })
    }
  }
})
```

## Email Integration

### Email Templates

#### Verification Email
```typescript
// server/utils/email-verification.ts
export const sendVerificationEmail = async (user: User, token: string) => {
  const verificationUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/verify-email/${token}`
  
  await sendEmail({
    to: user.email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to Kaygia Web!</h1>
      <p>Hi ${user.name || user.email},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email Address</a>
      <p>This link will expire in 24 hours.</p>
    `
  })
}
```

#### Password Reset Email
```typescript
// server/utils/password-reset.ts
export const sendPasswordResetEmail = async (user: User, token: string) => {
  const resetUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/auth/reset-password/${token}`
  
  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name || user.email},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
}
```

## Security Implementation

### Password Hashing
```typescript
import bcrypt from 'bcrypt'

// Hash password during registration
const saltRounds = 12
const hashedPassword = await bcrypt.hash(password, saltRounds)

// Verify password during login
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Token Generation
```typescript
import { v4 as uuidv4 } from 'uuid'

// Generate secure tokens
const token = uuidv4()
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

// Store in database with expiration
await db.insert(emailVerifications).values({
  id: uuidv4(),
  token,
  userId,
  expiresAt,
  used: false
})
```

### Session Management
```typescript
// Create session after successful login
await setUserSession(event, {
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified
  }
})

// Access session in any server route
const session = await getUserSession(event)
```

## Error Handling

### Common Authentication Errors
```typescript
// Invalid credentials
throw createError({
  statusCode: 401,
  statusMessage: 'Invalid email or password'
})

// Email not verified
throw createError({
  statusCode: 403,
  statusMessage: 'Please verify your email address'
})

// Account deactivated
throw createError({
  statusCode: 403,
  statusMessage: 'Account is deactivated'
})

// Expired token
throw createError({
  statusCode: 400,
  statusMessage: 'Token has expired'
})

// Invalid token
throw createError({
  statusCode: 400,
  statusMessage: 'Invalid or used token'
})
```

## Development Guidelines

### Adding Authentication to New Routes

1. **Protect Route with Middleware**:
   ```vue
   <script setup>
   definePageMeta({
     middleware: 'auth'
   })
   </script>
   ```

2. **Access User in Components**:
   ```vue
   <script setup>
   const { user } = useAuth()
   
   // User is reactive and automatically updated
   </script>
   ```

3. **Server-side Session Access**:
   ```typescript
   export default defineEventHandler(async (event) => {
     const session = await getUserSession(event)
     
     if (!session?.user) {
       throw createError({ statusCode: 401 })
     }
     
     // Use session.user
   })
   ```

### Testing Authentication

#### Manual Testing Checklist
- [ ] User registration with email verification
- [ ] Email verification link functionality
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Password reset request
- [ ] Password reset completion
- [ ] Session persistence across browser refresh
- [ ] Logout functionality
- [ ] Route protection for authenticated pages

#### Email Testing
```env
# Development: Use debug mode
EMAIL_DEBUG="true"

# Or use Resend test domain
FROM_EMAIL="onboarding@resend.dev"
```

## Performance Considerations

### Session Optimization
- Sessions are stored in encrypted cookies (no database queries)
- User state is cached in memory during SSR
- Automatic session renewal on activity

### Database Optimization
- Add indexes on email fields for faster lookups
- Clean up expired tokens periodically
- Use connection pooling for authentication queries

### Email Performance
- Queue email sending for better user experience
- Implement retry logic for failed email deliveries
- Use email templates for consistent formatting

## Future Enhancements

### Advanced Security
- **Two-Factor Authentication (2FA)** with TOTP
- **Account Lockout** after failed login attempts
- **Device Management** with trusted devices
- **Login History** and security logs

### Social Authentication
- **OAuth Integration** (Google, GitHub, Microsoft)
- **Account Linking** for multiple auth methods
- **Social Profile Import** for user information

### Enhanced User Experience
- **Magic Link Login** (passwordless)
- **Remember Me** functionality
- **Multi-Device Sessions** management
- **Progressive Profiling** for user onboarding

This authentication layer provides a secure, user-friendly foundation for the Kaygia Web platform with extensive room for future enhancements.