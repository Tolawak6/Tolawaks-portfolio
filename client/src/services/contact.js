import { api } from './api.js';

/**
 * POST /api/contact
 * The message is stored by the backend so it is never silently lost if an
 * email integration is added later.
 */
export function submitContactMessage({ name, email, subject, message }) {
  return api.post('/contact', { name, email, subject, message });
}
