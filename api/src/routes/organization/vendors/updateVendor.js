const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils')
const { sequelize, Vendor } = require('../../../../db')

// Updates an organization's vendor by ID
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
        const body = {
            ...pick(req.body, [
                'name',
                'phone',
                'email',
                'website',
                'description',
            ]),
            OrganizationId: orgId,
            UpdatedByUserId: req.auth.id,
        }
        await sequelize.transaction(async (transaction) => {
            const queryResult = await Vendor.update(body, {
                where: {
                    OrganizationId: orgId,
                    id: vendorId,
                },
                transaction,
                returning: true,
            })
            if (!queryResult[0]) {
                throw new Error('Vendor not found')
            }

            //queryResult returns:
            // [
            //     <number of rows updated>,
            //     [<array of updated rows>]
            // ]
            const updatedVendor = queryResult[1][0]

            return res.status(200).json(createSuccessResponse(updatedVendor))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
