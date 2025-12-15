import { db, clients } from '../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/clients:
 *   get:
 *     summary: Get all clients for an organization
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of clients
 *       400:
 *         description: Invalid org ID
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const clientList = await db.query.clients.findMany({
            where: eq(clients.organizationId, orgId)
        })

        res.status(200).json(createSuccessResponse(clientList))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

