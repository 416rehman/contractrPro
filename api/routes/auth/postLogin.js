const auth_service = require('../../utils/authHelpers')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

/**
 * @api {post} /auth/login Gets the user's opaque refresh token
 * @apiName Login
 */
module.exports = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = await auth_service.authenticate(username, email, password)
        res.json(createSuccessResponse({ refreshToken: user.refreshToken }))
    } catch (error) {
        res.status(400).json(createErrorResponse(error.message))
    }
}
