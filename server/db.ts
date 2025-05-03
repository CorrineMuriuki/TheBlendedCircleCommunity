import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a connection pool with standard PostgreSQL
const client = postgres(process.env.DATABASE_URL!, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Max seconds a connection can be idle
  connect_timeout: 10, // Max seconds to connect
});

export const db = drizzle(client, { schema });

// Export for use in potential migrations
export { client as sql };
