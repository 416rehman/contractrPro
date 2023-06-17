const auth_service = require('../../utils/authHelpers')

/**
 * @api {post} /auth/login Gets the user's opaque refresh token
 * @apiName Login
 */
module.exports = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = await auth_service.authenticate(username, email, password)
        res.json({
            refreshToken: user.refreshToken,
        })
    } catch (error) {
        res.status(401).json({
            error: error.message,
        })
    }
}
