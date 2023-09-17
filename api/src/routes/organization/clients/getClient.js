const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Get an organization's client by ID
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id

        if (!clientId) throw new Error('Client ID is required')

        const client = await prisma.client.findUnique({
            where: {
                id: clientId,
                organizationId: orgId,
            },
        })

        if (!client) throw new Error('Client not found')

        return res.status(200).json(createSuccessResponse(client))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}