import { db, organizationMembers } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';
import { getRolePermissions } from '../../../utils/permissions';
import { OrgRole } from '../../../db/enums';

/**
 * @openapi
 * /organizations/{org_id}/members/{member_id}:
 *   get:
 *     summary: Get a single member
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
 *         description: Member details
 *       400:
 *         description: Invalid ID or not found
 *       403:
 *         description: Unauthorized
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

        const organizationMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.id, memberId))
        })

        if (!organizationMember) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        const permissions = getRolePermissions(organizationMember.role as OrgRole);

        return res.status(200).json(createSuccessResponse({
            ...organizationMember,
            permissions: permissions.toString()
        }))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

