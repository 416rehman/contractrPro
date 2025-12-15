import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';
import { db, organizationMembers } from '../../../db';
import { eq, and } from 'drizzle-orm';
import { OrgRole } from '../../../db/enums';
import { canAssignRole } from '../../../utils/permissions';

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [owner, manager, supervisor, worker, subcontractor]
 *     responses:
 *       200:
 *         description: Member updated
 *       400:
 *         description: Invalid ID or not found
 *       403:
 *         description: Insufficient permissions
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

        const updates: any = {
            ...pick(req.body, ['name', 'email', 'phone', 'website', 'description']),
            updatedByUserId: req.auth.id,
        }

        if (req.body.role) {
            const role = req.body.role as OrgRole;
            if (!Object.values(OrgRole).includes(role)) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, "Invalid role"));
            }

            const requesterRole = (req as any).orgMember.role as OrgRole;
            if (!canAssignRole(requesterRole, role)) {
                return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED, "Insufficient permissions to assign this role"));
            }
            updates.role = role;
        }

        const [updatedMember] = await db.update(organizationMembers)
            .set(updates)
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

