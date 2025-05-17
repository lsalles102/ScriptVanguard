import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não está definido");
}

const sql = postgres(connectionString, { 
  max: 1,
  ssl: 'require'
});
export const db = drizzle(sql);