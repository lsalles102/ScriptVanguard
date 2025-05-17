import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.pgepubxloominybyvcuv:Capitulo4v3@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

if (!connectionString) {
  throw new Error("DATABASE_URL não está definido");
}

const sql = postgres(connectionString, { 
  max: 1,
  ssl: 'require'
});
export const db = drizzle(sql);