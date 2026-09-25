#!/usr/bin/env node
/**
 * Development seed script.
 *
 *   npm run db:seed          insert sample rows only when the table is empty
 *   npm run db:seed:force    wipe the table first, then insert sample rows
 *
 * The sample projects below are deliberately obvious placeholders. Delete them
 * from the admin dashboard (/admin) as soon as you add your own.
 */
import { pool, closePool } from './pool.js';
import { config } from '../config/index.js';
import { count, create } from '../services/project.service.js';

const SAMPLE_PROJECTS = [
  {
    name: 'Sample Project - Task Tracker',
    image: '/images/projects/placeholder-taskboard.svg',
    link: 'https://github.com/your-username/task-tracker',
    description:
      'Placeholder entry. A small task board built with React and an Express REST API. Replace or delete this row from the admin dashboard.',
  },
  {
    name: 'Sample Project - Store API',
    image: '/images/projects/placeholder-api.svg',
    link: 'https://github.com/your-username/store-api',
    description:
      'Placeholder entry. A REST API with authentication and PostgreSQL persistence. Replace or delete this row from the admin dashboard.',
  },
  {
    name: 'Sample Project - Data Dashboard',
    image: '/images/projects/placeholder-dashboard.svg',
    link: '',
    description:
      'Placeholder entry that has no live link, so you can see how a card renders with a missing URL. Replace or delete this row.',
  },
];

async function main() {
  const force = process.argv.includes('--force');

  if (force) {
    console.log('[seed] --force supplied: removing existing projects');
    await pool.query('TRUNCATE TABLE projects RESTART IDENTITY CASCADE');
  } else {
    const existing = await count();
    if (existing > 0) {
      console.log(`[seed] projects table already has ${existing} row(s).`);
      console.log('[seed] nothing to do. Use "npm run db:seed:force" to replace them.');
      return;
    }
  }

  for (const project of SAMPLE_PROJECTS) {
    const created = await create(project);
    console.log(`[seed] inserted #${created.id} ${created.name}`);
  }

  console.log(`[seed] done - ${SAMPLE_PROJECTS.length} sample project(s) inserted.`);
  console.log(`[seed] target database: ${redact(config.db.connectionString)}`);
}

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
    console.error('[seed] failed:', error.message);
    await closePool().catch(() => {});
    process.exit(1);
  });
