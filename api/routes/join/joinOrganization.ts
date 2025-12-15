import { db, invites, organizations, organizationMembers } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { isValidInviteCode } from '../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /join/{invite_id}:
 *   post:
 *     summary: Join an organization via invite code
 *     tags: [Invites]
 *     parameters:
 *       - in: path
 *         name: invite_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joined organization
 *       400:
 *         description: Invalid invite
 *       404:
 *         description: Invite or org not found
 */
export default async (req, res) => {
    try {
        const inviteID = req.params.invite_id

        if (!inviteID || !isValidInviteCode(inviteID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const invite = await db.query.invites.findFirst({
            where: eq(invites.id, inviteID)
        })

        if (!invite) {
            return res.status(404).json(createErrorResponse(ErrorCode.INVITE_NOT_FOUND))
        }

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, invite.organizationId)
        })

        if (!organization) {
            return res.status(404).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
        }

        await db.transaction(async (tx) => {
            if (invite.uses >= invite.maxUses) {
                return res.status(400).json(createErrorResponse(ErrorCode.INVITE_MAX_USES))
            }

            if (invite.reservedMemberId) {
                const member = await tx.query.organizationMembers.findFirst({
                    where: and(
                        eq(organizationMembers.id, invite.reservedMemberId),
                        eq(organizationMembers.organizationId, invite.organizationId)
                    )
                })

                if (!member) {
                    return res.status(404).json(createErrorResponse(ErrorCode.INVITE_MEMBER_NOT_FOUND))
                }

                if (member.userId) {
                    return res.status(400).json(createErrorResponse(ErrorCode.INVITE_ALREADY_JOINED))
                }

                await tx.update(organizationMembers)
                    .set({ userId: req.auth.id })
                    .where(eq(organizationMembers.id, member.id));
            } else {
                await tx.insert(organizationMembers).values({
                    name: req.auth.username,
                    organizationId: invite.organizationId,
                    userId: req.auth.id,
                    updatedByUserId: req.auth.id,
                });
            }

            await tx.update(invites)
                .set({ uses: invite.uses + 1 })
                .where(eq(invites.id, invite.id));

            return res.status(200).json(createSuccessResponse(organization))
        })
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

