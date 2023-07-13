const jwt = require('jsonwebtoken')
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
        // add a fake auth object to the request to indicate that the user is authenticated in development mode
        req.auth = {
            id: process.env.DEV_USER_UUID,
            username: process.env.DEV_USER_USERNAME,
        }

        return next()
    }
} else {
    module.exports = function (req, res, next) {
        let token =
            req.headers['authorization'] ||
            req.body.token ||
            req.query.token ||
            req.headers['x-access-token']

        if (!token) {
            return res
                .status(403)
                .send(
                    createErrorResponse(
                        'Access token is missing - Use Authorization header or token in body or query'
                    )
                )
        }
        try {
            token = token.replace('Bearer ', '')
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                {},
                function (err, decoded) {
                    if (err) {
                        return res
                            .status(401)
                            .send(
                                createErrorResponse('Access token is invalid')
                            )
                    }
                    req.auth = decoded

                    if (req.auth.flags['NA_BANNED'] === true) {
                        return res
                            .status(403)
                            .send(
                                createErrorResponse(
                                    'You are banned from this service.'
                                )
                            )
                    }

                    return next()
                }
            )
        } catch (err) {
            return res.status(401).send(createErrorResponse(err.message, err))
        }
    }
}
