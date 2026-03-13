// PostgreSQL connection pool singleton.
// Uses globalThis so Vercel warm invocations reuse the pool.
// PgBouncer on port 6432 (transaction mode) handles external pooling;
// keep pool max small so we don't exhaust PgBouncer connections.

import pg from 'pg';
const { Pool } = pg;

export function getPool() {
  if (!globalThis._mailtrixPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    globalThis._mailtrixPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
    globalThis._mailtrixPool.on('error', (err) => {
      console.error('Unexpected DB pool error:', err.message);
    });
  }
  return globalThis._mailtrixPool;
}
