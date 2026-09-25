/**
 * Validation for project payloads.
 *
 * Deliberately dependency-free: the rules are small and explicit, which keeps
 * the API lightweight and the error messages consistent. Returns a cleaned
 * `value` object plus an `errors` array so controllers can respond 422 with
 * field-level detail.
 */

const LIMITS = {
  name: 150,
  image: 2048,
  imagePublicId: 300,
  link: 2048,
  description: 2000,
};

/** Accepts absolute http(s) URLs as well as site-relative paths like /images/a.png */
function isUsableUrl(value) {
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {unknown} body  raw JSON body
 * @param {object}  [options]
 * @param {boolean} [options.partial] when true, absent fields are left untouched
 */
export function validateProjectPayload(body, { partial = false } = {}) {
  const errors = [];
  const value = {};

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return {
      value,
      errors: [{ field: 'body', message: 'A JSON object is required.' }],
    };
  }

  // ---- name (required) -------------------------------------------------
  if (body.name === undefined && !partial) {
    errors.push({ field: 'name', message: 'Project name is required.' });
  } else if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      errors.push({ field: 'name', message: 'Project name cannot be empty.' });
    } else if (name.length > LIMITS.name) {
      errors.push({ field: 'name', message: `Project name must be ${LIMITS.name} characters or fewer.` });
    } else {
      value.name = name;
    }
  }

  // ---- description (required) -----------------------------------------
  if (body.description === undefined && !partial) {
    errors.push({ field: 'description', message: 'Description is required.' });
  } else if (body.description !== undefined) {
    const description = String(body.description).trim();
    if (!description) {
      errors.push({ field: 'description', message: 'Description cannot be empty.' });
    } else if (description.length > LIMITS.description) {
      errors.push({
        field: 'description',
        message: `Description must be ${LIMITS.description} characters or fewer.`,
      });
    } else {
      value.description = description;
    }
  }

  // ---- image (required, may be blank if the caller explicitly allows it) --
  // The API requires the field to be present; an empty string is accepted so a
  // project without a screenshot is still valid and the card renders a
  // placeholder. A non-empty value must be a usable URL.
  if (body.image === undefined && !partial) {
    errors.push({
      field: 'image',
      message: 'Image URL is required (send an empty string if there is no image).',
    });
  } else if (body.image !== undefined) {
    const image = body.image === null ? '' : String(body.image).trim();
    if (image.length > LIMITS.image) {
      errors.push({ field: 'image', message: `Image URL must be ${LIMITS.image} characters or fewer.` });
    } else if (image && !isUsableUrl(image)) {
      errors.push({
        field: 'image',
        message: 'Image must be an absolute http(s) URL or a path starting with "/".',
      });
    } else {
      value.image = image;
    }
  }

  // ---- link (same rules as image) --------------------------------------
  if (body.link === undefined && !partial) {
    errors.push({
      field: 'link',
      message: 'Project URL is required (send an empty string if there is no link yet).',
    });
  } else if (body.link !== undefined) {
    const link = body.link === null ? '' : String(body.link).trim();
    if (link.length > LIMITS.link) {
      errors.push({ field: 'link', message: `Project URL must be ${LIMITS.link} characters or fewer.` });
    } else if (link && !isUsableUrl(link)) {
      errors.push({
        field: 'link',
        message: 'Project URL must be an absolute http(s) URL or a path starting with "/".',
      });
    } else {
      value.link = link;
    }
  }

  // ---- imagePublicId (optional) ----------------------------------------
  // Identifies an image uploaded through the admin dashboard so it can be
  // cleaned up later. Never typed by hand: the upload endpoint returns it
  // alongside the URL. Externally hosted images leave this empty, which is
  // exactly what stops us from deleting an asset we did not create.
  if (body.imagePublicId !== undefined && body.imagePublicId !== null) {
    const publicId = String(body.imagePublicId).trim();
    if (publicId.length > LIMITS.imagePublicId) {
      errors.push({
        field: 'imagePublicId',
        message: `Image identifier must be ${LIMITS.imagePublicId} characters or fewer.`,
      });
    } else if (publicId && !/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(publicId)) {
      errors.push({
        field: 'imagePublicId',
        message: 'Image identifier contains unsupported characters.',
      });
    } else {
      value.imagePublicId = publicId;
    }
  } else if (!partial) {
    value.imagePublicId = '';
  }

  return { value, errors };
}

/** Contact form validation. */
export function validateContactPayload(body) {
  const errors = [];
  const value = {};

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { value, errors: [{ field: 'body', message: 'A JSON object is required.' }] };
  }

  const name = String(body.name ?? '').trim();
  if (!name) errors.push({ field: 'name', message: 'Your name is required.' });
  else if (name.length > 120) errors.push({ field: 'name', message: 'Name must be 120 characters or fewer.' });
  else value.name = name;

  const email = String(body.email ?? '').trim();
  // Intentionally permissive: enough to catch typos without rejecting valid addresses.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email) errors.push({ field: 'email', message: 'Your email address is required.' });
  else if (email.length > 254) errors.push({ field: 'email', message: 'Email must be 254 characters or fewer.' });
  else if (!emailPattern.test(email)) errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  else value.email = email;

  const subject = String(body.subject ?? '').trim();
  if (subject) {
    if (subject.length > 200) errors.push({ field: 'subject', message: 'Subject must be 200 characters or fewer.' });
    else value.subject = subject;
  } else {
    value.subject = null;
  }

  const message = String(body.message ?? '').trim();
  if (!message) errors.push({ field: 'message', message: 'A message is required.' });
  else if (message.length < 10) errors.push({ field: 'message', message: 'Message must be at least 10 characters.' });
  else if (message.length > 5000) errors.push({ field: 'message', message: 'Message must be 5000 characters or fewer.' });
  else value.message = message;

  return { value, errors };
}

/** Route params must be positive integers; anything else is a 400, not a 500. */
export function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
