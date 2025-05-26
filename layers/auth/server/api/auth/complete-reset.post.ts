import { H3Event } from "h3";
import * as bcrypt from "bcrypt";
import { sendPasswordChangedEmail } from "~/utils/email";
import { getDb } from "../../../../../server/utils/db";
import { users, passwordResets } from "../../../../../server/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { token, password } = await readBody(event);
    const db = getDb(event);

    // Validate required fields
    if (!token || !password) {
      return {
        success: false,
        error: "Token and new password are required",
      };
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // Get current date for comparison
    const now = new Date();

    // Find a valid password reset token
    const passwordReset = await db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.token, token),
        gt(passwordResets.expiresAt, now),
        eq(passwordResets.used, false)
      ),
      with: {
        user: true,
      },
    });

    if (!passwordReset) {
      return {
        success: false,
        error: "Invalid or expired token. Please request a new password reset.",
      };
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update the user's password
    await db
      .update(users)
      .set({
        passwordHash,
      })
      .where(eq(users.id, passwordReset.userId));

    // Mark the token as used
    await db
      .update(passwordResets)
      .set({
        used: true,
      })
      .where(eq(passwordResets.id, passwordReset.id));

    // Send password changed notification
    try {
      const user = passwordReset.user as InferSelectModel<typeof users>;
      await sendPasswordChangedEmail(user.email);
    } catch (emailError) {
      console.error("Error sending password changed email:", emailError);
      // Continue with the process even if email fails
    }

    return {
      success: true,
      message:
        "Your password has been reset successfully. You can now log in with your new password.",
    };
  } catch (error: any) {
    console.error("Complete reset error:", error);
    return {
      success: false,
      error: "An error occurred while resetting your password",
    };
  }
});
