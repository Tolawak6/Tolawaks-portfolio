#!/usr/bin/env node
/**
 * Generates a fresh ADMIN_API_KEY / ADMIN_SESSION_SECRET pair.
 *
 *   npm run admin:key            print a new pair
 *   npm run admin:key -- --write  write them into server/.env for you
 *
 * The API key is what you type into the /admin sign-in prompt. It never appears
 * anywhere in the frontend bundle - the browser only ever receives a signed
 * session token in exchange for it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSecret } from '../src/utils/session.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(HERE, '..', '.env');
const ENV_EXAMPLE_PATH = path.resolve(HERE, '..', '.env.example');

const apiKey = generateSecret();
const sessionSecret = generateSecret();

const shouldWrite = process.argv.includes('--write') || process.argv.includes('-w');

/**
 * Replaces existing assignments in place, or appends them if absent.
 * Rewriting rather than appending keeps the file from accumulating duplicate
 * keys, which dotenv resolves unpredictably.
 */
function upsert(content, name, value) {
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, 'm');
  return pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`;
}

if (shouldWrite) {
  if (!fs.existsSync(ENV_PATH)) {
    if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
      console.error(`\n  Cannot find ${ENV_EXAMPLE_PATH} to copy from.\n`);
      process.exit(1);
    }
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    console.log(`\n  Created ${ENV_PATH} from the example.`);
  }

  let content = fs.readFileSync(ENV_PATH, 'utf8');
  content = upsert(content, 'ADMIN_API_KEY', apiKey);
  content = upsert(content, 'ADMIN_SESSION_SECRET', sessionSecret);
  fs.writeFileSync(ENV_PATH, content);

  console.log('\n  Wrote ADMIN_API_KEY and ADMIN_SESSION_SECRET into server/.env');
  console.log('  (the file is git-ignored, so these will not be committed)');
  console.log('\n  Your admin key, for signing in at /admin:\n');
  console.log(`  ${apiKey}\n`);
  console.log('  Restart the API to pick it up.\n');
} else {
  console.log('');
  console.log('  Add these two lines to server/.env:');
  console.log('');
  console.log(`  ADMIN_API_KEY=${apiKey}`);
  console.log(`  ADMIN_SESSION_SECRET=${sessionSecret}`);
  console.log('');
  console.log('  Then restart the API: npm run dev');
  console.log('');
  console.log('  Or run this again with --write to have it done for you:');
  console.log('    npm run admin:key -- --write');
  console.log('');
}
