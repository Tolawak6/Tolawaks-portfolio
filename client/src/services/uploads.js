/**
 * Image uploading to the API.
 *
 * This is the one place in the app that uses XMLHttpRequest rather than fetch.
 * Upload progress is the reason: fetch() still cannot report how much of a
 * request body has been sent, and on a slow mobile connection a bar that
 * actually moves is the difference between "working" and "broken".
 *
 * The browser never sees a storage credential. It sends the file to our API
 * with the admin session token, and the API signs and forwards it.
 */
import { API_ORIGIN, ApiError, messageForStatus } from './api.js';

/** Uploads can legitimately be slow on mobile data; give them room. */
const UPLOAD_TIMEOUT_MS = 60_000;

/**
 * POSTs a file to /api/admin/uploads.
 *
 * @param {File} file already downscaled by utils/optimizeImage.js
 * @param {string} token admin session token
 * @param {object} [options]
 * @param {(fraction: number) => void} [options.onProgress] 0..1
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{url: string, publicId: string, width: number|null,
 *                    height: number|null, bytes: number|null}>}
 */
export function uploadProjectImage(file, token, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_ORIGIN}/admin/uploads`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    if (signal) {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || !onProgress) return;
      // Cap at 0.99: the last percent is the server's work, not the transfer.
      onProgress(Math.min(0.99, event.loaded / event.total));
    });

    xhr.addEventListener('load', () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        payload = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve(payload?.data ?? null);
        return;
      }

      reject(
        new ApiError(messageForStatus(xhr.status, payload?.error?.message), {
          status: xhr.status,
          details: payload?.error?.details ?? null,
        }),
      );
    });

    xhr.addEventListener('error', () => {
      reject(
        new ApiError('Could not reach the server. Check your connection and try again.', {
          status: 0,
        }),
      );
    });

    xhr.addEventListener('timeout', () => {
      reject(
        new ApiError('The upload timed out. Please try again on a stronger connection.', {
          status: 0,
        }),
      );
    });

    xhr.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'));
    });

    xhr.send(body);
  });
}
