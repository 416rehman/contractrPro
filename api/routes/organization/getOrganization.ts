import { db, organizations } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 *       404:
 *         description: Organization not found
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, orgId),
        })

        if (!organization) {
            return res.status(404).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse([organization]))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

