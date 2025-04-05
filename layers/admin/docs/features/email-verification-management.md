# Email Verification Management

This document outlines the Email Verification Management feature which allows administrators to manually verify user email addresses or resend verification emails.

## Overview

Email verification is an important security feature that confirms users have access to the email address they provided during registration. The Email Verification Management feature gives administrators the ability to:

1. View a user's email verification status
2. Manually verify a user's email (bypassing the verification process)
3. Resend verification emails to users

## Implementation Details

### Database Schema

The feature leverages the existing `emailVerified` boolean field in the users table and the `emailVerifications` table for tracking verification tokens:

```typescript
// User schema (relevant part)
export const users = pgTable("users", {
  // ...other fields
  emailVerified: boolean("email_verified").default(false).notNull(),
  // ...other fields
});

// Email verifications table
export const emailVerifications = pgTable("email_verifications", {
  id: text("id").primaryKey().notNull(),
  token: text("token").notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### API Endpoints

Two new API endpoints were created for admin email verification management:

1. **Manually verify a user's email**

   - Endpoint: `PUT /api/admin/users/[userId]/verify-email`
   - Description: Marks a user's email as verified without requiring them to complete the verification process
   - Authentication: Admin-only
   - Response: Returns success message and updated user information

2. **Resend verification email**
   - Endpoint: `POST /api/admin/users/[userId]/resend-verification`
   - Description: Generates a new verification token and sends a verification email to the user
   - Authentication: Admin-only
   - Response: Returns success message indicating the email was sent

### Shared Utility Function

To promote code reuse and maintainability, a shared utility function was created for email verification management:

- Location: `server/utils/email-verification.ts`
- Function: `manageEmailVerification`
- Features:
  - Supports finding users by either email or ID
  - Can either verify immediately (admin action) or send verification email
  - Handles validation, token generation, and error handling
  - Used by both admin and public email verification endpoints

### UI Component

A dedicated UI component was created for email verification management:

- Location: `layers/admin/components/users/EmailVerificationManagement.vue`
- Features:
  - Displays the current verification status of the user's email
  - Provides a button to manually verify the email (with confirmation dialog)
  - Provides a button to resend the verification email
  - Shows appropriate success/error notifications
  - Updates the UI automatically when verification status changes

## Security Considerations

The feature includes several security measures:

1. **Admin-only authentication check** - All verification management endpoints require admin authentication
2. **Confirmation dialog** - Manual verification requires confirmation to prevent accidental use
3. **Warning message** - Administrators are warned about the security implications of manual verification
4. **Proper error handling** - All API errors are properly caught and displayed to the administrator
5. **Limited information disclosure** - Error messages don't reveal sensitive information
6. **Secure email handling** - Verification emails use unique tokens with 24-hour expiration

## User Experience

For administrators:

- Clear visual indicators of verification status in the user interface
- Simple, one-click actions for verification management
- Immediate feedback through toast notifications
- Confirmation dialogs for important actions

For users:

- Receive verification emails when administrators initiate them
- Can use verification links sent by administrators to verify their email
- No disruption to their normal workflow

## Future Enhancements

Potential enhancements to the feature could include:

1. Tracking verification history (who verified, when, how)
2. Bulk verification capabilities for multiple users
3. Customizable verification email templates
4. Support for different verification channels (SMS, etc.)
5. Adding expiration for manual verifications
