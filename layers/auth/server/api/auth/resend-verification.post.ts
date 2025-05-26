import { H3Event } from "h3";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "~/utils/email";
import { getDb } from "../../../../../server/utils/db";
import { users, emailVerifications } from "../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email } = await readBody(event);
    const db = getDb(event);

    // Validate required fields
    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return {
        success: true,
        message:
          "If your email is registered, you will receive verification instructions",
      };
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return {
        success: false,
        error: "Email is already verified",
      };
    }

    // Generate a new verification token
    const token = randomBytes(32).toString("hex");

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create a new verification record
    await db.insert(emailVerifications).values({
      id: uuidv4(),
      token,
      expiresAt,
      userId: user.id,
    });

    // Generate verification URL
    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email/${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    return {
      success: true,
      message:
        "If your email is registered, you will receive verification instructions",
    };
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
});
