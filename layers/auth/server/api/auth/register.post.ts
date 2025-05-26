import { H3Event } from "h3";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "~/utils/email";
import { getDb } from "../../../../../server/utils/db";
import { users, emailVerifications } from "../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email, password, name, company } = await readBody(event);
    const db = getDb(event);

    // Validate required fields
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already in use",
      };
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const userId = uuidv4();
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        company,
        passwordHash,
        role: "CLIENT", // Default role for new users
        emailVerified: false, // Email not verified by default
      })
      .returning();

    // Generate a verification token
    const token = randomBytes(32).toString("hex");

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create a verification record
    await db.insert(emailVerifications).values({
      id: uuidv4(),
      token,
      expiresAt,
      userId: newUser!.id,
    });

    // Generate verification URL
    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email/${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    return {
      success: true,
      user: newUser ? {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        company: newUser.company,
      } : null,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);

    return {
      success: false,
      error: "An error occurred during registration. Please try again later.",
    };
  }
});
