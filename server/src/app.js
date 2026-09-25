import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

/** Builds the Express application. Exported separately so tests can import it. */
export function createApp() {
  const app = express();

  // Behind Render/Railway/nginx the client IP arrives in X-Forwarded-For.
  // Trusting exactly one proxy hop keeps express-rate-limit keyed correctly
  // without letting a client spoof its own address.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // The API serves JSON only; CSP here would just be noise. The frontend
      // host is responsible for its own policy.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header: same-origin, curl, or a server-to-server call.
        if (!origin) return callback(null, true);
        if (config.allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
      maxAge: 86_400,
    }),
  );

  app.use(express.json({ limit: '100kb' }));

  // Broad safety net; the contact and admin routes add stricter limits on top.
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  if (!config.isProduction) app.use(requestLogger);

  app.get('/', (req, res) => {
    res.json({
      data: {
        name: 'Portfolio API',
        status: 'running',
        endpoints: [
          'GET    /api/health',
          'GET    /api/projects',
          'GET    /api/projects/:id',
          'POST   /api/projects            (admin)',
          'PUT    /api/projects/:id        (admin)',
          'DELETE /api/projects/:id        (admin)',
          'GET    /api/admin/status',
          'POST   /api/admin/session',
          'GET    /api/admin/messages      (admin)',
          'POST   /api/admin/uploads       (admin, multipart)',
          'POST   /api/contact',
        ],
      },
    });
  });

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
