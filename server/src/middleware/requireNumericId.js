import { AppError } from '../utils/http.js';

/**
 * Requires a numeric :id route parameter so that /api/projects/abc returns a
 * 400 rather than reaching PostgreSQL and surfacing a cast error as a 500.
 */
export function requireNumericId(paramName = 'id') {
  return (req, res, next) => {
    const raw = req.params[paramName];
    const id = Number(raw);

    if (!Number.isInteger(id) || id <= 0) {
      return next(AppError.badRequest(`"${raw}" is not a valid ${paramName}. Expected a positive integer.`));
    }

    req.params[paramName] = id;
    return next();
  };
}
