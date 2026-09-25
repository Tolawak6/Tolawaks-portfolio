import { Router } from 'express';
import { projectsRouter } from './projects.routes.js';
import { adminRouter } from './admin.routes.js';
import { contactRouter } from './contact.routes.js';
import { healthRouter } from './health.routes.js';

/** Single place where every API surface is mounted. */
export const apiRouter = Router();

/**
 * GET /api
 *
 * A short index of the API. Also what a request to the bare host resolves to on
 * Vercel, where every path is funnelled through the serverless function - so
 * hitting the deployment URL returns something useful rather than a 404.
 */
apiRouter.get('/', (req, res) => {
  res.json({
    data: {
      name: 'Portfolio API',
      status: 'running',
      docs: 'See README section 19 (API reference).',
      endpoints: [
        'GET    /api/health',
        'GET    /api/projects',
        'GET    /api/projects/:id',
        'POST   /api/projects            (admin)',
        'PUT    /api/projects/:id        (admin)',
        'DELETE /api/projects/:id        (admin)',
        'GET    /api/admin/status',
        'POST   /api/admin/session',
        'POST   /api/admin/uploads       (admin, multipart)',
        'GET    /api/admin/messages      (admin)',
        'POST   /api/contact',
      ],
    },
  });
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/contact', contactRouter);
