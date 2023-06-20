const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

const { User, sequelize } = require('../../db')
module.exports = async (req, res) => {
    try {
        await sequelize.transaction(async (transaction) => {
            const rowsDeleted = await User.destroy({
                where: { username: req.auth.username },
                transaction,
            })
            if (rowsDeleted === 0) {
                return res
                    .status(400)
                    .json(createErrorResponse('User not found'))
            }

            return res.json(createSuccessResponse({}))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(error.message))
    }
}
