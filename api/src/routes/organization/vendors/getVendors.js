const { sequelize, Vendor } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Gets all of the organization's vendors
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const vendors = await Vendor.findAll({
                where: {
                    OrganizationId: orgId,
                },
                transaction,
            })

            return res.status(200).json(createSuccessResponse(vendors))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
