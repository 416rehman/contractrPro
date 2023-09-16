const { sequelize, Invite } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidInviteCode } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Deletes an organization's invite
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const inviteID = req.params.invite_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        if (!inviteID || !isValidInviteCode(inviteID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invite ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const invite = await Invite.destroy({
                where: { id: inviteID, OrganizationId: orgID },
                transaction,
            })

            return res.status(200).json(createSuccessResponse(invite))
        })
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Error deleting invite', err))
    }
}
