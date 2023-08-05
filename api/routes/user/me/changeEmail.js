const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { User, Token, sequelize } = require('../../../db')
const { tokenFlags } = require('../../../db/models/token')

// When the body includes an email, it creates a new token with the USER_EMAIL_VERIFY_TOKEN flag and sends it to the user's email
module.exports = async (req, res) => {
    try {
        const email = req.body?.email?.trim()
        const UserId = req.auth.id

        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse('Missing email'))
        }

        // validate email
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json(createErrorResponse('Invalid email'))
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
                    flags: tokenFlags.USER_EMAIL_VERIFY_TOKEN,
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
    } catch (err) {
        console.error(err)
        return res.status(500).json(createErrorResponse())
    }
}
