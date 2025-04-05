import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { passwordResets, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "~/utils/email";
import type { DbClient } from "~/server/db";

interface CreatePasswordResetOptions {
  /**
   * The email address of the user to create a password reset for
   */
  email?: string;

  /**
   * The user ID to create a password reset for (alternative to email)
   */
  userId?: string;

  /**
   * The database instance to use
   */
  db: DbClient;

  /**
   * The base URL to use for the reset link
   * Defaults to NUXT_PUBLIC_SITE_URL or http://localhost:3000
   */
  baseUrl?: string;
}

/**
 * Creates a password reset token for a user and sends a reset email
 * Can be used with either email or userId
 *
 * @returns Object with success flag, message, and optional user details
 */
export async function createPasswordReset(options: CreatePasswordResetOptions) {
  const { email, userId, db } = options;
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
      // For public-facing endpoints (using email), don't reveal user existence
      return {
        success: true,
        message:
          "If your email is registered, you will receive password reset instructions",
      };
    } else {
      // For admin endpoints (using userId), we can be more specific
      throw new Error("User not found");
    }
  }

  // Generate a random token
  const token = randomBytes(32).toString("hex");

  // Set expiration to 1 hour from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Create a new password reset record
  await db.insert(passwordResets).values({
    id: uuidv4(),
    token,
    expiresAt,
    userId: user.id,
  });

  // Generate reset URL
  const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

  // Send reset email
  await sendPasswordResetEmail(user.email, resetUrl);

  // Return appropriate response
  if (email) {
    // For public-facing endpoints, generic success message
    return {
      success: true,
      message:
        "If your email is registered, you will receive password reset instructions",
    };
  } else {
    // For admin endpoints, more specific success message with user details
    return {
      success: true,
      message: `Password reset email sent to ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
