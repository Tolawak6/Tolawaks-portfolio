/**
 * Image storage, backed by Cloudinary.
 *
 * Why the upload is signed, and why the signature is produced here:
 *
 *   The browser could post straight to Cloudinary with an unsigned upload
 *   preset, but then the preset is effectively a public write key - anyone who
 *   finds it can dump files into the account. Signing means every upload must
 *   first pass through this API, which checks the admin session token. The API
 *   secret never leaves the server; the browser only ever receives a signature
 *   that is valid for one hour and locks in the destination folder.
 *
 * Cloudinary's signing rule (https://cloudinary.com/documentation/authentication_signatures):
 *   1. Take every upload parameter EXCEPT file, cloud_name, resource_type and
 *      api_key - including timestamp.
 *   2. Sort them alphabetically by name, join as `name=value` with `&`.
 *   3. Append the API secret with no separator.
 *   4. SHA-1 hash it; the hex digest is the signature.
 *
 * The verification suite asserts this against Cloudinary's own published test
 * vectors, so a regression in signParams() cannot pass unnoticed.
 *
 * No Cloudinary SDK is used: signing is ~6 lines of crypto and the upload is a
 * single multipart POST, so the dependency would not earn its place.
 */
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { AppError } from '../utils/http.js';

/** Cloudinary requests get a hard timeout so a hung upload cannot pin a socket. */
const REQUEST_TIMEOUT_MS = 30_000;

/** True when all three Cloudinary settings are present. */
export function isConfigured() {
  return config.storage.enabled;
}

/**
 * Builds the Cloudinary signature for a set of parameters.
 * Exported so the test suite can check it against known-good vectors.
 *
 * @param {Record<string, string|number>} params parameters to sign
 * @param {string} apiSecret
 * @returns {string} hex SHA-1 digest
 */
export function signParams(params, apiSecret) {
  const serialised = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${serialised}${apiSecret}`).digest('hex');
}

/** Throws a 503 rather than letting an unconfigured server attempt an upload. */
function assertConfigured() {
  if (!config.storage.enabled) {
    throw AppError.serviceUnavailable(
      'Image uploads are not configured on this server. ' +
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, ' +
        'then restart the API. You can still paste an image URL instead.',
    );
  }
}

/**
 * Turns a Cloudinary error response into something an admin can act on.
 * Requests are admin-only, so the message is allowed to be specific - but it
 * still never echoes the raw upstream JSON.
 */
function describeUpstreamError(status, payload) {
  const raw = String(payload?.error?.message ?? '').toLowerCase();

  if (raw.includes('invalid signature') || raw.includes('unknown api key')) {
    return new AppError(
      'Cloudinary rejected the upload signature. Check that ' +
        'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in server/.env belong to the ' +
        'same account as CLOUDINARY_CLOUD_NAME.',
      502,
    );
  }
  if (raw.includes('file size too large') || raw.includes('maximum is')) {
    return new AppError('That image is too large for the storage account.', 413);
  }
  if (raw.includes('unsupported') || raw.includes('invalid image')) {
    return new AppError('Cloudinary could not read that file as an image.', 415);
  }
  if (status === 401 || status === 403) {
    return new AppError('Cloudinary refused the credentials in server/.env.', 502);
  }
  if (status === 429) {
    return new AppError('The image service is rate limiting us. Try again shortly.', 503);
  }

  return new AppError('The image could not be stored. Please try again.', 502);
}

/**
 * Uploads an image buffer to Cloudinary and returns where it landed.
 *
 * @param {object} file
 * @param {Buffer} file.buffer    raw bytes (multer memory storage)
 * @param {string} file.originalname
 * @param {string} file.mimetype
 * @returns {Promise<{url: string, publicId: string, width: number, height: number, bytes: number, format: string}>}
 */
export async function uploadImage({ buffer, originalname, mimetype }) {
  assertConfigured();

  const timestamp = Math.floor(Date.now() / 1000);

  // Only these parameters are signed, and exactly these are sent. If a signed
  // parameter is omitted from the request, or an unsigned one is added,
  // Cloudinary rejects the upload - so the two must be kept in step.
  const params = {
    folder: config.storage.folder,
    timestamp,
  };

  const signature = signParams(params, config.storage.apiSecret);

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }), originalname || 'upload');
  form.append('api_key', config.storage.apiKey);
  form.append('signature', signature);
  for (const [key, value] of Object.entries(params)) {
    form.append(key, String(value));
  }

  let response;
  try {
    response = await fetch(
      `${config.storage.apiBase}/v1_1/${config.storage.cloudName}/image/upload`,
      {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    throw new AppError(
      timedOut
        ? 'The image upload timed out. Please try again.'
        : 'Could not reach the image storage service. Please try again.',
      503,
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.secure_url) {
    throw describeUpstreamError(response.status, payload);
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width ?? null,
    height: payload.height ?? null,
    bytes: payload.bytes ?? null,
    format: payload.format ?? null,
  };
}

/**
 * Removes a previously uploaded image.
 *
 * Deliberately best-effort: callers wrap this so a storage hiccup can never
 * undo or block the database write it accompanies. An orphaned file in
 * Cloudinary is a much smaller problem than a failed delete in PostgreSQL.
 *
 * @param {string} publicId
 * @returns {Promise<boolean>} true when the asset was removed
 */
export async function destroyImage(publicId) {
  if (!config.storage.enabled || !publicId) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = signParams(params, config.storage.apiSecret);

  const body = new URLSearchParams({
    ...params,
    api_key: config.storage.apiKey,
    signature,
  });

  try {
    const response = await fetch(
      `${config.storage.apiBase}/v1_1/${config.storage.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    const payload = await response.json().catch(() => null);
    return Boolean(response.ok && (payload?.result === 'ok' || payload?.result === 'not found'));
  } catch (error) {
    // Logged, never surfaced: the caller is mid-way through a database change.
    console.warn(`[storage] could not delete asset "${publicId}":`, error?.message);
    return false;
  }
}
