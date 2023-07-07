const { Client } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Get organization client
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!clientId || !isValidUUID(clientId)) {
            return res
                .status(400)
                .json(createErrorResponse('Client ID is required'))
        }

        const client = await Client.findOne({
            where: {
                OrganizationId: orgId,
                id: clientId,
            },
        })

        if (!client) {
            return res.status(400).json(createErrorResponse('Client not found'))
        }

        res.status(200).json(createSuccessResponse(client))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
