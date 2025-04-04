import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { token } = await readBody(event);

    // Validate required fields
    if (!token) {
      return {
        success: false,
        error: "Token is required",
      };
    }

    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
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
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    // Mark the token as used
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    });

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
