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
      return {
        success: false,
        error: "Invalid verification token",
      };
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      return {
        success: false,
        error: "Verification token has expired",
      };
    }

    // Check if token is already used
    if (verification.used) {
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
