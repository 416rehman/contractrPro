import { createErrorResponse } from '../utils/response';
import { ErrorCode } from '../utils/errorCodes';

const devAdmin = function (req: any, res: any, next: any) {
    // pretend user is admin in dev
    return next();
};

const prodAdmin = function (req: any, res: any, next: any) {
    if (req.auth && req.auth.flags && req.auth.flags['ROLE_ADMIN'] === true) {
        return next();
    }

    // ambiguous error to prevent info leak
    return res
        .status(403)
        .send(createErrorResponse(ErrorCode.AUTH_ACCESS_TOKEN_INVALID));
};

let adminMiddleware: any;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    adminMiddleware = devAdmin;
} else {
    adminMiddleware = prodAdmin;
}

export default adminMiddleware;

