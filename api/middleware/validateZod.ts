import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { createErrorResponse } from '../utils/response'
import { ErrorCode } from '../utils/errorCodes'

type ValidationTarget = 'body' | 'params' | 'query'

interface ValidateOptions {
    body?: z.ZodSchema
    params?: z.ZodSchema
    query?: z.ZodSchema
}

// validates request body, params, and query against zod schemas
// replaces express-validator with a single declarative middleware
export const validateRequest = (schemas: ValidateOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const targets: ValidationTarget[] = ['body', 'params', 'query']

        for (const target of targets) {
            const schema = schemas[target]
            if (!schema) continue

            const result = schema.safeParse(req[target])
            if (!result.success) {
                const fieldErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }))

                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            ErrorCode.VALIDATION_INVALID_VALUE,
                            { fields: fieldErrors }
                        )
                    )
            }

            // replace with parsed (coerced/transformed) values
            ;(req as any)[target] = result.data
        }

        next()
    }
}

// common zod schemas used across routes
export const zodUuid = z.string().uuid()

export const zodPaginationQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
})

export const zodOrgParams = z.object({
    org_id: zodUuid,
})

export const zodResourceParams = z.object({
    org_id: zodUuid,
    id: zodUuid,
})
