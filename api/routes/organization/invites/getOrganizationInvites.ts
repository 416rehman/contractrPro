import { db, invites } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invites:
 *   get:
 *     summary: Get all invites for an organization
 *     tags: [Invites]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of invites
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const inviteList = await db.query.invites.findMany({
            where: eq(invites.organizationId, orgID)
        })

        return res.status(200).json(createSuccessResponse(inviteList))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

