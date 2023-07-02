const { signJWT } = require('../../utils')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')
const { User } = require('../../db')

module.exports = async (req, res) => {
    try {
        if (!req.query.refreshToken && !req.body.refreshToken) {
            return res
                .status(400)
                .json(createErrorResponse('Missing refresh token'))
        }

        const user = await User.findOne({
            where: {
                refreshToken: req.query.refreshToken || req.body.refreshToken,
            },
        })
        if (!user)
            return res.status(400).json(createErrorResponse('User not found'))

        const token = await signJWT(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET
        )

        return res.json(createSuccessResponse({ token }))
    } catch (error) {
        return res.status(400).json(createErrorResponse(error.message))
    }
}
