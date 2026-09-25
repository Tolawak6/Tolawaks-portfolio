/**
 * Where are we running?
 *
 * Kept in its own module so both `src/index.js` and `config/index.js` can ask
 * without importing each other - config is imported very early and should not
 * depend on anything that touches the database.
 *
 * Two things change on a serverless host, and both matter:
 *
 *   1. **Connection pool size.** Each function instance builds its own pool.
 *      Ten connections per instance, multiplied by however many instances Vercel
 *      starts, will exhaust a hosted Postgres connection limit quickly. Three is
 *      plenty for a single request at a time, and Neon's pooler absorbs the
 *      churn.
 *   2. **Upload size.** Vercel rejects any request body over 4.5 MB with
 *      FUNCTION_PAYLOAD_TOO_LARGE before the function runs, so the server-side
 *      limit has to sit below that or users see a confusing 413 instead of our
 *      own validation message.
 *
 * `VERCEL` is set in every Vercel build and function. The Lambda variable is
 * checked too in case this is ever moved to AWS directly.
 */
export const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

/** Vercel's hard request-body ceiling, in bytes. Not configurable. */
export const SERVERLESS_BODY_LIMIT_BYTES = 4.5 * 1024 * 1024;

/** Default upload ceiling: 4 MB on serverless, 5 MB on a normal server. */
export const defaultMaxUploadMb = isServerless ? '4' : '5';

/** Default pool size: small on serverless, roomier on a long-lived process. */
export const defaultPoolMax = isServerless ? '3' : '10';
