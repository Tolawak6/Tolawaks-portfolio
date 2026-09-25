/**
 * Handlers that receive raw request bodies, validate them, and hand clean data
 * to the service layer. Keeping validation here means controllers stay thin
 * and the same rules apply no matter which route is called.
 */
import * as projectService from '../services/project.service.js';
import * as storage from '../services/storage.service.js';
import { validateProjectPayload } from '../validators/project.validator.js';

/**
 * Deletes a stored image once nothing references it any more.
 *
 * Two deliberate safety properties:
 *   - Assets with no recorded id (pasted URLs, seeded samples) are never
 *     touched, so we cannot delete something that was not ours to manage.
 *   - The count is re-checked immediately before deleting, so an image shared
 *     by two projects survives until the last one lets go of it.
 *
 * Entirely best-effort. A storage failure must never fail the request that
 * triggered it: an orphaned file is a tidiness problem, a failed database write
 * is a correctness problem.
 */
async function releaseAsset(publicId, { excludeId = null } = {}) {
  if (!publicId || !storage.isConfigured()) return;

  try {
    const stillUsed = await projectService.countByImagePublicId(publicId, { excludeId });
    if (stillUsed > 0) return;

    await storage.destroyImage(publicId);
  } catch (error) {
    console.warn(`[projects] image cleanup skipped for "${publicId}":`, error?.message);
  }
}


export async function listProjects(req, res) {
  const projects = await projectService.findAll();
  res.status(200).json({
    data: projects,
    meta: { count: projects.length },
  });
}

export async function getProject(req, res) {
  const project = await projectService.findById(req.params.id);
  if (!project) {
    return res.status(404).json({
      error: { message: `Project ${req.params.id} was not found.`, status: 404 },
    });
  }
  return res.status(200).json({ data: project });
}

export async function createProject(req, res) {
  const { value, errors } = validateProjectPayload(req.body);
  if (errors.length > 0) {
    return res.status(422).json({
      error: {
        message: 'The submitted project data is not valid.',
        status: 422,
        details: errors,
      },
    });
  }

  const project = await projectService.create(value);
  return res.status(201).json({ data: project });
}

export async function updateProject(req, res) {
  const { value, errors } = validateProjectPayload(req.body);
  if (errors.length > 0) {
    return res.status(422).json({
      error: {
        message: 'The submitted project data is not valid.',
        status: 422,
        details: errors,
      },
    });
  }

  // Read the row before overwriting it: afterwards there is no way to tell
  // which stored asset it used to point at.
  const previous = await projectService.findById(req.params.id);
  if (!previous) {
    return res.status(404).json({
      error: { message: `Project ${req.params.id} was not found.`, status: 404 },
    });
  }

  const project = await projectService.update(req.params.id, value);

  // Replacing the image leaves the previous upload unreferenced.
  if (previous.imagePublicId && previous.imagePublicId !== value.imagePublicId) {
    await releaseAsset(previous.imagePublicId, { excludeId: project.id });
  }

  return res.status(200).json({ data: project });
}

export async function deleteProject(req, res) {
  const previous = await projectService.findById(req.params.id);
  if (!previous) {
    return res.status(404).json({
      error: { message: `Project ${req.params.id} was not found.`, status: 404 },
    });
  }

  const removed = await projectService.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({
      error: { message: `Project ${req.params.id} was not found.`, status: 404 },
    });
  }

  // The row is gone, so any remaining reference means another project shares
  // this image - in which case it stays.
  await releaseAsset(previous.imagePublicId);

  return res.status(204).send();
}
