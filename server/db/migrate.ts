import { migrate } from "drizzle-orm/postgres-js/migrator";
import { migrationClient, db } from "./index";

// This script will be run with "node -r esbuild-register server/db/migrate.ts"
async function main() {
  console.log("Running migrations...");

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
