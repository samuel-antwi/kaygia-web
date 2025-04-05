import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "~/utils/email";
import { manageEmailVerification } from "~/server/utils/email-verification";

// Define validation schema for user creation
const userCreationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["CLIENT", "ADMIN"]),
  company: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  sendVerificationEmail: z.boolean().default(true),
  active: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  // Check for admin user session
  const session = await getUserSession(event);
  const adminUser = session?.user;

  if (!adminUser || adminUser.role !== "ADMIN") {
    console.warn(
      `[API][Admin][Users/Create] Unauthorized attempt. User: ${adminUser?.id}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    // Parse and validate request body
    const body = await readBody(event);
    const validatedData = userCreationSchema.parse(body);

    // Generate a random password if none is provided
    let password = validatedData.password;
    let generatedPassword = false;

    if (!password) {
      // Generate a secure random password
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      password = Array.from({ length: 12 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("");
      generatedPassword = true;
    }

    // Hash the password
    const passwordHash = await hash(password, 10);

    const db = getDb(event);

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, validatedData.email),
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: "A user with this email already exists.",
      });
    }

    // Create the new user
    const userId = uuidv4();
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        role: validatedData.role,
        company: validatedData.company || null,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        active: validatedData.active,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        company: users.company,
        createdAt: users.createdAt,
        active: users.active,
      });

    // Send verification email if requested
    let verificationSent = false;
    if (validatedData.sendVerificationEmail) {
      try {
        // Generate verification token and URL
        const baseUrl =
          process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";

        // Use the email verification utility
        await manageEmailVerification({
          userId,
          db,
          verifyImmediately: false,
        });

        verificationSent = true;
      } catch (emailError) {
        console.error(
          `[API][Admin][Users/Create] Error sending verification email:`,
          emailError
        );
        // We don't throw here because the user was created successfully
        // Just report the email sending error in the response
      }
    }

    return {
      success: true,
      user: newUser,
      message: `User ${newUser.name} (${newUser.email}) created successfully.`,
      passwordGenerated: generatedPassword,
      generatedPassword: generatedPassword ? password : undefined,
      verificationEmailSent: verificationSent,
    };
  } catch (error: any) {
    console.error(`[API][Admin][Users/Create] Error creating user:`, error);

    // Handle validation errors
    if (error.errors) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation Error",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not create user.",
      data: error.message,
    });
  }
});
