const { sequelize, Contract } = require('../../../db')
const { isValidUUID } = require('../../../utils/isvalidUUID')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's contract by ID
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        } else if (!contractID || !isValidUUID(contractID)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const organizationContract = await Contract.findOne({
                attributes: {
                    exclude: ['organization_id'],
                },
                where: {
                    id: contractID,
                    OrganizationId: orgID,
                },
                transaction,
            })

            if (!organizationContract) {
                return res.status(400).json(createErrorResponse('Not found'))
            }

            return res
                .status(200)
                .json(createSuccessResponse(organizationContract))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message))
    }
}
