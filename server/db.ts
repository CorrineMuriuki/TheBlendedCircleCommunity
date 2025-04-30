import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Connect to database using the DATABASE_URL environment variable
const sql = postgres(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export for use in potential migrations
export { sql };