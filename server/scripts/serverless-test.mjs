#!/usr/bin/env node
/**
 * Verifies the API works when mounted as a serverless function on Vercel.
 *
 *   cd server
 *   node scripts/serverless-test.mjs
 *
 * Why this exists: on Vercel the Express app is driven per request rather than
 * listening on a port, and the path it receives depends on the platform's
 * routing mode. Getting that wrong is the classic failure - every endpoint
 * returns the root response, or everything 404s - and it does not show up in
 * local development at all, because locally the path is always correct.
 *
 * So this test reproduces the shapes a rewrite may produce and checks the API
 * still answers. Reads DATABASE_URL from server/.env, same as the API itself.
 */
import http from 'node:http';
import { resolvePath } from '../src/utils/requestPath.js';

// Emulate a serverless host so config picks the smaller defaults.
process.env.VERCEL = process.env.VERCEL ?? '1';

const PORT = Number(process.env.SERVERLESS_TEST_PORT ?? 4300);

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  \x1b[32mPASS\x1b[0m ${label}`);
  } else {
    failed += 1;
    failures.push(label);
    console.log(`  \x1b[31mFAIL\x1b[0m ${label}${detail ? `\n         ${detail}` : ''}`);
  }
}

const section = (title) => console.log(`\n\x1b[1m${title}\x1b[0m`);

/* ------------------------------------------------------------------ unit -- */

section('Path normalisation');

const cases = [
  ['/api/projects', '/api/projects', 'original path preserved (the usual case)'],
  ['/projects', '/api/projects', 'rewrite destination replaced the path'],
  ['/api/index', '/api', 'function filename only'],
  ['/api/index/projects', '/api/projects', 'filename plus remainder'],
  ['/index/health', '/api/health', 'bare filename plus remainder'],
  ['/', '/api', 'bare request to the deployment host'],
  ['/health', '/api/health', 'unprefixed route'],
  ['/api/health?verbose=1', '/api/health?verbose=1', 'query string preserved'],
  ['/projects?limit=5', '/api/projects?limit=5', 'query preserved through a rewrite'],
  ['', '/api', 'empty url tolerated'],
  ['/api/indexers', '/api/indexers', 'lookalike route not truncated'],
];

for (const [input, expected, label] of cases) {
  const actual = resolvePath(input);
  check(`resolvePath(${JSON.stringify(input)}) -> ${expected}`, actual === expected, `got ${JSON.stringify(actual)} — ${label}`);
}

/* -------------------------------------------------------------- handler -- */

section('Handler');
const handlerModule = await import('../api/index.js');
const handler = handlerModule.default;
check('api/index.js exports a default handler', typeof handler === 'function');

/* --------------------------------------------------------------- live ----- */

section('Live requests');

const server = http.createServer((req, res) => handler(req, res));
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const get = async (p) => {
  const res = await fetch(`http://127.0.0.1:${PORT}${p}`);
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, body };
};

const projects = await get('/api/projects');
check('GET /api/projects -> 200', projects.status === 200, `got ${projects.status}`);
check(
  'returns a project list',
  Array.isArray(projects.body?.data),
  `got ${JSON.stringify(projects.body).slice(0, 120)}`,
);

const health = await get('/api/health');
check('GET /api/health -> 200', health.status === 200, `got ${health.status}`);

const root = await get('/api');
check('GET /api -> 200 with an endpoint index', root.status === 200 && Array.isArray(root.body?.data?.endpoints));

// The same endpoints through the other path shapes - the ones that break naive
// Express deploys.
const viaFilename = await get('/api/index/projects');
check('GET /api/index/projects -> 200', viaFilename.status === 200, `got ${viaFilename.status}`);

const viaStripped = await get('/projects');
check('GET /projects (prefix stripped) -> 200', viaStripped.status === 200, `got ${viaStripped.status}`);

const bareRoot = await get('/');
check('GET / -> the API index, not a 404', bareRoot.status === 200 && Array.isArray(bareRoot.body?.data?.endpoints));

// Writes stay protected however the path arrives.
const unauth = await fetch(`http://127.0.0.1:${PORT}/api/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'x', image: '', link: '', description: 'y' }),
});
check('POST /api/projects without a token -> 401', unauth.status === 401, `got ${unauth.status}`);

const unauthViaRewrite = await fetch(`http://127.0.0.1:${PORT}/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'x', image: '', link: '', description: 'y' }),
});
check('POST /projects without a token -> 401', unauthViaRewrite.status === 401, `got ${unauthViaRewrite.status}`);

/* --------------------------------------------------------------- config -- */

section('Serverless defaults');
const { config } = await import('../src/config/index.js');
check('serverless host detected', config.serverless === true);
check('database pool reduced', config.db.poolMax === 3, `got ${config.db.poolMax}`);
check(
  'upload limit below the platform 4.5 MB body cap',
  config.storage.maxUploadBytes < 4.5 * 1024 * 1024,
  `got ${(config.storage.maxUploadBytes / (1024 * 1024)).toFixed(1)} MB`,
);

await new Promise((resolve) => server.close(resolve));

/* --------------------------------------------------------------- result -- */

console.log(`\n${'─'.repeat(69)}`);
console.log(`  passed: \x1b[32m${passed}\x1b[0m   failed: ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '0'}`);
if (failed > 0) console.log(`  failures: ${failures.join(' | ')}`);
console.log(`${'─'.repeat(69)}\n`);

process.exit(failed > 0 ? 1 : 0);
