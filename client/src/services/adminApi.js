/**
 * Admin authentication and admin-only reads.
 *
 * How the credential flow works:
 *
 *   1. You type your ADMIN_API_KEY into the /admin sign-in form.
 *   2. It is POSTed once to /api/admin/session. The API compares it against the
 *      value held in server/.env and, if it matches, returns a short-lived
 *      signed token.
 *   3. That token is kept in sessionStorage - scoped to the browser tab and
 *      cleared when the tab closes. A token cannot be used to obtain the API
 *      key, and closing the tab ends the session.
 *
 * No secret is ever bundled into the frontend, and no credential is hardcoded
 * here. When the token expires the API returns 401 and the UI asks you to sign
 * in again.
 */
import { api } from './api.js';

const TOKEN_STORAGE_KEY = 'portfolio.admin.session';

/* ---------------------------------------------------------------------------
 * Token storage
 * ------------------------------------------------------------------------- */

export function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;

    // Discard an obviously expired token up front rather than making a
    // request that is guaranteed to 401.
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    // sessionStorage can throw in private-mode or sandboxed contexts.
    return null;
  }
}

export function storeSession({ token, expiresAt }) {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ token, expiresAt }));
  } catch {
    /* Storage unavailable - the session simply will not survive a reload. */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* Nothing to do. */
  }
}

/* ---------------------------------------------------------------------------
 * Endpoints
 * ------------------------------------------------------------------------- */

/** GET /api/admin/status - tells /admin whether the server has auth set up. */
export function fetchAdminStatus() {
  return api.get('/admin/status');
}

/**
 * POST /api/admin/session
 * Exchanges the API key for a short-lived signed token.
 */
export async function createSession(apiKey) {
  const result = await api.post('/admin/session', { apiKey });
  return result; // { token, expiresAt }
}

/** GET /api/admin/messages - contact form submissions. */
export async function fetchMessages(token) {
  const messages = await api.get('/admin/messages', { token });
  return Array.isArray(messages) ? messages : [];
}
