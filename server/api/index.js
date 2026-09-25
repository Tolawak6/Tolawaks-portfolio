/**
 * Serverless entry point for Vercel.
 *
 * Vercel runs a function per request rather than a long-lived process, so this
 * adapts the same Express app that `src/index.js` serves locally. No route,
 * validator or database layer changes - only how the app is mounted.
 *
 * `app` is itself a `(req, res)` function, so once the path has been normalised
 * the app can be invoked directly.
 */
import { createApp } from '../src/app.js';
import { resolvePath } from '../src/utils/requestPath.js';

const app = createApp();

export default function handler(req, res) {
  req.url = resolvePath(req.url);
  return app(req, res);
}

/**
 * Also exported so the app can be driven directly - useful if Vercel's
 * zero-configuration Express detection picks this file up instead of the rewrite
 * above, and for tests.
 */
export { app };
