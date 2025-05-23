import { migrate } from "drizzle-orm/postgres-js/migrator";
import { migrationClient, db } from "./index";
import * as dotenv from "dotenv";

dotenv.config();

// This script will be run with "node -r esbuild-register server/db/migrate.ts"
async function main() {
  console.log("Running migrations...");
  console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

  await migrate(db, {
    migrationsFolder: "./server/db/migrations",
  });

  console.log("Migrations complete!");

  // Close the connection
  await migrationClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});
