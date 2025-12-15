import { db, invites } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { OrgRole } from '../../../db/enums';

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address to invite
 *               role:
 *                 type: string
 *                 enum: [owner, manager, supervisor, worker, subcontractor]
 *                 description: The role to assign to the invitee
 *               maxUses:
 *                 type: integer
 *                 description: The maximum number of times the invite can be used
 *               reservedMemberId:
 *                 type: string
 *                 description: The ID of an existing non-controlled/stale organization member to link to the invitee. When they accept the invite, they will gain ownership of this organization member.
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Invite created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const reservedMemberId = req.body.reservedMemberId

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (reservedMemberId && !isValidUUID(reservedMemberId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        if (req.body.token && req.body.token.length < 7) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, "Invalid token"));
        }

        const role = req.body.role;
        if (role && !Object.values(OrgRole).includes(role)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_VALUE, "Invalid role"));
        }

        const body = {
            ...pick(req.body, ['maxUses']),
            organizationId: orgID,
            updatedByUserId: req.auth.id,
            email: req.body.email,
            token: req.body.token || Math.random().toString(36).substring(7),
            reservedMemberId: reservedMemberId,
            role: role || OrgRole.Worker
        }

        const [invite] = await db.insert(invites).values(body).returning();

        return res.status(201).json(createSuccessResponse(invite))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

