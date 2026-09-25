/**
 * The single place that talks to the backend.
 *
 * Every request goes through `request()`, which normalises:
 *   - the base URL
 *   - JSON encoding/decoding
 *   - timeouts via AbortController
 *   - errors into a consistent ApiError shape
 *
 * Nothing else in the app calls fetch() directly.
 */

/**
 * Base URL of the API.
 *
 * When VITE_API_URL is unset the value is an empty string, so requests are made
 * against relative paths ("/api/projects"). In development Vite proxies those to
 * the backend, and in production they hit the same origin that served the page.
 * That means no hardcoded localhost anywhere in the source.
 */
const RAW_BASE_URL = import.meta.env.VITE_API_URL ?? '';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');
export const API_ORIGIN = `${API_BASE_URL}/api`;

/** Errors thrown by this module always look like this. */
export class ApiError extends Error {
  constructor(message, { status = 0, details = null, cause = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.cause = cause;
  }

  /** True when the request never reached the server. */
  get isNetworkError() {
    return this.status === 0;
  }

  /** Map of field -> message, ready to attach to form inputs. */
  get fieldErrors() {
    if (!Array.isArray(this.details)) return {};
    return this.details.reduce((acc, item) => {
      if (item?.field) acc[item.field] = item.message;
      return acc;
    }, {});
  }
}

/** Copy the API's message into a user-facing sentence. */
export function messageForStatus(status, serverMessage) {
  if (serverMessage) return serverMessage;

  switch (status) {
    case 400:
      return 'That request could not be processed.';
    case 401:
      return 'You are not authorised to do that.';
    case 404:
      return 'That item could not be found.';
    case 409:
      return 'That conflicts with something that already exists.';
    case 413:
      return 'That request was too large.';
    case 422:
      return 'Please check the submitted details and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 503:
      return 'The service is temporarily unavailable. Please try again shortly.';
    default:
      return status >= 500
        ? 'Something went wrong on the server. Please try again.'
        : 'The request failed.';
  }
}

/**
 * @param {string} path            e.g. '/projects' or '/projects/12'
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {object} [options.body]
 * @param {string} [options.token] bearer token for admin routes
 * @param {number} [options.timeoutMs]
 * @param {AbortSignal} [options.signal]
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    timeoutMs = 12_000,
    signal: externalSignal,
  } = options;

  const url = `${API_ORIGIN}${path}`;

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  // Combine our timeout with any caller-supplied signal.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort(externalSignal.reason);
    else externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason), { once: true });
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });
  } catch (error) {
    clearTimeout(timeout);
    // The caller aborted deliberately - let that propagate unchanged.
    if (externalSignal?.aborted) throw error;

    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      { status: 0, cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }

  // 204 No Content (DELETE) has no body to parse.
  if (response.status === 204) return null;

  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      messageForStatus(response.status, payload?.error?.message),
      {
        status: response.status,
        details: payload?.error?.details ?? null,
      },
    );
  }

  /*
   * Every endpoint wraps its payload as `{ data: ... }`, optionally with a
   * `meta` object alongside it (the project list includes a count). Unwrap
   * `data` here so callers work with the resource itself rather than the
   * envelope. `meta` is not surfaced because no screen currently needs it -
   * add a requestEnvelope() helper here if that changes.
   */
  return payload?.data ?? null;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
