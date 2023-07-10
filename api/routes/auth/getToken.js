const { signJWT } = require('../../utils')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')
const { User } = require('../../db')

module.exports = async (req, res) => {
    try {
        const refreshToken = req.query.refreshToken || req.body.refreshToken
        if (!refreshToken || refreshToken.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing refresh token'))
        }

        const user = await User.findOne({
            where: {
                refreshToken: refreshToken,
            },
            attributes: [
                'id',
                'username',
                'email',
                'name',
                'avatarUrl',
                'createdAt',
                'updatedAt',
            ],
        })
        if (!user)
            return res.status(400).json(createErrorResponse('User not found'))

        const token = await signJWT(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            process.env.JWT_SECRET
        )

        return res.json(createSuccessResponse({ token }))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
