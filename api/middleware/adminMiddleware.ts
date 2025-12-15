import { createErrorResponse } from '../utils/response';

const devAdmin = function (req: any, res: any, next: any) {
    // pretend the user is admin in development mode, no need to do anything
    return next();
};

const prodAdmin = function (req: any, res: any, next: any) {
    if (req.auth && req.auth.flags && req.auth.flags['ROLE_ADMIN'] === true) {
        return next();
    }

    // Ambiguous error message to prevent leaking information
    return res
        .status(403)
        .send(createErrorResponse('Access token is missing or invalid'));
};

let adminMiddleware: any;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    adminMiddleware = devAdmin;
} else {
    adminMiddleware = prodAdmin;
}

export default adminMiddleware;
