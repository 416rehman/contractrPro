const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

const { tokenFlags } = require('../../../db/models/token')
const prisma = require('../../prisma')
const { z } = require('zod')
const { passwordResetTokenTemplate } = require('../../utils/token')

const schema = z.object({
    // email can either be email or username
    email: z.string().max(255, { message: 'The email or username is too long. Max 255 characters.' }),
})

// Creates a new token with the USER_PASSWORD_RESET_TOKEN flag and sends it to the user's email
module.exports = async (req, res) => {
    try {
        const { email } = schema.parse(req.body)

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (user) {
            // if the user already has a token
            const token = await prisma.token.findFirst({
                where: {
                    UserId: user.id,
                    flags: tokenFlags.USER_PASSWORD_RESET_TOKEN,
                },
            })

            // generate a token for user
            const data = passwordResetTokenTemplate(user.id)

            if (token) {
                // if the user already has a token, update it
                await prisma.token.update({
                    where: {
                        id: token.id,
                    },
                    data,
                })
            } else {
                // if the user does not have a token, create it from the generated data
                await prisma.token.create({
                    data,
                })
            }

            // Send email TODO
        }

        // Ambiguous response to prevent email enumeration
        return res.json(createSuccessResponse('If the email exists, a password reset token has been sent to it.'))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
