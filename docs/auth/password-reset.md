# Password Reset Implementation

## Overview

The password reset system provides users with a secure way to regain access to their accounts when they forget their passwords. The implementation follows security best practices, including:

- Time-limited reset tokens (1-hour expiration)
- One-time use tokens
- Secure database storage
- Email notifications for reset requests and confirmations
- Prevention of email enumeration attacks
- Password strength validation

## Architecture

### Database Structure

We use a separate `PasswordReset` table in the database to track password reset requests:

```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  used      Boolean  @default(false)
}
```

This approach provides:

- One-to-many relationship between users and reset tokens
- Ability to track and validate token expiration
- Prevention of token reuse with the "used" flag
- Automatic cleanup when users are deleted (cascade)

### API Endpoints

1. **Request Password Reset**

   - Endpoint: `/api/auth/reset-password`
   - Method: POST
   - Payload: `{ email: string }`
   - Function: Generates a token, stores it with expiration, sends an email

2. **Complete Password Reset**
   - Endpoint: `/api/auth/complete-reset`
   - Method: POST
   - Payload: `{ token: string, password: string }`
   - Function: Validates token, updates password, marks token as used

### Email Integration

Email services are handled through Resend, with two email templates:

1. **Password Reset Request Email**

   - Includes a time-limited link to reset password
   - Contains security information about the request
   - Uses consistent branding from site configuration

2. **Password Changed Confirmation Email**
   - Confirms successful password change
   - Includes security notice and support contact
   - Links back to login page

## User Flow

1. User submits their email on the forgot-password page
2. If the email exists, a reset token is generated and stored
3. An email with a reset link is sent to the user
4. User clicks the link and is taken to the reset-password page
5. User enters and confirms a new password that meets strength requirements
6. On submission, the token is validated and the password is updated
7. User receives a confirmation email and is redirected to login

## Frontend Components

1. **Forgot Password Page** (`/auth/forgot-password.vue`)

   - Email input form
   - Success and error states
   - Security-focused messaging

2. **Reset Password Page** (`/auth/reset-password/[token].vue`)
   - Password strength validation
   - Password confirmation matching
   - Visual strength indicators
   - Success and error states

## Security Considerations

1. **Prevention of User Enumeration**

   - Same response whether email exists or not
   - Same time response to prevent timing attacks

2. **Token Security**

   - 32-byte random tokens with high entropy
   - Limited validity (1 hour)
   - One-time use design
   - Stored securely in the database

3. **Password Strength Requirements**

   - Minimum 8 characters
   - Requires uppercase letters
   - Requires lowercase letters
   - Requires numbers

4. **Rate Limiting**
   - Future enhancement: Implement rate limiting on password reset attempts

## Testing the Password Reset Flow

1. Visit `/auth/forgot-password`
2. Enter your email address and submit
3. Check your email for the reset link
4. Click the link to access the reset page
5. Enter and confirm a new strong password
6. Submit the form to complete the reset
7. Verify you receive a confirmation email
8. Log in with your new password

## Configuration

The password reset system uses the following environment variables:

- `RESEND_API_KEY`: API key for the Resend email service
- `FROM_EMAIL`: Optional custom from email (defaults to site.company.supportEmail)
- `NUXT_PUBLIC_SITE_URL`: Public URL of the site (for email links)

Email templates automatically use company information from `utils/config/site.ts`.
