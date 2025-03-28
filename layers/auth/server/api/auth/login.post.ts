import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { H3Event } from "h3";

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email, password } = await readBody(event);

    // Validate required fields
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Find user by email with passwordHash
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if password hash exists
    if (!existingUser.passwordHash) {
      return {
        success: false,
        error: "Account requires password reset",
      };
    }

    // Compare password with hash
    const passMatch = await bcrypt.compare(password, existingUser.passwordHash);

    if (!passMatch) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if email is verified
    if (!existingUser.emailVerified) {
      return {
        success: false,
        error:
          "Email not verified. Please verify your email before logging in.",
        needsVerification: true,
        email: existingUser.email,
      };
    }

    // Get user data for session
    const userData = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      company: existingUser.company,
      role: existingUser.role,
      lastLoggedIn: existingUser.lastLoggedIn,
    };

    // Update last login timestamp
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { lastLoggedIn: new Date() },
    });

    // Set the auth session using nuxt-auth-utils
    await setUserSession(event, {
      user: userData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);

    return {
      success: false,
      error: "An error occurred while logging in. Please try again later.",
    };
  }
});
