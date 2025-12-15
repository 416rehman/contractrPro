import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, invoices, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete an invoice comment
 *     tags: [InvoiceComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        await db.transaction(async (tx) => {
            const invoice = await tx.query.invoices.findFirst({ where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)) })
            if (!invoice) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            await tx.delete(comments).where(and(eq(comments.id, commentId), eq(comments.invoiceId, invoiceId), eq(comments.organizationId, orgId))).returning();
            return res.status(200).json(createSuccessResponse(null))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
