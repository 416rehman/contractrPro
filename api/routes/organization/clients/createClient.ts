import { db, clients } from '../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';

/**
 * @openapi
 * /organizations/{org_id}/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Client created
 *       400:
 *         description: Invalid org ID
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['name', 'email', 'phone', 'website', 'description']),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        const [client] = await db.insert(clients).values(body).returning();
        return res.status(201).json(createSuccessResponse(client))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

