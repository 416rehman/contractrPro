import { ErrorCode } from './errorCodes';

export const createSuccessResponse = (data: any) => {
    return {
        status: 'success',
        data,
    };
};

// only accepts typed ErrorCode, no strings allowed
export const createErrorResponse = (code: ErrorCode, err?: any) => {
    return {
        status: 'error',
        code,
        details: err?.message || null,
    };
};

