const { sequelize, Invite } = require('../../../db');
const { isValidUUID } = require('../../../utils/isvalidUUID');

const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')

// Gets the organization's invite by ID
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        const inviteID = req.params.invite_id;

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }
        else if (!inviteID || !isValidUUID(inviteID)) {
            return res
            .status(400)
            .json(createErrorResponse('Invite ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const orgInvite = await Invite.findOne({
                attributes: {
                    exclude: [
                        'organization_id'
                    ],
                },
                where: {
                    id: inviteID,
                    OrganizationId: orgID
                }, 
                transaction,
            })

            if (!orgInvite) {
                return res
                .status(400)
                .json(createErrorResponse('Not found'))
            }

            return res.status(200).json(createSuccessResponse(orgInvite))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message))
    }
}