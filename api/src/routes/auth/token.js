const { signJWT } = require('../../utils')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')
const prisma = require('../../prisma')
const { z } = require('zod')

const schema = z.object({
    refreshToken: z.string().min(1, { message: 'Missing refresh token' }),
})

module.exports = async (req, res) => {
    try {
        const { refreshToken } = schema.parse(req.body)

        const user = await prisma.user.findUnique({
            where: {
                refreshToken: refreshToken,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                flags: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!user) {
            return res.status(400).json(createErrorResponse('User not found'))
        }


        const token = await signJWT(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                flags: user.flags,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            process.env.JWT_SECRET,
        )

        return res
            .status(200)
            .cookie('accessToken', token, {
                httpOnly: false,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: false,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
            .json(createSuccessResponse({ token }))
    } catch (error) {
        console.error(error)
        return res.status(400).json(createErrorResponse('', error))
    }
}
