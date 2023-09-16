// Add client to organization
const { Client, sequelize } = require('../../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils')

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
                'email',
                'phone',
                'website',
                'description',
            ]),
            OrganizationId: orgId,
            UpdatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const client = await Client.create(body, { transaction })
            return res.status(201).json(createSuccessResponse(client))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
