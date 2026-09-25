/**
 * Minimal signed-session helpers built on node:crypto.
 *
 * Produces a compact `<payload>.<signature>` token where the payload is
 * base64url JSON and the signature is an HMAC-SHA256 over that payload.
 * This is the same construction JWT uses for HS256, implemented directly so
 * the project needs no extra dependency.
 *
 * A token can only be minted by this server (it requires ADMIN_SESSION_SECRET)
 * and verification is constant-time, so it cannot be forged or brute-forced
 * from the browser.
 */
import crypto from 'node:crypto';

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadSegment, secret) {
  return crypto.createHmac('sha256', secret).update(payloadSegment).digest('base64url');
}

/**
 * @param {object} payload            claims to embed, e.g. { sub: 'admin' }
 * @param {string} secret             signing secret (>= 16 chars, enforced by config)
 * @param {number} ttlSeconds         lifetime in seconds
 */
export function createSessionToken(payload, secret, ttlSeconds) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: issuedAt, exp: issuedAt + ttlSeconds };
  const segment = base64url(JSON.stringify(claims));
  return `${segment}.${sign(segment, secret)}`;
}

/**
 * @returns {{ valid: true, claims: object } | { valid: false, reason: string }}
 * Never throws - callers branch on `valid`.
 */
export function verifySessionToken(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, reason: 'malformed' };
  }

  const [segment, providedSignature] = token.split('.');
  if (!segment || !providedSignature) {
    return { valid: false, reason: 'malformed' };
  }

  const expectedSignature = sign(segment, secret);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  // timingSafeEqual throws on length mismatch, so guard first.
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return { valid: false, reason: 'bad_signature' };
  }

  let claims;
  try {
    claims = JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (typeof claims?.exp !== 'number' || claims.exp * 1000 <= Date.now()) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, claims };
}

/**
 * Constant-time comparison for secrets of unknown length.
 * Hashes both sides first so differing lengths cannot leak timing information.
 */
export function safeCompare(a, b) {
  const digestA = crypto.createHash('sha256').update(String(a)).digest();
  const digestB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

/** Cryptographically strong secret suitable for ADMIN_API_KEY / session signing. */
export function generateSecret(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}
