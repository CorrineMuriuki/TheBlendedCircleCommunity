
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Configure WebSocket fallback
neonConfig.webSocketConstructor = WebSocket;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = true;

// Create a connection pool with keep-alive settings
const sql = neon(process.env.DATABASE_URL!, {
  connectionSettings: {
    keepAlive: true,
    keepAliveInitialDelay: 10000, // 10 seconds
  },
});

export const db = drizzle(sql, { schema });

// Export for use in potential migrations
export { sql };
