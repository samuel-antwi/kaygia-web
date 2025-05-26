import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  // Initialize the database connection
  const connectionString = process.env.DIRECT_URL!;

  if (!connectionString) {
    console.error("DIRECT_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  // Find any user in the database
  const user = await db.query.users.findFirst();

  if (!user) {
    console.error(
      "No users found in the database. Cannot create sample ticket."
    );
    return;
  }

  console.log(`Found user with ID: ${user.id}`);

  // Create a sample support ticket and initial admin comment in a transaction
  try {
    await db.transaction(async (tx) => {
      // Create the ticket
      const [ticket] = await tx
        .insert(schema.supportTickets)
        .values({
          id: uuidv4(),
          ticketNumber: Math.floor(10000 + Math.random() * 90000).toString(), // Generate a 5-digit ticket number
          subject: "Welcome to Kaygia Support!",
          description: "", // Required field
          clientId: user.id,
          status: "OPEN",
          lastRepliedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create the initial admin comment
      await tx.insert(schema.ticketComments).values({
        id: uuidv4(),
        content:
          "Welcome! Feel free to reply here with any questions you have about your project.",
        ticketId: ticket!.id,
        userId: user.id, // Track who the comment is FOR (client), even if ADMIN sent it
        sender: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("Successfully created sample ticket:", ticket!.id);
    });
  } catch (error) {
    console.error("\nError creating sample ticket:", error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

main().catch(async (e) => {
  console.error("\nScript failed:", e);
  process.exit(1);
});
