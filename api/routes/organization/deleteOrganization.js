const { Organization, sequelize } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const { isValidUUID } = require('../../utils/isValidUUID')

module.exports = async (req, res) => {
    try {
        const org_id = req.params.org_id
        if (!org_id || !isValidUUID(org_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const rowsDeleted = await Organization.destroy({
                where: {
                    id: org_id,
                },
                transaction,
            })
            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('Organization not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(error.message))
    }
}
