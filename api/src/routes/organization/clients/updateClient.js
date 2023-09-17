const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const prisma = require('../../../prisma')
const { zClient } = require('../../../validators/client.zod')

// Updates an organization's client by ID
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id

        if (!clientId) throw new Error('Client ID is required')
        const data = zClient.parse(req.body)
        const include = {}
        if (req.body.Address) {
            data.Address = {
                update: req.body.Address,
            }
            include.Address = true
        }

        data.organizationId = orgId
        data.updatedByUserId = req.auth.id

        const client = await prisma.client.update({
            where: {
                id: clientId,
                organizationId: orgId,
            },
            data,
            include,
        })
        return res.status(200).json(createSuccessResponse(client))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}