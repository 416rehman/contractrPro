const prisma = require('../../../prisma')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's invite by ID
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID) throw new Error('Organization ID required')

        const invites = await prisma.invite.findMany({
            where: {
                organizationId: orgID,
            },
        })

        if (!invites) throw new Error('Organization invites not found')

        return res.status(200).json(createSuccessResponse(invites))
    } catch (err) {
        return res
            .status(400)
            .json(
                createErrorResponse('Error getting organization invites', err)
            )
    }
}