import { db, vendors } from '../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';

/**
 * @openapi
 * /organizations/{org_id}/vendors:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Vendor created
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['name', 'phone', 'email', 'website', 'description']),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        const [vendor] = await db.insert(vendors).values(body).returning();
        res.status(201).json(createSuccessResponse(vendor))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

