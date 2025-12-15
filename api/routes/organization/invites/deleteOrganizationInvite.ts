import { db, invites } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidInviteCode } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invites/{invite_id}:
 *   delete:
 *     summary: Delete an invite
 *     tags: [Invites]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: invite_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite deleted
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const inviteID = req.params.invite_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!inviteID || !isValidInviteCode(inviteID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const deletedRows = await db.delete(invites)
            .where(and(eq(invites.id, inviteID), eq(invites.organizationId, orgID)))
            .returning();

        return res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

