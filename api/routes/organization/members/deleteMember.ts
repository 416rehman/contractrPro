import { db, organizationMembers } from '../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/members/{member_id}:
 *   delete:
 *     summary: Remove a member from an organization
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
 *         description: Member removed
 *       400:
 *         description: Invalid ID or not found
 */
export default async (req, res) => {
    try {
        if (!req.params.org_id || !isValidUUID(req.params.org_id)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }
        if (!req.params.member_id || !isValidUUID(req.params.member_id)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const deletedRows = await db.delete(organizationMembers)
            .where(and(eq(organizationMembers.id, req.params.member_id), eq(organizationMembers.organizationId, req.params.org_id)))
            .returning();

        if (!deletedRows.length) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(null))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

