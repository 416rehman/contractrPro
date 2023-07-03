const { sequelize, Invite } = require('../../../db')

const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')

const { isValidUUID } = require('../../../utils/isvalidUUID')

// Gets the organization's invites
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const organizationInvites = await Invite.findAll({
                attributes: {
                    exclude: [
                        'organization_id',
                    ],
                },
                where: {
                    OrganizationId: orgID,
                }, 
                transaction,
            })

            if (!organizationInvites || organizationInvites.length === 0) {
                return res
                .status(400)
                .json(createErrorResponse('Organization not found'))
            }

            return res.status(200).json(createSuccessResponse(organizationInvites))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message))
    }
}