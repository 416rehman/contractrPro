"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const devAdmin = function (req, res, next) {
    // pretend the user is admin in development mode, no need to do anything
    return next();
};
const prodAdmin = function (req, res, next) {
    if (req.auth && req.auth.flags && req.auth.flags['ROLE_ADMIN'] === true) {
        return next();
    }
    // Ambiguous error message to prevent leaking information
    return res
        .status(403)
        .send((0, response_1.createErrorResponse)('Access token is missing or invalid'));
};
let adminMiddleware;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    adminMiddleware = devAdmin;
}
else {
    adminMiddleware = prodAdmin;
}
exports.default = adminMiddleware;
