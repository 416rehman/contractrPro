const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const bcrypt = require('bcrypt')
const { pick } = require('../../utils')
const prisma = require('../../prisma')
const { z } = require('zod')

const schema = z.object({
    // either username or email, but not both and not none
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(8).max(100),
}).refine(data => {
    return !(!data.username && !data.email);
}, {
    message: 'Either username or email must be provided',
})

/**
 * @api {post} /auth/login Gets the user's refresh token
 * @apiName Login
 */
module.exports = async (req, res) => {
    try {
        const data = schema.parse(req.body)
        if (!data.password) {
            return res.status(400).json(createErrorResponse('Missing password'))
        }

        const where = {}
        if (data.username) {
            where.username = data.username
        } else if (data.email) {
            where.email = data.email
        } else {
            return res.status(400).json(createErrorResponse('Missing username or email'))
        }

        const user = await prisma.user.findUnique({
            where,
        })
        if (!user) {
            return res.status(400).json(createErrorResponse('The user does not exist'))
        }

        const isValidPass = await bcrypt.compareSync(
            data.password,
            user.password,
        )
        if (!isValidPass) {
            return res.status(400).json(createErrorResponse('Invalid password'))
        }

        return res.json(
            createSuccessResponse({
                refreshToken: user.refreshToken,
                message:
                    'Use this refresh token at the /auth/token endpoint to get an access token and set the cookie.',
            }),
        )
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
