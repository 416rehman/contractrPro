const { sequelize, Vendor } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Get an organization's vendor by ID
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const vendorId = req.params.vendor_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!vendorId || !isValidUUID(vendorId)) {
            return res
                .status(400)
                .json(createErrorResponse('Vendor ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const vendor = await Vendor.findOne({
                where: {
                    OrganizationId: orgId,
                    id: vendorId,
                },
                transaction,
            })

            if (!vendor) {
                return res
                    .status(400)
                    .json(createErrorResponse('Vendor not found'))
            }

            return res.status(200).json(createSuccessResponse(vendor))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
