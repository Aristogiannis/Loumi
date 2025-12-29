import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres client
// Use a dummy URL during build if not provided (Next.js prerendering)
const connectionString = process.env['DATABASE_URL'] || 'postgres://localhost:5432/loumi';

// For connection pooling (recommended for serverless)
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };
