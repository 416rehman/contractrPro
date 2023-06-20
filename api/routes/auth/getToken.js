const auth_service = require('../../utils/authHelpers')
const { signJWT } = require('../../utils/utils')
const { createErrorResponse, createSuccessResponse } = require('../../utils/response')

module.exports = (req, res) => {
    if (!req.query.refreshToken && !req.body.refreshToken)
        res.status(400).json(createErrorResponse('Missing refresh token'))
    else {
        auth_service
            .verifyRefreshToken(req.query.refreshToken || req.body.refreshToken)
            .then((user) => {
                signJWT(
                    { id: user.id, username: user.username },
                    process.env.JWT_SECRET
                )
                    .then((token) => res.json(createSuccessResponse({ token })))
                    .catch((err) => res.status(500).json(createErrorResponse(err.message)))
            })
            .catch((err) => {
                res.status(400).json(createErrorResponse(err.message))
            })
    }
}
