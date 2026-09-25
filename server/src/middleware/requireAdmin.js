/**
 * Admin authentication.
 *
 * Two rules keep this safe:
 *  1. If ADMIN_API_KEY / ADMIN_SESSION_SECRET are not configured, the write
 *     endpoints return 503. They never fall open.
 *  2. The API key exists only on the server. The browser receives a short-lived
 *     signed session token from POST /api/admin/session and sends that back in
 *     an Authorization header. No credential is ever baked into frontend code.
 */
import { config } from '../config/index.js';
import { AppError } from '../utils/http.js';
import { verifySessionToken } from '../utils/session.js';

export function requireAdmin(req, res, next) {
  if (!config.admin.configured) {
    return next(
      AppError.serviceUnavailable(
        'Admin authentication is not configured on this server. ' +
          'Set ADMIN_API_KEY and ADMIN_SESSION_SECRET, then restart the API.',
      ),
    );
  }

  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return next(AppError.unauthorized('Missing bearer token.'));
  }

  const result = verifySessionToken(token, config.admin.sessionSecret);
  if (!result.valid) {
    const message =
      result.reason === 'expired'
        ? 'Your admin session has expired. Please sign in again.'
        : 'Invalid admin session token.';
    return next(AppError.unauthorized(message));
  }

  req.admin = { subject: result.claims.sub };
  return next();
}
