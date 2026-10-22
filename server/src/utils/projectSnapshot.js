/**
 * Best-effort local project snapshot (`server/data/projects-snapshot.json`).
 *
 * Why this exists:
 *  - In production (Neon / managed PostgreSQL), the database itself is permanent
 *    and serverless filesystems are read-only, so this helper is a no-op.
 *  - In ephemeral cloud dev containers (where `/var/lib/postgresql` resets on
 *    container hibernation while workspace files persist), writing a lightweight
 *    JSON mirror on `/admin` changes lets `npm run db:seed` restore your real
 *    projects automatically instead of falling back to sample placeholders.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config/index.js';

const SNAPSHOT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../data/projects-snapshot.json',
);

export async function writeProjectsSnapshot(projects) {
  if (config.serverless || process.env.SKIP_PROJECT_SNAPSHOT === '1') return;

  try {
    await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
    // Store in oldest-first insertion order so restoring preserves newest-first display.
    const ordered = [...projects].reverse().map((p) => ({
      name: p.name,
      image: p.image ?? '',
      imagePublicId: p.imagePublicId ?? '',
      link: p.link ?? '',
      codeLink: p.codeLink ?? '',
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      description: p.description,
    }));
    await fs.writeFile(
      SNAPSHOT_PATH,
      `${JSON.stringify({ updatedAt: new Date().toISOString(), projects: ordered }, null, 2)}\n`,
      'utf8',
    );
  } catch (error) {
    console.warn('[projects] local snapshot skipped:', error?.message);
  }
}

export async function readProjectsSnapshot() {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.projects)) return parsed.projects;
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}
