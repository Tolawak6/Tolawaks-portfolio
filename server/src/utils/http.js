/** Error type carrying an HTTP status so the error handler can respond correctly. */
export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (details) this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = 'Authentication is required.') {
    return new AppError(message, 401);
  }

  static notFound(message = 'Resource not found.') {
    return new AppError(message, 404);
  }

  /** 415 - used when an upload is not an image, or is bigger than the limit. */
  static unsupportedMediaType(message = 'That file type is not supported.') {
    return new AppError(message, 415);
  }

  static serviceUnavailable(message) {
    return new AppError(message, 503);
  }
}

/** Wraps async route handlers so rejected promises reach the error middleware. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
