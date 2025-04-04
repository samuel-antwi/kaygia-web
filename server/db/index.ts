import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection for migrations
export const migrationClient = postgres(process.env.DIRECT_URL!, { max: 1 });

// Connection for queries (with connection pooling)
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });

// Types
export type DbClient = typeof db;
export type Schema = typeof schema;
