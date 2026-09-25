import { Router } from 'express';
import { requireNumericId } from '../middleware/requireNumericId.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/http.js';
import * as projectController from '../controllers/project.controller.js';

/**
 * Public read routes are open to everyone. Write routes sit behind
 * requireAdmin, which validates a signed session token issued by
 * POST /api/admin/session.
 */
export const projectsRouter = Router();

projectsRouter.get('/', asyncHandler(projectController.listProjects));

projectsRouter.get(
  '/:id',
  requireNumericId('id'),
  asyncHandler(projectController.getProject),
);

projectsRouter.post(
  '/',
  requireAdmin,
  asyncHandler(projectController.createProject),
);

projectsRouter.put(
  '/:id',
  requireAdmin,
  requireNumericId('id'),
  asyncHandler(projectController.updateProject),
);

projectsRouter.patch(
  '/:id',
  requireAdmin,
  requireNumericId('id'),
  asyncHandler(projectController.updateProject),
);

projectsRouter.delete(
  '/:id',
  requireAdmin,
  requireNumericId('id'),
  asyncHandler(projectController.deleteProject),
);
