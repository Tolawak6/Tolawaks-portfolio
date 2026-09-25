import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/http.js';
import { validateContactPayload } from '../validators/project.validator.js';
import { createMessage } from '../services/contact.service.js';

export const contactRouter = Router();

/**
 * Keeps the endpoint from being used as an open spam relay.
 *
 * The allowance is deliberately small in production and generous in
 * development, so the limit is always active and testable without locking you
 * out of your own contact form while working on it.
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.isProduction ? 5 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many messages sent from this address. Please try again later.',
      status: 429,
    },
  },
});

/**
 * POST /api/contact
 * Stores a contact form submission. The raw error is never returned to the
 * caller - see middleware/errorHandler.js.
 */
contactRouter.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { value, errors } = validateContactPayload(req.body);

    if (errors.length > 0) {
      return res.status(422).json({
        error: {
          message: 'Please check the highlighted fields and try again.',
          status: 422,
          details: errors,
        },
      });
    }

    await createMessage(value);
    return res.status(201).json({
      data: { message: 'Thanks - your message has been received.' },
    });
  }),
);
