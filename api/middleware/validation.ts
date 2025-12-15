import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createErrorResponse } from '../utils/response';
import { ErrorCode } from '../utils/errorCodes';

export const validate = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(
                createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED, {
                    issues: error.issues.map(e => ({
                        path: e.path.join('.'),
                        code: e.code,
                        message: e.message
                    }))
                })
            );
        }
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR));
    }
};
