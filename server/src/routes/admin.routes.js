import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { asyncHandler, AppError } from '../utils/http.js';
import { createSessionToken, safeCompare } from '../utils/session.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { uploadSingleImage } from '../middleware/upload.js';
import { findAllMessages } from '../services/contact.service.js';
import { uploadImage } from '../controllers/upload.controller.js';

export const adminRouter = Router();

/**
 * Brute-force protection: 10 attempts per 15 minutes per IP in production
 * (relaxed outside production so local testing is not locked out).
 * `skipSuccessfulRequests` means a legitimate admin signing in repeatedly is
 * never locked out.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isProduction ? 10 : 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
      status: 429,
    },
  },
});

/**
 * Upload throttling. Generous enough to add several projects in a row, tight
 * enough that a signed-in session cannot be used to hammer the storage account.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isProduction ? 40 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many image uploads. Please wait a few minutes and try again.',
      status: 429,
    },
  },
});

/** Reports whether admin auth is available so /admin can explain itself. */
adminRouter.get('/status', (req, res) => {
  res.json({
    data: {
      authConfigured: config.admin.configured,
      sessionTtlMinutes: config.admin.sessionTtlMinutes,
      // Lets the dashboard show the file picker or the URL fallback.
      uploadsConfigured: config.storage.enabled,
      maxUploadMb: Math.round(config.storage.maxUploadBytes / (1024 * 1024)),
      storageProvider: config.storage.provider,
    },
  });
});

/**
 * POST /api/admin/session
 * Body: { apiKey }
 * Exchanges the server-side API key for a short-lived signed session token.
 */
adminRouter.post(
  '/session',
  loginLimiter,
  asyncHandler(async (req, res) => {
    if (!config.admin.configured) {
      throw AppError.serviceUnavailable(
        'Admin authentication is not configured on this server. ' +
          'Set ADMIN_API_KEY and ADMIN_SESSION_SECRET, then restart the API.',
      );
    }

    const providedKey = String(req.body?.apiKey ?? '');
    if (!providedKey || !safeCompare(providedKey, config.admin.apiKey)) {
      // Same message for missing and wrong keys so nothing is leaked.
      throw AppError.unauthorized('That admin key is not valid.');
    }

    const ttlSeconds = config.admin.sessionTtlMinutes * 60;
    const token = createSessionToken({ sub: 'admin' }, config.admin.sessionSecret, ttlSeconds);

    res.status(201).json({
      data: {
        token,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      },
    });
  }),
);

/**
 * POST /api/admin/uploads
 * Multipart image upload: `file` field, bearer token required.
 *
 * requireAdmin runs first so an unauthenticated request is rejected before its
 * body is buffered - only a signed-in admin can make the server hold bytes in
 * memory.
 */
adminRouter.post(
  '/uploads',
  requireAdmin,
  uploadLimiter,
  uploadSingleImage,
  asyncHandler(uploadImage),
);

/**
 * GET /api/admin/messages
 * Read-only view of contact form submissions, protected by the same session
 * token. Kept behind auth because the messages contain personal details.
 */
adminRouter.get(
  '/messages',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const messages = await findAllMessages({ limit: 100 });
    res.json({ data: messages, meta: { count: messages.length } });
  }),
);
