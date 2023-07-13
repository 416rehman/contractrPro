// Clears the cookie if it exists
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
module.exports = function logout(req, res) {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.status(200).json(createSuccessResponse('Logged out'))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}