import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';
import { db, organizationMembers } from '../../../db';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/members/{member_id}:
 *   patch:
 *     summary: Update a member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: member_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member updated
 *       400:
 *         description: Invalid ID or not found
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const memberId = req.params.member_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }
        if (!memberId || !isValidUUID(memberId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        const body = {
            ...pick(req.body, ['name', 'email', 'phone', 'website', 'description']),
            updatedByUserId: req.auth.id,
        }

        const [updatedMember] = await db.update(organizationMembers)
            .set(body)
            .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)))
            .returning();

        if (!updatedMember) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(updatedMember))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

