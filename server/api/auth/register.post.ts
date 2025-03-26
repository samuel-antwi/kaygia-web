import { PrismaClient } from "@prisma/client";
import { H3Event } from "h3";
import * as bcrypt from "bcryptjs";

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email, password, name, company } = await readBody(event);

    // Validate required fields
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
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
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        company,
        passwordHash,
        role: "CLIENT", // Default role for new users
      },
    });

    // TODO: In a real implementation, store hashed password in a UserAuth table

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        company: newUser.company,
      },
    };
  } catch (error: any) {
    console.error("Registration error:", error);

    return {
      success: false,
      error: "An error occurred during registration. Please try again later.",
    };
  }
});
