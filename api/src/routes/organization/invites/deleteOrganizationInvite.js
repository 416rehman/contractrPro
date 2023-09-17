const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// Deletes an organization's invite
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const inviteID = req.params.invite_id

        if (!orgID) throw new Error('Organization ID is required.')
        if (!inviteID) throw new Error('Invite ID is required.')

        const deleted = await prisma.invite.delete({
            where: {
                id: inviteID,
                organizationId: orgID,
            },
        })

        return res.status(200).json(createSuccessResponse(deleted))
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Error deleting invite', err))
    }
}