const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { User, Token, sequelize } = require('../../../db')
const { tokenFlags } = require('../../../db/models/token')

// When the body includes an email, it creates a new token with the USER_EMAIL_VERIFY_TOKEN flag and sends it to the user's email
module.exports = async (req, res) => {
    try {
        const { email } = req.body
        const UserId = req.auth.id

        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse('Missing email'))
        }

        /**
         * Create a new token and send it to the user's email
         */
        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse('Missing email'))
        }

        const user = await User.findOne({ where: { id: UserId } })
        if (!user) {
            return res.status(400).json(createErrorResponse('User not found'))
        }

        // if the user's email is the same as the email in the request body, don't do anything
        if (user.email === email) {
            return res
                .status(400)
                .json(createErrorResponse('Email already in use'))
        }

        await sequelize.transaction(async (transaction) => {
            const body = Token.emailVerifyTokenTemplate(UserId, email)
            const preExistingToken = await Token.findOne({
                where: {
                    UserId: user.id,
                    flags: tokenFlags.USER_PASSWORD_RESET_TOKEN,
                },
                transaction,
            })
            if (preExistingToken) {
                await preExistingToken.update(body, { transaction })
            } else {
                await Token.create(body, { transaction })
            }
            return res.json(
                createSuccessResponse(
                    'An email with further instructions has been sent to the provided email address'
                )
            )
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}