const { sequelize, Invite, Organization } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Creates an organization's invite
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const org = await Organization.findOne({
                where: {
                    id: orgID,
                },
                transaction,
            })

            if (!org) {
                return res
                    .status(400)
                    .json(createErrorResponse('Organization not found'))
            }

            const body = {
                ...pick(req.body, ['code', 'uses', 'maxUses']),
                created_by: req.auth.id,
                OrganizationId: orgID,
                organization_id: orgID,
                ownerId: req.auth.id,
                updatedByUserId: req.auth.id,
            }

            const createOrganizationInvite = await Invite.create(body, {
                include: {
                    model: Organization,
                    where: {
                        id: orgID,
                    },
                },
                transaction,
            })

            return res
                .status(201)
                .json(createSuccessResponse(createOrganizationInvite))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
