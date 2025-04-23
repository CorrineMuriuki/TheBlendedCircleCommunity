import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import WebSocket from 'ws';

// Enable WebSocket connections for Neon
neonConfig.webSocketConstructor = WebSocket;

// Connect to database using the DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql as any, { schema });

// Export for use in potential migrations
export { sql };