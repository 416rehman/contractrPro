const {
    sequelize,
    Invite,
    Organization,
    OrganizationMember,
} = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const { isValidInviteCode } = require('../../utils')

// Joins an organization by invite
module.exports = async (req, res) => {
    try {
        const inviteID = req.params.invite_id

        if (!inviteID || !isValidInviteCode(inviteID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invite ID required'))
        }

        const invite = await Invite.findOne({
            where: { id: inviteID },
        })

        if (!invite) {
            return res.status(404).json(createErrorResponse('Invite not found'))
        }

        const organization = await Organization.findOne({
            where: { id: invite.OrganizationId },
        })

        if (!organization) {
            return res
                .status(404)
                .json(createErrorResponse('Organization not found'))
        }

        await sequelize.transaction(async (transaction) => {
            if (invite.uses >= invite.maxUses) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            'Invite has been used too many times'
                        )
                    )
            }

            if (invite.ForOrganizationMemberId) {
                // if the invite is for a specific member, make sure that member still exists
                const member = await OrganizationMember.findOne({
                    where: {
                        id: invite.ForOrganizationMemberId,
                        OrganizationId: invite.OrganizationId,
                    },
                    transaction,
                })

                if (!member) {
                    return res
                        .status(404)
                        .json(
                            createErrorResponse(
                                'The member this invite is for no longer exists'
                            )
                        )
                }

                if (member.UserId) {
                    return res
                        .status(400)
                        .json(
                            createErrorResponse(
                                'The member this invite is for has already joined'
                            )
                        )
                }

                await member.update({ UserId: req.auth.id }, { transaction })
            } else {
                // if the invite is not for a specific member, create a new member
                await OrganizationMember.create(
                    {
                        name: req.auth.username,
                        OrganizationId: invite.OrganizationId,
                        UserId: req.auth.id,
                        updatedByUserId: req.auth.id,
                    },
                    { transaction }
                )
            }

            // update the invite uses
            await invite.update({ uses: invite.uses + 1 }, { transaction })

            return res.status(200).json(createSuccessResponse(organization))
        })
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Error joining organization', err))
    }
}