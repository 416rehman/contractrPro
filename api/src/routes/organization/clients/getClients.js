const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets all of the organization's clients
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        const clients = await prisma.vendor.findMany({
            where: {
                organizationId: orgId,
            },
        })

        return res.status(200).json(createSuccessResponse(clients))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}