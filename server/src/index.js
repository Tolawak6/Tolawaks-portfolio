/**
 * Local development and traditional-host entry point.
 *
 * On Vercel this file is never executed as a server: serverless functions have
 * no long-lived listener. Instead the app is imported and driven per request -
 * see `api/index.js`.
 *
 * To make that work under both models, this module:
 *   1. exports the Express app, so importing it yields something usable, and
 *   2. only starts an HTTP listener when the file is run directly.
 *
 * The `VERCEL` guard is deliberate belt-and-braces. Vercel sets that variable in
 * every function, and if its zero-configuration Express detection were to pick
 * this file up as the entry point, calling `listen()` here would leave requests
 * unanswered. Exporting the app means detection still succeeds.
 */
import { createApp } from './app.js';
import { config } from './config/index.js';
import { isServerless } from './config/runtime.js';
import { checkConnection, closePool } from './db/pool.js';

const app = createApp();

/** True when this file is the process entry point (`node src/index.js`). */
function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === new URL(`file://${process.argv[1]}`).href;
  } catch {
    return false;
  }
}

async function start() {
  // Fail loudly but do not crash: the API still serves /api/health so a
  // misconfigured DATABASE_URL is easy to diagnose from the browser or a
  // hosting provider's log view.
  try {
    await checkConnection();
    console.log('[db] connected');
  } catch (error) {
    console.error(`[db] connection failed: ${error.message}`);
    console.error('[db] run "npm run db:migrate" once your DATABASE_URL is correct.');
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log('');
    console.log(`  Portfolio API listening on http://localhost:${config.port}`);
    console.log(`  Environment      : ${config.env}`);
    console.log(`  Allowed origins  : ${config.allowedOrigins.join(', ') || '(none)'}`);
    console.log(`  Admin auth       : ${config.admin.configured ? 'enabled' : 'DISABLED (set ADMIN_API_KEY + ADMIN_SESSION_SECRET)'}`);
    console.log(`  Image uploads    : ${config.storage.enabled ? `enabled (max ${Math.round(config.storage.maxUploadBytes / (1024 * 1024))} MB)` : 'DISABLED (set CLOUDINARY_* values)'}`);
    console.log('');
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, shutting down`);
    server.close(async () => {
      await closePool().catch(() => {});
      process.exit(0);
    });
    // Do not hang forever if a connection refuses to close.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only bind a port when run as a server. A serverless import must not listen.
if (!isServerless && isMainModule()) {
  start().catch((error) => {
    console.error('[server] failed to start:', error.message);
    process.exit(1);
  });
}

export default app;
export { app };
