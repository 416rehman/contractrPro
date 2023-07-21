const { Vendor, sequelize } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Creates an organization's vendor
module.exports = async (req, res) => {
    try {

        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
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
            const vendor = await Vendor.create(body, {
                transaction,
            })

            res.status(201).json(createSuccessResponse(vendor))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
