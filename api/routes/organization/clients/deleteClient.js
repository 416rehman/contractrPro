const { Client, sequelize } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Delete organization client
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!clientId || !isValidUUID(clientId)) {
            return res
                .status(400)
                .json(createErrorResponse('Client ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const rowsDeleted = await Client.destroy({
                where: {
                    OrganizationId: orgId,
                    id: clientId,
                },
                transaction,
            })
            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('Client not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse(error.message))
    }
}
