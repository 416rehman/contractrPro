const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

const { User, Token, sequelize } = require('../../db')
const { tokenFlags } = require('../../db/models/token')

// Creates a new token with the USER_PASSWORD_RESET_TOKEN flag and sends it to the user's email
module.exports = async (req, res) => {
    try {
        const { email } = req.body
        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse('Missing email'))
        }

        await sequelize.transaction(async (transaction) => {
            const user = await User.findOne({
                where: {
                    email: email,
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
                transaction,
            })

            if (user) {
                // if the user already has a token, update it
                const token = await Token.findOne({
                    where: {
                        UserId: user.id,
                        flags: tokenFlags.USER_PASSWORD_RESET_TOKEN,
                    },
                    transaction,
                })

                const body = Token.passwordResetTokenTemplate(user.id)
                // Send email TODO
                console.log(body)

                if (token) {
                    await token.update(body, { transaction, returning: true })
                } else {
                    await Token.create(body, { transaction })
                }
            }

            // Ambiguous response to prevent email enumeration
            return res.json(
                createSuccessResponse(
                    'If the email exists, a password reset token has been sent to it.'
                )
            )
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}