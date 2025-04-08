import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import ws from 'ws';

// Enable WebSocket connections for Neon
neonConfig.webSocketConstructor = ws;

// Connect to database using the DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export for use in potential migrations
export { sql };