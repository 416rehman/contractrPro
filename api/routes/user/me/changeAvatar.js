const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { User, sequelize } = require('../../../db')

// Update the user's avatarUrl
module.exports = async (req, res) => {
    try {
        const avatarUrl = req.body?.avatarUrl?.trim()
        const UserId = req.auth.id

        if (!avatarUrl || avatarUrl.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing avatarUrl'))
        }

        // no blobs / base64 strings allowed
        if (avatarUrl.startsWith('data:')) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid avatarUrl'))
        }

        await sequelize.transaction(async (transaction) => {
            const updatedUser = await User.update(
                { avatarUrl },
                { where: { id: UserId }, transaction, returning: true }
            )

            return res.json(createSuccessResponse(updatedUser[1][0]))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}