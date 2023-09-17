const prisma = require('../../../prisma')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Gets the organization's invite by ID
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const inviteID = req.params.invite_id

        if (!orgID) throw new Error('Organization ID required')
        if (!inviteID) throw new Error('Organization invite ID required')

        const invite = await prisma.invite.findUnique({
            where: {
                id: inviteID,
                organizationId: orgID,
            },
        })

        if (!invite) throw new Error('Organization invite not found')

        return res.status(200).json(createSuccessResponse(invite))
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Error getting organization invite', err))
    }
}