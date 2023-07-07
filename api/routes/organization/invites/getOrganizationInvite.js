const { sequelize, Invite } = require('../../../db')
const { isValidUUID } = require('../../../utils/isValidUUID')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidInviteCode } = require('../../../utils')

// Gets the organization's invite by ID
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
            const invite = await Invite.findOne({
                where: { id: inviteID, OrganizationId: orgID },
                transaction,
            })

            if (!invite) {
                return res
                    .status(400)
                    .json(createErrorResponse('Organization invite not found'))
            }

            return res.status(200).json(createSuccessResponse(invite))
        })
    } catch (err) {
        return res
            .status(500)
            .json(
                createErrorResponse('Error getting organization invite by ID')
            )
    }
}
