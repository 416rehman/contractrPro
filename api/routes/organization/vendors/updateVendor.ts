import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';
import { db, vendors } from '../../../db';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}:
 *   patch:
 *     summary: Update a vendor
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
 *         description: Vendor updated
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
        const body = {
            ...pick(req.body, ['name', 'phone', 'email', 'website', 'description']),
            updatedByUserId: req.auth.id,
        }

        const [updatedVendor] = await db.update(vendors)
            .set(body)
            .where(and(eq(vendors.id, vendorId), eq(vendors.organizationId, orgId)))
            .returning();

        if (!updatedVendor) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(updatedVendor))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

