/**
 * Shrinks an image in the browser before it is uploaded.
 *
 * Why this exists: a photo straight off a phone is 4-8 MB and 4000px wide, but
 * a project card never renders wider than about 600px. Uploading the original
 * would make the admin form slow on mobile data and make the portfolio itself
 * slow to load for every visitor afterwards. Re-encoding to a 1600px WebP
 * typically lands under 250 KB - a 20-30x reduction with no visible difference
 * on screen.
 *
 * The original file on the user's device is never modified; only the bytes that
 * travel over the network are affected.
 *
 * This runs entirely on the client, so the API stays free of a native image
 * dependency and the server does no CPU work before storing anything.
 */

/** Longest edge, in pixels, of what actually gets uploaded. */
const DEFAULT_MAX_DIMENSION = 1600;

/** WebP quality. 0.82 is visually lossless for screenshots and photographs. */
const DEFAULT_QUALITY = 0.82;

/** Refuse to even decode anything absurd before it reaches a canvas. */
const MAX_DECODE_BYTES = 40 * 1024 * 1024;

/** Animated GIFs are passed through untouched - a canvas would flatten them. */
const PASSTHROUGH_TYPES = new Set(['image/gif']);

/** SVG is not a photograph format, and can carry script. Not accepted. */
const REJECTED_TYPES = new Set(['image/svg+xml']);

export class ImageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageError';
  }
}

/** Reads intrinsic dimensions without going through a canvas first. */
async function decode(file) {
  // `imageOrientation: 'from-image'` applies the EXIF rotation flag, so photos
  // taken in portrait on a phone are not saved sideways. Older browsers reject
  // the option object, hence the fallback.
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      throw new ImageError(
        'That image could not be read. Try a JPEG, PNG, WebP or GIF file.',
      );
    }
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/** Swaps the extension so the filename matches what was actually produced. */
function renameTo(file, extension) {
  const base = file.name.replace(/\.[^./\\]+$/, '') || 'image';
  // Storage generates its own identifier regardless; this only keeps the
  // multipart filename honest for anyone reading logs.
  return `${base}.${extension}`;
}

/**
 * @param {File} file a file chosen by the user
 * @param {object} [options]
 * @param {number} [options.maxDimension] longest edge to keep
 * @param {number} [options.quality] WebP quality, 0-1
 * @returns {Promise<{file: File, previewUrl: string, width: number, height: number,
 *                    originalBytes: number, bytes: number, optimized: boolean}>}
 */
export async function optimizeImage(file, options = {}) {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;

  if (!file || !file.size) {
    throw new ImageError('That file is empty.');
  }
  if (file.type && REJECTED_TYPES.has(file.type)) {
    throw new ImageError('SVG files are not supported. Please choose a JPEG or PNG.');
  }
  if (file.size > MAX_DECODE_BYTES) {
    throw new ImageError('That image is too large to process. Please choose a smaller file.');
  }

  // Pass animation through untouched, but still report dimensions for preview.
  if (PASSTHROUGH_TYPES.has(file.type)) {
    const bitmap = await decode(file);
    const previewUrl = URL.createObjectURL(file);
    const result = {
      file,
      previewUrl,
      width: bitmap.width,
      height: bitmap.height,
      originalBytes: file.size,
      bytes: file.size,
      optimized: false,
    };
    bitmap.close?.();
    return result;
  }

  const bitmap = await decode(file);

  const longestEdge = Math.max(bitmap.width, bitmap.height);
  // Never scale up: enlarging a small screenshot would only add bytes and blur.
  const scale = longestEdge > maxDimension ? maxDimension / longestEdge : 1;

  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close?.();
    throw new ImageError('This browser could not process the image.');
  }

  // WebP has no alpha-free mode, but a transparent PNG needs its alpha kept.
  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close?.();

  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  let extension = 'webp';

  if (!blob) {
    // Safari before 14 has no WebP encoder.
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    extension = 'jpg';
  }

  if (!blob) {
    throw new ImageError('This browser could not process the image.');
  }

  /*
   * Occasionally a re-encode is counter-productive - a small, already-optimised
   * PNG can come out larger as WebP. When that happens, send the original: the
   * point of this function is a smaller upload, not a specific format.
   */
  const reEncodeWon = blob.size < file.size;
  const finalBlob = reEncodeWon ? blob : file;

  const optimizedFile = new File(
    [finalBlob],
    reEncodeWon ? renameTo(file, extension) : file.name,
    { type: reEncodeWon ? blob.type : file.type },
  );

  const previewUrl = URL.createObjectURL(finalBlob);

  return {
    file: optimizedFile,
    previewUrl,
    width: targetWidth,
    height: targetHeight,
    originalBytes: file.size,
    bytes: optimizedFile.size,
    optimized: reEncodeWon,
  };
}

/** "2.4 MB" / "180 KB" - for the "saved X%" line under the picker. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
