/**
 * Project API calls.
 *
 * The Projects section of the portfolio has no hardcoded project data anywhere:
 * every card is rendered from what these functions return.
 */
import { api } from './api.js';

/** GET /api/projects -> array of projects (newest first). */
export async function fetchProjects({ signal } = {}) {
  const projects = await api.get('/projects', { signal });
  return Array.isArray(projects) ? projects : [];
}

/** GET /api/projects/:id */
export function fetchProject(id, { signal } = {}) {
  return api.get(`/projects/${encodeURIComponent(id)}`, { signal });
}

/** POST /api/projects - requires an admin session token. */
export function createProject(payload, token) {
  return api.post('/projects', payload, { token });
}

/** PUT /api/projects/:id - requires an admin session token. */
export function updateProject(id, payload, token) {
  return api.put(`/projects/${encodeURIComponent(id)}`, payload, { token });
}

/** DELETE /api/projects/:id - requires an admin session token. */
export function deleteProject(id, token) {
  return api.delete(`/projects/${encodeURIComponent(id)}`, { token });
}
