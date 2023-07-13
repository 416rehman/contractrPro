const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { User, Token, sequelize } = require('../../../db')
const { tokenFlags } = require('../../../db/models/token')

// When the body includes a phone, it creates a new token with the USER_PHONE_VERIFY_TOKEN flag and sends it to the user's phone
module.exports = async (req, res) => {
    try {
        const { phone } = req.body
        const UserId = req.auth.id

        if (!phone || phone.length < 1) {
            return res.status(400).json(createErrorResponse('Missing phone'))
        }

        /**
         * Create a new token and send it to the user's phone
         */
        if (!phone || phone.length < 1) {
            return res.status(400).json(createErrorResponse('Missing phone'))
        }

        const user = await User.findOne({ where: { id: UserId } })
        if (!user) {
            return res.status(400).json(createErrorResponse('User not found'))
        }

        // if the user's phone is the same as the phone in the request body, don't do anything
        if (user.phone === phone) {
            return res
                .status(400)
                .json(createErrorResponse('Phone already in use'))
        }

        await sequelize.transaction(async (transaction) => {
            const body = Token.phoneVerifyTokenTemplate(UserId, phone)
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
                    'A text message with further instructions has been sent to the provided phone number'
                )
            )
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}