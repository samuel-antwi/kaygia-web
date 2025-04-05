import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { emailVerifications, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { DbClient } from "~/server/db";
import { sendVerificationEmail as sendEmail } from "~/utils/email";

interface EmailVerificationOptions {
  /**
   * The email address of the user to verify
   */
  email?: string;

  /**
   * The user ID to verify (alternative to email)
   */
  userId?: string;

  /**
   * The database instance to use
   */
  db: DbClient;

  /**
   * Whether to mark the email as verified immediately (admin verification)
   * If true, no verification email will be sent
   */
  verifyImmediately?: boolean;

  /**
   * Function to send verification email
   * Required if verifyImmediately is false
   * If not provided, the default sendVerificationEmail from utils/email will be used
   */
  sendVerificationEmail?: (
    email: string,
    verificationUrl: string
  ) => Promise<any>;

  /**
   * The base URL to use for the verification link
   * Defaults to NUXT_PUBLIC_SITE_URL or http://localhost:3000
   */
  baseUrl?: string;
}

/**
 * Creates or manages email verification for a user
 * Can be used with either email or userId
 *
 * @returns Object with success flag, message, and optional user details
 */
export async function manageEmailVerification(
  options: EmailVerificationOptions
) {
  const { email, userId, db, verifyImmediately = false } = options;
  const baseUrl =
    options.baseUrl ||
    process.env.NUXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  if (!email && !userId) {
    throw new Error("Either email or userId must be provided");
  }

  // Find the user either by email or ID
  let user;
  if (email) {
    user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  } else if (userId) {
    user = await db.query.users.findFirst({
      where: eq(users.id, userId as string),
    });
  }

  // If user not found, return different responses based on context
  if (!user) {
    if (email) {
      // For public-facing endpoints, don't reveal user existence
      return {
        success: true,
        message:
          "If your email is registered, you will receive verification instructions",
      };
    } else {
      // For admin endpoints, we can be more specific
      throw new Error("User not found");
    }
  }

  // If user's email is already verified
  if (user.emailVerified) {
    return {
      success: true,
      message: "Email is already verified",
      emailVerified: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // If verifying immediately (admin action)
  if (verifyImmediately) {
    // Update user's emailVerified status
    const [updatedUser] = await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
      });

    return {
      success: true,
      message: "Email has been manually verified",
      emailVerified: true,
      user: updatedUser,
    };
  }

  // If sending verification email
  if (!options.sendVerificationEmail) {
    // Use the default email sender instead of throwing an error
    options.sendVerificationEmail = sendEmail;
  }

  // Generate a random token
  const token = randomBytes(32).toString("hex");

  // Set expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Create a new email verification record
  await db.insert(emailVerifications).values({
    id: uuidv4(),
    token,
    expiresAt,
    userId: user.id,
  });

  // Generate verification URL
  const verificationUrl = `${baseUrl}/verify-email/${token}`;

  // Send verification email
  await options.sendVerificationEmail(user.email, verificationUrl);

  // Return appropriate response
  if (email) {
    // For public-facing endpoints, generic success message
    return {
      success: true,
      message:
        "If your email is registered, you will receive verification instructions",
    };
  } else {
    // For admin endpoints, more specific success message with user details
    return {
      success: true,
      message: `Verification email sent to ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
