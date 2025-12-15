import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { db, invoices, comments, attachments } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const attachmentId = req.params.attachment_id
        const commentId = req.params.comment_id
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!attachmentId || !isValidUUID(attachmentId)) return res.status(400).json(createErrorResponse('Invalid attachment id.'))
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

            // Remove the attachment
            const deleted = await tx.delete(attachments)
                .where(and(
                    eq(attachments.id, attachmentId),
                    eq(attachments.commentId, commentId)
                ))
                .returning();

            if (deleted.length > 0) {
                const comment = await tx.query.comments.findFirst({
                    where: eq(comments.id, commentId),
                    with: {
                        attachments: true
                    }
                });

                if (comment) {
                    if ((!comment.content || comment.content.trim() === '') && comment.attachments.length === 0) {
                        await tx.delete(comments).where(eq(comments.id, commentId));
                    }
                }
            }

            return res.json(createSuccessResponse(deleted.length))
        })

    } catch (error) {
        return res.status(400).json(createErrorResponse('An error occurred.', error))
    }
}
