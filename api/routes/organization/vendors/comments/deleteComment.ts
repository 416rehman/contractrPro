import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, vendors, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a vendor comment
 *     tags: [VendorComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const vendorId = req.params.vendor_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!vendorId || !isValidUUID(vendorId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        await db.transaction(async (tx) => {
            const vendor = await tx.query.vendors.findFirst({ where: and(eq(vendors.id, vendorId), eq(vendors.organizationId, orgId)) })
            if (!vendor) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            await tx.delete(comments).where(and(eq(comments.id, commentId), eq(comments.vendorId, vendorId), eq(comments.organizationId, orgId))).returning();
            return res.status(200).json(createSuccessResponse(null))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
