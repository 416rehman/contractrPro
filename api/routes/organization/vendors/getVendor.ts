import { db, vendors } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}:
 *   get:
 *     summary: Get a single vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vendor_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const vendorId = req.params.vendor_id

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!vendorId || !isValidUUID(vendorId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const vendor = await db.query.vendors.findFirst({
            where: and(eq(vendors.organizationId, orgId), eq(vendors.id, vendorId))
        })

        if (!vendor) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(vendor))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

