import { H3Event } from "h3";
import * as bcrypt from "bcrypt";
import { sendPasswordChangedEmail } from "~/utils/email";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { token, password } = await readBody(event);

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
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: { gt: now },
        used: false,
      },
      include: {
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
    await prisma.user.update({
      where: {
        id: passwordReset.userId,
      },
      data: {
        passwordHash,
      },
    });

    // Mark the token as used
    await prisma.passwordReset.update({
      where: {
        id: passwordReset.id,
      },
      data: {
        used: true,
      },
    });

    // Send password changed notification
    try {
      await sendPasswordChangedEmail(passwordReset.user.email);
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
