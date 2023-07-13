const { User, sequelize } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
module.exports = async (req, res) => {
    const { userIds, column, value } = req.body

    if (!userIds || userIds.length < 1) {
        return res
            .status(400)
            .json(
                createErrorResponse(
                    'Missing user IDs. It should be an array of user IDs.'
                )
            )
    }

    if (!column || column.length < 1) {
        return res.status(400).json(createErrorResponse('Missing column name.'))
    }

    if (!value || value.length < 1) {
        return res.status(400).json(createErrorResponse('Missing value.'))
    }

    try {
        await sequelize.transaction(async (t) => {
            // Update the user's column with the new value where the user ID is in the array of user IDs
            await User.update(
                {
                    [column]: value,
                },
                {
                    where: {
                        id: userIds,
                    },
                    transaction: t,
                }
            )
        })
        return res.json(createSuccessResponse('Users updated successfully'))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
