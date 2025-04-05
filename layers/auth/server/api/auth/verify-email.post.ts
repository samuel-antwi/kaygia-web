import { H3Event } from "h3";
import { getDb } from "~/server/utils/db";
import { users, emailVerifications } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { token } = await readBody(event);
    const db = getDb(event);

    // Validate required fields
    if (!token) {
      console.warn(
        "Email verification failed: Token is missing from request body."
      );
      return {
        success: false,
        error: "Token is required",
      };
    }

    // Find the verification record
    const verification = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.token, token),
      with: {
        user: true,
      },
    });

    if (!verification) {
      console.warn(
        `Email verification failed: Invalid token provided: ${token}`
      );
      return {
        success: false,
        error: "Invalid verification token",
      };
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      console.warn(
        `Email verification failed: Token expired: ${token}, ExpiresAt: ${verification.expiresAt}`
      );
      return {
        success: false,
        error: "Verification token has expired",
      };
    }

    // Check if token is already used
    if (verification.used) {
      console.warn(`Email verification failed: Token already used: ${token}`);
      return {
        success: false,
        error: "Verification token has already been used",
      };
    }

    // Mark the user as verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, verification.userId));

    // Mark the token as used
    await db
      .update(emailVerifications)
      .set({ used: true })
      .where(eq(emailVerifications.id, verification.id));

    return {
      success: true,
      message:
        "Email successfully verified. You can now log in to your account.",
    };
  } catch (error: any) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: "An error occurred while verifying your email",
    };
  }
});
