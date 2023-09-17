// Add client to organization
const prisma = require('../../../prisma')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { zClient } = require('../../../validators/client.zod')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const data = zClient.parse(req.body)
        const include = {}
        if (req.body.Address) {
            data.Address = {
                create: req.body.Address,
            }
            include.Address = true
        }

        data.organizationId = orgId
        data.updatedByUserId = req.auth.id

        const client = await prisma.client.create({
            data,
            include,
        })
        return res.status(201).json(createSuccessResponse(client))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}