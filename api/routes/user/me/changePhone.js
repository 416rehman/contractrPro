const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { User, Token, sequelize } = require('../../../db')
const { tokenFlags } = require('../../../db/models/token')

// When the body includes a phone, it creates a new token with the USER_PHONE_VERIFY_TOKEN flag and sends it to the user's phone
module.exports = async (req, res) => {
    try {
        const phoneCountry = req.body?.phoneCountry?.trim()
        const phoneNumber = req.body?.phoneNumber?.trim()

        const UserId = req.auth.id

        if (!phoneCountry || phoneCountry.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing phoneCountry'))
        }

        if (!phoneNumber || phoneNumber.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing phoneNumber'))
        }

        // Make sure the phoneCountry is digits only and not more than 5 digits
        if (!/^\d+$/.test(phoneCountry) || phoneCountry.length > 5) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid phoneCountry'))
        }

        // Make sure the phoneNumber is digits only and not more than 20 digits
        if (!/^\d+$/.test(phoneNumber) || phoneNumber.length > 20) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid phoneNumber'))
        }

        const user = await User.findOne({ where: { id: UserId } })
        if (!user) {
            return res.status(400).json(createErrorResponse('User not found'))
        }

        // if the user's phone is the same as the phone in the request body, don't do anything
        if (
            user.phoneCountry === phoneCountry &&
            user.phoneNumber === phoneNumber
        ) {
            return res
                .status(200)
                .json(createErrorResponse('Phone already in use'))
        }

        await sequelize.transaction(async (transaction) => {
            const body = Token.phoneVerifyTokenTemplate(
                UserId,
                phoneCountry,
                phoneNumber
            )
            const preExistingToken = await Token.findOne({
                where: {
                    UserId: user.id,
                    flags: tokenFlags.USER_PHONE_VERIFY_TOKEN,
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