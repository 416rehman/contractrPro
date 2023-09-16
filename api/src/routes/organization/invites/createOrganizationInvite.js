const { sequelize, Invite, Organization } = require('../../../../db')
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
        const forOrganizationMemberID = req.body.ForOrganizationMemberId

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        if (forOrganizationMemberID && !isValidUUID(forOrganizationMemberID)) {
            return res
                .status(400)
                .json(
                    createErrorResponse(
                        'ForOrganizationMemberId must be a valid UUID'
                    )
                )
        }

        const body = {
            ...pick(req.body, ['maxUses']),
            ForOrganizationMemberId: forOrganizationMemberID || null,
            OrganizationId: orgID,
            UpdatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const invite = await Invite.create(body, { transaction })
            const organization = await Organization.findOne({
                where: { id: orgID },
                transaction,
            })
            await organization.addInvite(invite, { transaction })

            return res.status(201).json(createSuccessResponse(invite))
        })
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Error creating invite', err))
    }
}
