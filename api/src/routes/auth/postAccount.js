const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const prisma = require('../../prisma')
const { generateRefreshToken } = require('../../utils')
const { hashSync } = require('bcrypt')
const { zAccount } = require('../../validators/account.zod')

module.exports = async (req, res) => {
    try {
        const data = zAccount.parse(req.body)

        if (!data.username) {
            return res.status(400).json(createErrorResponse('Username is required'))
        }
        if (!data.password || data.password.length < 6) {
            return res
                .status(400)
                .json(createErrorResponse('Password must be at least 6 characters'))
        }
        if (!data.email) {
            return res.status(400).json(createErrorResponse('Email is required'))
        }

        // Hash the password and generate a new refresh token
        data.password = hashSync(data.password, 10)
        data.refreshToken = generateRefreshToken()


        const user = await prisma.user.create({
            data,
        })

        // omit password
        delete user.password

        return res.status(201).json(createSuccessResponse(user))
    } catch (err) {
        console.log(err)
        return res.status(400).json(createErrorResponse('', err))
    }
}
