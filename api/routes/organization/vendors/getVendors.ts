import { db, vendors } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/vendors:
 *   get:
 *     summary: Get all vendors for an organization
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of vendors
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const vendorsList = await db.query.vendors.findMany({
            where: eq(vendors.organizationId, orgId)
        })

        return res.status(200).json(createSuccessResponse(vendorsList))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

