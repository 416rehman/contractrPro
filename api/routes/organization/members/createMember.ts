import { db, organizationMembers } from '../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { OrgRole } from '../../../db/enums';
import { canAssignRole } from '../../../utils/permissions';

/**
 * @openapi
 * /organizations/{org_id}/members:
 *   post:
 *     summary: Add a member to an organization
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: org_id
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
 *       201:
 *         description: Member created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const role = req.body.role || OrgRole.Worker;
        if (!Object.values(OrgRole).includes(role)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, "Invalid role"));
        }

        const requesterRole = (req as any).orgMember.role as OrgRole;
        if (!canAssignRole(requesterRole, role)) {
            return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED, "Insufficient permissions to assign this role"));
        }

        const body = {
            ...pick(req.body, ['name', 'email', 'phone', 'permissions', 'UserId']),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
            role: role
        }

        if (body.UserId) {
            (body as any).userId = body.UserId;
            delete (body as any).UserId;
        }

        const [member] = await db.insert(organizationMembers).values(body).returning();

        res.status(201).json(createSuccessResponse(member))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

