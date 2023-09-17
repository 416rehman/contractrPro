const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Get an organization's vendor by ID
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const vendorId = req.params.vendor_id

        if (!vendorId) throw new Error('Vendor ID is required')

        const vendor = await prisma.vendor.findUnique({
            where: {
                id: vendorId,
                organizationId: orgId,
            },
        })

        if (!vendor) throw new Error('Vendor not found')

        return res.status(200).json(createSuccessResponse(vendor))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}