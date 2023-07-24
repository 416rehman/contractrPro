const { sequelize, Contract } = require('../../../db')
const { isValidUUID } = require('../../../utils/isValidUUID')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's contracts
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const organizationContracts = await Contract.findAll({
                attributes: {
                    exclude: ['organization_id'],
                },
                where: {
                    OrganizationId: orgID,
                },
                transaction,
            })

            return res
                .status(200)
                .json(createSuccessResponse(organizationContracts))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse('', error))
    }
}