const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const { User, sequelize } = require('../../db')
const bcrypt = require('bcrypt')
const { generateRefreshToken, pick } = require('../../utils')
module.exports = async (req, res) => {
    const body = pick(req.body, [
        'username',
        'password',
        'email',
        'name',
        'phone',
        'avatarUrl',
    ])

    try {
        const hash = bcrypt.hashSync(body.password, 10)
        const refreshToken = await generateRefreshToken()

        await sequelize.transaction(async (transaction) => {
            const user = User.build({
                ...body,
                password: hash,
                refreshToken: refreshToken,
            })
            user.UpdatedByUserId = user.id

            const savedUser = await user.save({
                transaction,
            })
            delete savedUser.dataValues.password // remove password from response

            return res.status(201).json(createSuccessResponse(user))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
