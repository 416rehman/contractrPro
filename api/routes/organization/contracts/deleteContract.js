const { sequelize, Contract } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const rowsDeleted = await Contract.destroy({
                where: {
                    OrganizationId: orgId,
                    id: contractId,
                },
                transaction,
            })

            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('Contract not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
