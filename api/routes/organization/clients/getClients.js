const { Client, Address } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Get organization clients
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const clients = await Client.findAll({
            where: {
                OrganizationId: orgId,
            },
            include: {
                model: Address,
            },
        })

        res.status(200).json(createSuccessResponse(clients))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
