import { AppError } from '../utils/http.js';

/** Terminal middleware for unmatched routes. */
export function notFound(req, res, next) {
  next(AppError.notFound(`No API route matches ${req.method} ${req.originalUrl}`));
}
