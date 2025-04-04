import { H3Event } from "h3";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "~/utils/email";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email } = await readBody(event);

    // Validate required fields
    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Just return success to prevent email enumeration attacks
      return {
        success: true,
        message:
          "If your email is registered, you will receive password reset instructions",
      };
    }

    // Generate a random token
    const token = randomBytes(32).toString("hex");

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Create a new password reset record
    await prisma.passwordReset.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Generate reset URL
    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

    // Send reset email
    await sendPasswordResetEmail(email, resetUrl);

    return {
      success: true,
      message:
        "If your email is registered, you will receive password reset instructions",
    };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
});
