import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

// For migrations, we should use a separate connection
const migrationClient = postgres(process.env.DIRECT_URL!, { max: 1 });

async function main() {
  try {
    const db = drizzle(migrationClient);

    // This will run all migrations in the "migrations" folder
    console.log("Starting migration...");
    await migrate(db, { migrationsFolder: "./server/db/migrations" });
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await migrationClient.end();
  }
}

main();
