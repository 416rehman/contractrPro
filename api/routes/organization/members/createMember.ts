import { db, organizationMembers } from '../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';

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
 *     responses:
 *       201:
 *         description: Member created
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['name', 'email', 'phone', 'permissions', 'UserId']),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
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

