import 'dotenv/config';
import os from 'node:os';
import {
  isServerless,
  defaultMaxUploadMb,
  defaultPoolMax,
  SERVERLESS_BODY_LIMIT_BYTES,
} from './runtime.js';

/**
 * Reads an environment variable and fails fast when a required value is absent.
 * Failing at boot is far safer than discovering a missing secret on first request.
 */
function required(name, { fallback, validate } = {}) {
  const raw = process.env[name];
  const value = raw === undefined || raw === '' ? fallback : raw;

  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy server/.env.example to server/.env and fill it in.`,
    );
  }
  if (validate && !validate(value)) {
    throw new Error(`Environment variable "${name}" has an invalid value.`);
  }
  return value;
}

function optional(name, fallback = '') {
  const raw = process.env[name];
  return raw === undefined || raw === '' ? fallback : raw;
}

function toList(value) {
  return value
    .split(',')
    .map((entry) => entry.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

const nodeEnv = optional('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

/**
 * Admin secrets are optional at boot so that a brand new clone still runs.
 * When they are absent the admin write endpoints respond 503 instead of
 * granting access - see middleware/requireAdmin.js.
 */
const adminApiKey = optional('ADMIN_API_KEY');
const adminSessionSecret = optional('ADMIN_SESSION_SECRET');

const adminConfigured =
  adminApiKey.length >= 16 && adminSessionSecret.length >= 16;

/**
 * Image storage is Cloudinary. All three values are optional so a fresh clone
 * still boots: without them the upload endpoint returns 503 and the admin form
 * falls back to pasting an image URL.
 */
const cloudinaryCloudName = optional('CLOUDINARY_CLOUD_NAME');
const cloudinaryApiKey = optional('CLOUDINARY_API_KEY');
const cloudinaryApiSecret = optional('CLOUDINARY_API_SECRET');

const storageConfigured = Boolean(
  cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret,
);

if (!storageConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '\n[config] Image uploads are NOT configured.\n' +
      '         The admin dashboard will offer a URL field instead of a file picker.\n' +
      '         Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET\n' +
      '         in server/.env to enable uploads.\n',
  );
}

/**
 * Guard the interaction between our own upload limit and the host's body limit.
 * Vercel rejects an oversized body with FUNCTION_PAYLOAD_TOO_LARGE before this
 * code ever runs, so a limit above 4.5 MB is unreachable and would surface as an
 * opaque 413 rather than our friendly message.
 */
if (isServerless) {
  const configuredBytes = Number(optional('MAX_UPLOAD_MB', defaultMaxUploadMb)) * 1024 * 1024;
  if (configuredBytes > SERVERLESS_BODY_LIMIT_BYTES) {
    // eslint-disable-next-line no-console
    console.warn(
      `\n[config] MAX_UPLOAD_MB is higher than the host's ${SERVERLESS_BODY_LIMIT_BYTES / (1024 * 1024)} MB\n` +
        '         request-body limit. Uploads above that will be rejected by the platform\n' +
        '         with a 413 before this server sees them. Lower MAX_UPLOAD_MB.\n',
    );
  }
}

if (!adminConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '\n[config] Admin authentication is NOT configured.\n' +
      '         Project create/update/delete will return 503 until you set\n' +
      '         ADMIN_API_KEY and ADMIN_SESSION_SECRET in server/.env.\n' +
      '         Generate a pair with:  npm run admin:key\n',
  );
}

export const config = {
  env: nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  port: Number(required('PORT', { fallback: '4000', validate: (v) => !Number.isNaN(Number(v)) })),

  db: {
    connectionString: required('DATABASE_URL'),
    ssl: optional('DB_SSL', 'false').toLowerCase() === 'true' ? { rejectUnauthorized: false } : false,
    poolMax: Number(optional('DB_POOL_MAX', defaultPoolMax)),
  },

  cors: {
    origins: toList(optional('CLIENT_URL', 'http://localhost:5173')),
  },

  admin: {
    configured: adminConfigured,
    apiKey: adminApiKey,
    sessionSecret: adminSessionSecret,
    sessionTtlMinutes: Number(optional('ADMIN_SESSION_TTL_MINUTES', '120')),
  },

  storage: {
    enabled: storageConfigured,
    provider: 'cloudinary',
    cloudName: cloudinaryCloudName,
    apiKey: cloudinaryApiKey,
    apiSecret: cloudinaryApiSecret,
    // Everything lands in one folder, which makes the account easy to tidy up.
    folder: optional('CLOUDINARY_FOLDER', 'portfolio/projects'),
    // Overridable so the test suite can point at a local stand-in.
    apiBase: optional('CLOUDINARY_API_BASE', 'https://api.cloudinary.com').replace(/\/+$/, ''),
    // Applied by multer before a single byte is forwarded upstream. Defaults
    // lower on serverless because the host caps request bodies at 4.5 MB and
    // would reject the upload before our own validation could explain why.
    maxUploadBytes: Number(optional('MAX_UPLOAD_MB', defaultMaxUploadMb)) * 1024 * 1024,
  },

  // Surfaced so routes can report it and so the frontend can size its picker.
  serverless: isServerless,

  // In development every loopback origin is allowed so the site works no matter
  // which port the dev server picks. In production only CLIENT_URL entries pass.
  get allowedOrigins() {
    if (isProduction) return this.cors.origins;
    return [...this.cors.origins, ...loopbackOrigins()];
  },
};

function loopbackOrigins() {
  const ports = ['5173', '5174', '4173', '3000', '8080'];
  const hosts = new Set(['localhost', '127.0.0.1', '[::1]', os.hostname()]);
  const origins = [];
  for (const host of hosts) {
    for (const port of ports) {
      origins.push(`http://${host}:${port}`);
    }
  }
  // Vite picks the next free port when 5173 is taken.
  for (let port = 5173; port <= 5183; port += 1) {
    origins.push(`http://localhost:${port}`, `http://127.0.0.1:${port}`);
  }
  return origins;
}
