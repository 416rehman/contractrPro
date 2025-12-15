import { db, invoices, invoiceEntries } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const invoiceEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!invoiceEntryId || !isValidUUID(invoiceEntryId)) return res.status(400).json(createErrorResponse('InvoiceEntry ID is required'))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invoice ID is required'))

        await db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
            })
            if (!invoice) {
                // Return json response
                return res.status(400).json(createErrorResponse('Invoice not found'));
            }

            const deleted = await tx.delete(invoiceEntries)
                .where(and(
                    eq(invoiceEntries.invoiceId, invoiceId),
                    eq(invoiceEntries.id, invoiceEntryId)
                ))
                .returning();

            if (!deleted.length) {
                return res.status(400).json(createErrorResponse('InvoiceEntry not found'))
            }

            res.status(200).json(createSuccessResponse(deleted.length))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
