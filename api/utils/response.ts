import { ErrorCode } from './errorCodes'

export const createSuccessResponse = (data: any) => {
    return {
        status: 'success',
        data,
    }
}

// only accepts typed ErrorCode, no strings allowed
// details can be a string message from an Error, or a structured object (like zod field errors)
export const createErrorResponse = (code: ErrorCode, details?: any) => {
    return {
        status: 'error',
        code,
        details: details?.message || details || null,
    }
}
