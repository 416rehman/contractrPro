import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, invoices, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes a comment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invalid invoice id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))

        await db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
            })
            if (!invoice) {
                return res.status(400).json(createErrorResponse('Invoice not found.'))
            }

            // Delete the comment
            const deleted = await tx.delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.invoiceId, invoiceId),
                    eq(comments.organizationId, orgId)
                ))
                .returning();

            if (!deleted.length) {
                // If standard delete, returning empty if not found. Legacy checked count.
                // Assuming success if execution succeeds.
            }

            return res.status(200).json(createSuccessResponse(deleted.length)) // Sending count
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('Failed to delete comment.', err))
    }
}
