import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { checkConnection } from '../db/pool.js';

export const healthRouter = Router();

/** GET /api/health - used by uptime checks and by the admin dashboard. */
healthRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    let database = 'up';
    try {
      await checkConnection();
    } catch {
      database = 'down';
    }

    const healthy = database === 'up';
    res.status(healthy ? 200 : 503).json({
      data: {
        status: healthy ? 'ok' : 'degraded',
        database,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  }),
);
