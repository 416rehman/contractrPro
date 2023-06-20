const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const {User} = require("../../db");
const {Op} = require("sequelize");
const bcrypt = require("bcrypt");
const {pick} = require("../../utils");

/**
 * @api {post} /auth/login Gets the user's opaque refresh token
 * @apiName Login
 */
module.exports = async (req, res) => {
    try {
        const body = pick(req.body, ['username', 'email', 'password'])

        const user = await User.findOne({
            where: {
                [Op.or]: [  // can login with username or email
                    {username: body.username || null},
                    {email: body.email || null},
                ],
            },
        })
        if (!user) return res.status(400).json(createErrorResponse('User not found'))

        const isValidPass = await bcrypt.compareSync(body.password, user.password)
        if (!isValidPass) {
            return res.status(400).json(createErrorResponse('Invalid password'))
        }

        return res.json(createSuccessResponse({refreshToken: user.refreshToken}))
    } catch (error) {
        return res.status(400).json(createErrorResponse(error.message))
    }
}
