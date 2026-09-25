/**
 * Normalises the request path a serverless host hands to the Express app.
 *
 * Why this exists: Express routes on `req.url`, so it has to receive the path in
 * the shape the routes were registered for (`/api/projects`). But how a host
 * presents that path depends on its routing mode. Vercel, with the rewrite in
 * `vercel.json`, may hand over any of:
 *
 *   /api/projects        the original path, untouched      (the usual case)
 *   /projects            the rewrite destination replaced it
 *   /api/index           the function's own filename leaked through
 *   /api/index/projects  filename plus the remaining path
 *   /                    a bare request to the deployment host
 *
 * Guessing wrong is the single most common way an Express deploy breaks: either
 * every endpoint returns the root response, or everything 404s. Rather than
 * depend on one behaviour, every shape is reduced to the canonical one.
 *
 * Kept separate from the handler so it can be unit tested without starting the
 * app or touching a database.
 */

/**
 * @param {string} rawUrl the value of `req.url`, query string included
 * @returns {string} a path guaranteed to begin with `/api`, query preserved
 */
export function resolvePath(rawUrl = '/') {
  const source = typeof rawUrl === 'string' && rawUrl ? rawUrl : '/';

  const queryIndex = source.indexOf('?');
  const pathname = queryIndex === -1 ? source : source.slice(0, queryIndex);
  const search = queryIndex === -1 ? '' : source.slice(queryIndex);

  // Drop a leading "/api/index" or "/index" that belongs to the function's own
  // filename rather than to the API's route space. The lookahead keeps a real
  // route named e.g. "/indexes" from being truncated.
  let path = pathname.replace(/^\/(?:api\/index|index)(?=\/|$)/, '');

  // Collapse a bare "/" to nothing, so it becomes the API root rather than
  // leaving a trailing slash behind.
  if (path === '/') path = '';

  // Everything the app serves lives under /api, so restore the prefix when the
  // rewrite stripped it. Checked after the strip so "/api/index" becomes "/api"
  // rather than being left alone.
  if (!path.startsWith('/api')) {
    path = path === '' ? '/api' : `/api${path}`;
  }

  return `${path}${search}`;
}
