const {
    createSuccessResponse,
    createErrorResponse,
} = require('../utils/response')

const { Token, sequelize } = require('../db')
const { tokenFlags } = require('../db/models/token')
const { UserFlags } = require('../db/models/user')
const { isFlagSet } = require('../utils/flags')

// 2 types of tokens:

// some tokens will use the data associated with the token and update a value in the database.
// i.e the USER_EMAIL_VERIFY_TOKEN will update the user's email to the one associated with the token

// other tokens will require data at the time of verification, such as the password reset token
// i.e the USER_PASSWORD_RESET_TOKEN will require a new password to be sent in the body.data field of the request

module.exports = async (req, res) => {
    try {
        const { token } = req.query
        const data = req.body.data

        if (!token || token.length < 1) {
            return res.status(400).json(createErrorResponse('Missing token'))
        }

        const tokenInstance = await Token.findOne({
            where: {
                token: token,
            },
        })

        if (!tokenInstance || tokenInstance.expiresAt < Date.now()) {
            return res.status(400).json(createErrorResponse('Invalid token'))
        }

        const user = await tokenInstance.getUser()
        if (!user) {
            return res.status(400).json(createErrorResponse('Invalid token'))
        }

        // we use getDataValue to get the raw value of the flags column since we don't want to use the getter that converts it to an object
        const type = tokenInstance.getDataValue('flags')
        if (isFlagSet(type, tokenFlags.USER_EMAIL_VERIFY_TOKEN)) {
            await sequelize.transaction(async (t) => {
                await user.update(
                    {
                        email: tokenInstance.data,
                        flags: user.flags | UserFlags.VERIFIED_EMAIL, // Adds the VERIFIED_EMAIL flag to the user's flags
                    },
                    { transaction: t }
                )
                await tokenInstance.destroy({ transaction: t })
            })
            return res.send(
                createSuccessResponse(
                    'Email verified and set to ' + tokenInstance.data
                )
            )
        } else if (isFlagSet(type, tokenFlags.USER_PHONE_VERIFY_TOKEN)) {
            await sequelize.transaction(async (t) => {
                const object = JSON.parse(tokenInstance.data)
                if (!object || !object.phoneCountry || !object.phoneNumber) {
                    return res
                        .status(400)
                        .json(
                            createErrorResponse(
                                'This token requires a phone number in the format { phoneCountry: "1", phoneNumber: "1234567890" }'
                            )
                        )
                }
                await user.update(
                    {
                        phoneCountry: object.phoneCountry,
                        phoneNumber: object.phoneNumber,
                        flags: user.flags | UserFlags.VERIFIED_PHONE, // Adds the VERIFIED_PHONE flag to the user's flags
                    },
                    { transaction: t }
                )
                await tokenInstance.destroy({ transaction: t })
            })
            return res.send(createSuccessResponse('Phone verified and updated'))
        } else if (isFlagSet(type, tokenFlags.USER_PASSWORD_RESET_TOKEN)) {
            await sequelize.transaction(async (t) => {
                if (!data || data.length < 1) {
                    return res
                        .status(400)
                        .json(
                            createErrorResponse(
                                'This token requires a new password to be passed in the { data: "new password" } body'
                            )
                        )
                }

                await user.update({ password: data }, { transaction: t })
                await tokenInstance.destroy({ transaction: t })

                return res.send(
                    createSuccessResponse('Password reset successfully')
                )
            })
        } else {
            // Ambiguous error message to prevent token guessing
            return res
                .status(400)
                .json(createErrorResponse('This token is invalid or expired'))
        }
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
