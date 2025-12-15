import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, invoices, invoiceEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/entries/{entry_id}:
 *   patch:
 *     summary: Update an invoice entry
 *     tags: [InvoiceEntries]
 *     responses:
 *       200:
 *         description: Invoice entry updated
 */
export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const invoiceEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!invoiceEntryId || !isValidUUID(invoiceEntryId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        await db.transaction(async (tx) => {
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
            })
            if (!invoice) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

            const [updatedInvoiceEntry] = await tx.update(invoiceEntries)
                .set({ ...pick(req.body, ['name', 'description', 'unitCost', 'quantity']) })
                .where(and(eq(invoiceEntries.invoiceId, invoiceId), eq(invoiceEntries.id, invoiceEntryId)))
                .returning();

            if (!updatedInvoiceEntry) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            res.status(200).json(createSuccessResponse(updatedInvoiceEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
