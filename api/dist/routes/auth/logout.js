"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logout;
// Clears the cookie if it exists
const response_1 = require("../../utils/response");
function logout(req, res) {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json((0, response_1.createSuccessResponse)('Logged out'));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
}
