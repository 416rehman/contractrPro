import rateLimit from 'express-rate-limit'
import { createErrorResponse } from '../utils/response'
import { ErrorCode } from '../utils/errorCodes'

const handler = (req: any, res: any, next: any, options: any) => {
    res.status(options.statusCode).json(
        createErrorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, {
            message: options.message,
            retryAfter: Math.ceil(options.windowMs / 1000),
        })
    )
}

// strict limit for authentication endpoints (bruteforce protection)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler,
    message: 'Too many login attempts, please try again later.',
})

// moderate limit for token refresh
export const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler,
    message: 'Too many token refresh attempts, please try again later.',
})

// general limit for public/unauthenticated routes
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler,
    message: 'Too many requests, please try again later.',
})

// higher limit for authenticated api calls
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler,
    message: 'Too many requests, please slow down.',
})

// tight limit for webhook endpoints to prevent abuse
export const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler,
    message: 'Too many webhook requests.',
})
