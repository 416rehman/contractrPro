import { db, invites, organizations, organizationMembers } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { isValidInviteCode } from '../../utils';
import { eq, and } from 'drizzle-orm';

// Joins an organization by invite
export default async (req, res) => {
    try {
        const inviteID = req.params.invite_id

        if (!inviteID || !isValidInviteCode(inviteID)) {
            return res.status(400).json(createErrorResponse('Invite ID required'))
        }

        const invite = await db.query.invites.findFirst({
            where: eq(invites.id, inviteID)
        })

        if (!invite) {
            return res.status(404).json(createErrorResponse('Invite not found'))
        }

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, invite.organizationId)
        })

        if (!organization) {
            return res.status(404).json(createErrorResponse('Organization not found'))
        }

        await db.transaction(async (tx) => {
            if (invite.uses >= invite.maxUses) {
                return res.status(400).json(createErrorResponse('Invite has been used too many times'))
            }

            if (invite.forOrganizationMemberId) {
                // if the invite is for a specific member, make sure that member still exists
                const member = await tx.query.organizationMembers.findFirst({
                    where: and(
                        eq(organizationMembers.id, invite.forOrganizationMemberId),
                        eq(organizationMembers.organizationId, invite.organizationId)
                    )
                })

                if (!member) {
                    return res.status(404).json(createErrorResponse('The member this invite is for no longer exists'))
                }

                if (member.userId) {
                    return res.status(400).json(createErrorResponse('The member this invite is for has already joined'))
                }

                await tx.update(organizationMembers)
                    .set({ userId: req.auth.id })
                    .where(eq(organizationMembers.id, member.id));
            } else {
                // if the invite is not for a specific member, create a new member
                await tx.insert(organizationMembers).values({
                    name: req.auth.username,
                    organizationId: invite.organizationId,
                    userId: req.auth.id,
                    updatedByUserId: req.auth.id,
                });
            }

            // update the invite uses
            await tx.update(invites)
                .set({ uses: invite.uses + 1 })
                .where(eq(invites.id, invite.id));

            return res.status(200).json(createSuccessResponse(organization))
        })
    } catch (err) {
        return res.status(500).json(createErrorResponse('Error joining organization', err))
    }
}
