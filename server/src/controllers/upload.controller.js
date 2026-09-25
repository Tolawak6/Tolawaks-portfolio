/**
 * Admin-only image upload.
 *
 * Flow:  browser -> POST /api/admin/uploads (admin token) -> Cloudinary
 *        Cloudinary returns a URL -> stored on the project row in PostgreSQL.
 *
 * The response always carries both the public `url` (what goes in the database
 * and what the browser renders) and the `publicId` (what a later delete needs
 * in order to clean the asset up).
 */
import * as storage from '../services/storage.service.js';
import { AppError } from '../utils/http.js';

export async function uploadImage(req, res) {
  if (!req.file?.buffer?.length) {
    throw AppError.badRequest('No image was received. Please choose a file and try again.');
  }

  const result = await storage.uploadImage({
    buffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  res.status(201).json({
    data: {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      // Echoed so the dashboard can show what was actually stored.
      uploadedBytes: req.file.size,
    },
  });
}
