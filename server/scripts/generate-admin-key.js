#!/usr/bin/env node
/**
 * Generates a fresh ADMIN_API_KEY / ADMIN_SESSION_SECRET pair.
 *
 *   npm run admin:key
 *
 * Copy both lines into server/.env and restart the API.
 * The API key is what you type into the /admin sign-in prompt; it never
 * appears anywhere in the frontend bundle.
 */
import { generateSecret } from '../src/utils/session.js';

console.log('');
console.log('  Add these two lines to server/.env:');
console.log('');
console.log(`  ADMIN_API_KEY=${generateSecret()}`);
console.log(`  ADMIN_SESSION_SECRET=${generateSecret()}`);
console.log('');
console.log('  Then restart the API: npm run dev');
console.log('');
