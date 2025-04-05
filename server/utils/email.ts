/**
 * This file re-exports the main email utilities from ~/utils/email.ts
 *
 * This is used to maintain backward compatibility with existing imports
 * while using the centralized email implementation.
 */

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "~/utils/email";
