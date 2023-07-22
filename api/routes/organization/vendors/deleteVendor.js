const { Vendor, sequelize } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Deletes an organization's vendor by ID
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
            const rowsDeleted = await Vendor.destroy({
                where: {
                    OrganizationId: orgId,
                    id: vendorId,
                },
                transaction,
            })
            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('Vendor not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
