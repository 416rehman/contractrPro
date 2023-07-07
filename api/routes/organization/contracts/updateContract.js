//*******************************************TODO******************* */
//PUT /organizations/:org_id/contracts/:contract_id
const { sequelize, Contract } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'))
        }

        const body = {
            ...pick(req.body, [
                'name',
                'description',
                'startDate',
                'dueDate',
                'completionDate',
                'status',
            ]),
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
        }

        await sequelize.transaction(async (transaction) => {
            const queryResult = await Contract.update(body, {
                where: {
                    OrganizationId: orgId,
                    id: contractId,
                },
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Contract not found')
            }

            const updatedContract = queryResult[1][0]
            return res.status(200).json(createSuccessResponse(updatedContract))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
