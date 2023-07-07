const { sequelize, Invite } = require('../../../db')

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

const { isValidUUID } = require('../../../utils/isValidUUID')

// Gets the organization's invite
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const invites = await Invite.findAll({
                where: {
                    OrganizationId: orgID,
                },
                transaction,
            })

            if (!invites) {
                return res
                    .status(400)
                    .json(createErrorResponse('Organization not found'))
            }

            return res.status(200).json(createSuccessResponse(invites))
        })
    } catch (err) {
        return res
            .status(500)
            .json(
                createErrorResponse(
                    'Error getting organization invites',
                    err.message
                )
            )
    }
}
