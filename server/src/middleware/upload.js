/**
 * Multipart handling for image uploads.
 *
 * Files are held in memory rather than on disk: an admin upload is at most a
 * few megabytes, the bytes go straight to Cloudinary, and nothing is ever
 * written to the server's filesystem. That keeps the API stateless, which means
 * it can be deployed anywhere - including hosts with an ephemeral disk.
 *
 * Limits are enforced here (before any bytes reach Cloudinary) so an oversized
 * or non-image upload is rejected as early as possible.
 */
import multer from 'multer';
import { config } from '../config/index.js';
import { AppError } from '../utils/http.js';

/**
 * Formats a browser can be expected to produce and Cloudinary can read.
 * The list is intentionally short: SVG is excluded because it can carry
 * script, and it is not a sensible format for a project screenshot.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxUploadBytes,
    files: 1,
    // A multipart body for a single small image needs very few fields.
    fields: 4,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(
        AppError.unsupportedMediaType(
          'That file type is not supported. Please choose a JPEG, PNG, WebP, ' +
            'AVIF or GIF image.',
        ),
      );
    }
    return callback(null, true);
  },
});

/**
 * Wraps multer so its own errors become AppErrors with useful statuses
 * instead of reaching the generic 500 handler.
 */
export function uploadSingleImage(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof AppError) return next(error);

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE': {
          const mb = Math.round(config.storage.maxUploadBytes / (1024 * 1024));
          return next(
            AppError.unsupportedMediaType(
              `That image is larger than the ${mb} MB limit. Please choose a smaller file.`,
            ),
          );
        }
        case 'LIMIT_FILE_COUNT':
        case 'LIMIT_UNEXPECTED_FILE':
          return next(AppError.badRequest('Please upload exactly one image file.'));
        default:
          return next(AppError.badRequest('The upload could not be read.'));
      }
    }

    return next(error);
  });
}
