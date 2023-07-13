const { createErrorResponse } = require('../utils/response')

/**
 * Checks the token and if it is valid, sets the auth field on the request object.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // default export
    module.exports = function (req, res, next) {
        // pretend the user is admin in development mode, no need to do anything
        return next()
    }
} else {
    module.exports = function (req, res, next) {
        if (req.auth && req.auth.flags['ROLE_ADMIN'] === true) {
            return next()
        }

        // Ambiguous error message to prevent leaking information
        return res
            .status(403)
            .send(createErrorResponse('Access token is missing or invalid'))
    }
}