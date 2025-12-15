import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, vendors, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes a comment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const vendorId = req.params.vendor_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!vendorId || !isValidUUID(vendorId)) return res.status(400).json(createErrorResponse('Invalid vendor id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))

        await db.transaction(async (tx) => {
            // make sure the vendor belongs to the org
            const vendor = await tx.query.vendors.findFirst({
                where: and(eq(vendors.id, vendorId), eq(vendors.organizationId, orgId))
            })
            if (!vendor) {
                return res.status(400).json(createErrorResponse('Vendor not found.'))
            }

            // Delete the comment
            const deleted = await tx.delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.vendorId, vendorId),
                    eq(comments.organizationId, orgId)
                ))
                .returning();

            if (!deleted.length) {
                // If standard delete, returning empty if not found. Legacy checked count.
            }

            return res.status(200).json(createSuccessResponse(deleted.length)) // Sending count
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('Failed to delete comment.', err))
    }
}
