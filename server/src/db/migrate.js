#!/usr/bin/env node
/**
 * Applies src/db/schema.sql to the database in DATABASE_URL.
 *
 *   npm run db:migrate           create/update tables
 *   npm run db:migrate:reset     DROP everything first (destructive)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closePool } from './pool.js';
import { config } from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function main() {
  const shouldReset = process.argv.includes('--reset');
  const schema = await fs.readFile(SCHEMA_PATH, 'utf8');

  console.log(`[migrate] target: ${redact(config.db.connectionString)}`);

  if (shouldReset) {
    console.log('[migrate] --reset supplied: dropping existing tables');
    await pool.query(`
      DROP TABLE IF EXISTS contact_messages CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
    `);
  }

  await pool.query(schema);
  console.log('[migrate] schema applied successfully');

  const { rows } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log(`[migrate] tables: ${rows.map((r) => r.table_name).join(', ') || '(none)'}`);
}

/** Never print a password into logs. */
function redact(connectionString) {
  try {
    const url = new URL(connectionString);
    if (url.password) url.password = '****';
    return url.toString();
  } catch {
    return '(unparseable connection string)';
  }
}

main()
  .then(() => closePool())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('[migrate] failed:', error.message);
    await closePool().catch(() => {});
    process.exit(1);
  });
