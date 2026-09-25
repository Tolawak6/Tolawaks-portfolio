/**
 * Central error handler.
 *
 * Visitors never see a stack trace or a raw PostgreSQL message. Known database
 * error codes are translated into sensible HTTP responses; everything else
 * becomes a generic 500 while the real detail is logged server-side.
 */
import { config } from '../config/index.js';
import { AppError } from '../utils/http.js';

/** Postgres error codes we can explain to a client. */
function translateDatabaseError(error) {
  switch (error.code) {
    case '23514': // check_violation
      return new AppError('The submitted data failed a database constraint.', 422);
    case '23505': // unique_violation
      return new AppError('That record already exists.', 409);
    case '23503': // foreign_key_violation
      return new AppError('A referenced record does not exist.', 409);
    case '22P02': // invalid_text_representation
      return new AppError('One of the supplied values has the wrong format.', 400);
    case '42P01': // undefined_table
      return new AppError('The database schema has not been initialised yet.', 503);
    case 'ECONNREFUSED':
    case '57P03': // cannot_connect_now
      return new AppError('The database is currently unavailable.', 503);
    default:
      return null;
  }
}

// eslint-disable-next-line no-unused-vars -- Express identifies this by arity.
export function errorHandler(error, req, res, next) {
  let resolved = error instanceof AppError ? error : translateDatabaseError(error);

  if (!resolved) {
    if (error?.type === 'entity.parse.failed') {
      resolved = new AppError('Request body is not valid JSON.', 400);
    } else if (error?.type === 'entity.too.large') {
      resolved = new AppError('Request body is too large.', 413);
    } else {
      resolved = new AppError('Something went wrong on our side.', 500);
    }
  }

  const status = resolved.statusCode ?? 500;

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${status}`, {
      message: error?.message,
      code: error?.code,
      stack: config.isProduction ? undefined : error?.stack,
    });
  }

  const body = {
    error: {
      message: resolved.message,
      status,
    },
  };
  if (resolved.details) body.error.details = resolved.details;

  res.status(status).json(body);
}
