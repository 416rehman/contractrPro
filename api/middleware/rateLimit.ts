import rateLimit from 'express-rate-limit';
import { createErrorResponse } from '../utils/response';
import { ErrorCode } from '../utils/errorCodes';

// Standard error response for rate limits
const handler = (req: any, res: any, next: any, options: any) => {
    res.status(options.statusCode).json(
        createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED, { // Using UNAUTHORIZED or generic error, maybe need specific RATE_LIMIT code
            message: options.message
        })
    );
};

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: handler,
    message: "Too many login attempts, please try again later."
});

export const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: handler,
    message: "Too many token refresh attempts, please try again later."
});

export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: handler,
    message: "Too many requests, please try again later."
});
