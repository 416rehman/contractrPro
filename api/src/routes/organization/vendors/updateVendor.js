const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const prisma = require('../../../prisma')
const { zVendor } = require('../../../validators/vendor.zod')

// Updates an organization's vendor by ID
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const vendorId = req.params.vendor_id

        if (!vendorId) throw new Error('Vendor ID is required')
        const data = zVendor.partial().parse(req.body)
        const include = {}
        if (req.body.Address) {
            data.Address = {
                update: req.body.Address,
            }
            include.Address = true
        }

        data.organizationId = orgId
        data.updatedByUserId = req.auth.id

        const vendor = await prisma.vendor.update({
            where: {
                id: vendorId,
                organizationId: orgId,
            },
            data,
            include,
        })
        return res.status(200).json(createSuccessResponse(vendor))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}