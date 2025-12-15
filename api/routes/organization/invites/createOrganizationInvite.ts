import { db, invites } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';

/**
 * @openapi
 * /organizations/{org_id}/invites:
 *   post:
 *     summary: Create an invite for an organization
 *     tags: [Invites]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Invite created
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const forOrganizationMemberID = req.body.ForOrganizationMemberId

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (forOrganizationMemberID && !isValidUUID(forOrganizationMemberID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const body = {
            ...pick(req.body, ['maxUses']),
            organizationId: orgID,
            updatedByUserId: req.auth.id,
            email: req.body.email,
            token: req.body.token || Math.random().toString(36).substring(7),
            role: req.body.role || 'member'
        }

        const [invite] = await db.insert(invites).values(body).returning();

        return res.status(201).json(createSuccessResponse(invite))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

