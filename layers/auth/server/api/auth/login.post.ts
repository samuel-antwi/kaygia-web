import * as bcrypt from "bcrypt";
import { H3Event } from "h3";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email, password } = await readBody(event);
    const db = getDb(event);

    // Validate required fields
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Check if the user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        active: true,
        company: true,
        lastLoggedIn: true,
        emailVerified: true,
      },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if account is active
    if (!user.active) {
      return {
        success: false,
        error:
          "Your account has been deactivated. Please contact support for assistance.",
      };
    }

    // Compare password with hash
    const passMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passMatch) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        success: false,
        error:
          "Email not verified. Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      };
    }

    // Get user data for session
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      lastLoggedIn: user.lastLoggedIn,
    };

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLoggedIn: new Date() })
      .where(eq(users.id, user.id));

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
