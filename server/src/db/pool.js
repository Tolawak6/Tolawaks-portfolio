import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

/**
 * A single shared connection pool for the whole process.
 * Every query in the app goes through this pool, always via parameterised
 * statements (see services/project.service.js) so values are never
 * interpolated into SQL text.
 */
export const pool = new Pool({
  connectionString: config.db.connectionString,
  ssl: config.db.ssl,
  max: config.db.poolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  application_name: 'portfolio-api',
});

pool.on('error', (error) => {
  // An idle client died (network blip, database restart). Log it rather than
  // letting an unhandled 'error' event take down the process.
  console.error('[db] unexpected idle client error:', error.message);
});

/** Run a parameterised query. */
export function query(text, params) {
  return pool.query(text, params);
}

/** Run several statements inside a transaction, rolling back on failure. */
export async function withTransaction(handler) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Verifies the database is reachable. Used by /api/health and at boot. */
export async function checkConnection() {
  const { rows } = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}

export async function closePool() {
  await pool.end();
}
