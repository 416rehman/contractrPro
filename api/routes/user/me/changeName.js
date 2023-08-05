const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { User, sequelize } = require('../../../db')

// Update the user's name
module.exports = async (req, res) => {
    try {
        const name = req.body?.name?.trim()
        const UserId = req.auth.id

        if (!name || name.length < 1) {
            return res.status(400).json(createErrorResponse('Missing name'))
        }

        await sequelize.transaction(async (transaction) => {
            const updatedUser = await User.update(
                { name },
                { where: { id: UserId }, transaction, returning: true }
            )

            return res.json(createSuccessResponse(updatedUser[1][0]))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
